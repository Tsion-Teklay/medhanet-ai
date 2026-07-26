import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';
import { startRecording, stopRecording } from '../services/voice';
import { useI18n } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';

let MapView = null;
let Marker = null;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default || Maps;
  Marker = Maps.Marker || Maps.default?.Marker;
} catch (e) {
  console.warn('react-native-maps native module not available:', e.message);
}

const CATEGORIES = ['All', 'Antibiotic', 'Analgesic', 'Chronic Care', 'Antimalarial', 'Gastro', 'Supplement'];

// Falls back to Addis Ababa (Bole) until the device shares its real position.
const DEFAULT_COORDS = { lat: 8.9945, lng: 38.7896, labelKey: 'home.defaultLocation' };

/**
 * Hand the destination to whatever navigation app the phone has. The native
 * schemes give turn-by-turn directly, and the https link is the universal
 * fallback that opens the Google Maps app or the browser.
 */
const openDirections = async (pharmacy, t) => {
  const { lat, lng, name } = pharmacy;
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  const nativeUrl = Platform.select({
    ios: `maps://app?daddr=${lat},${lng}&q=${encodeURIComponent(name)}`,
    android: `google.navigation:q=${lat},${lng}`,
  });

  try {
    if (nativeUrl && (await Linking.canOpenURL(nativeUrl))) {
      await Linking.openURL(nativeUrl);
      return;
    }
    await Linking.openURL(webUrl);
  } catch (err) {
    Alert.alert(t('home.cannotOpenDirections'), t('home.noMapsApp'));
  }
};

/** Search rows carry the pharmacy under prefixed keys; normalise to a pharmacy shape. */
const pharmacyFromResult = (r) => ({
  id: r.pharmacyId,
  name: r.pharmacyName,
  address: r.address,
  phone: r.phone,
  lat: r.lat,
  lng: r.lng,
  openTime: r.openTime,
  closeTime: r.closeTime,
  isOpen: r.isOpen,
  distanceKm: r.distanceKm,
});

const callPharmacy = (phone, t) => {
  Linking.openURL(`tel:${phone}`).catch(() =>
    Alert.alert(t('home.cannotCall'), t('home.dialManually', { phone }))
  );
};

export default function HomeScreen({ onOpenChat, onOpenPrescription }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('Amoxil');
  const [category, setCategory] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'score'
  const [selectedItem, setSelectedItem] = useState(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [assistNote, setAssistNote] = useState(null); // { kind, title, detail }
  const recordingRef = useRef(null);

  const performSearch = async (searchTerm = query, at = coords) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const data = await api.searchStock(searchTerm, at.lat, at.lng, 25);
      setResults(data.results || []);
    } catch (err) {
      console.warn('Search failed:', err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPharmacies = async (at) => {
    try {
      const data = await api.getAllPharmacies(at.lat, at.lng);
      setPharmacies(data.pharmacies || []);
    } catch (err) {
      console.warn('Failed to load pharmacy directory:', err.message);
    }
  };

  useEffect(() => {
    (async () => {
      let at = DEFAULT_COORDS;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          at = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            labelKey: 'home.currentLocation',
          };
          setCoords(at);
        }
      } catch (err) {
        console.warn('Location unavailable, using Addis Ababa default:', err.message);
      }
      loadPharmacies(at);
      performSearch(query, at);
    })();
  }, []);

  const filteredResults = results
    .filter((item) => {
      if (category === 'All') return true;
      return item.category?.toLowerCase() === category.toLowerCase();
    })
    .sort((a, b) =>
      sortBy === 'distance' ? a.distanceKm - b.distanceKm : b.score - a.score
    );

  // Pharmacies holding the current search hit get a highlighted pin.
  const matchByPharmacyId = new Map(filteredResults.map((r) => [r.pharmacyId, r]));

  /** Applies whatever the AI heard or saw as the active search. */
  const applyAssistedSearch = (data, note) => {
    if (!data.query) {
      setAssistNote({ kind: 'warn', ...note.empty });
      return;
    }
    setQuery(data.query);
    setResults(data.results || []);
    setCategory('All');
    setAssistNote({
      kind: 'ok',
      title: note.title(data),
      detail: note.detail(data),
    });
  };

  const startVoiceSearch = async () => {
    if (recordingRef.current) return;
    try {
      const recording = await startRecording();
      if (!recording) {
        setAssistNote({
          kind: 'warn',
          title: t('home.micBlocked'),
          detail: t('home.micBlockedDetail'),
        });
        return;
      }
      recordingRef.current = recording;
      setIsRecording(true);
      setAssistNote(null);
    } catch (err) {
      console.warn('Voice search recording error:', err.message);
      recordingRef.current = null;
      setIsRecording(false);
    }
  };

  const stopVoiceSearch = async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    // Clear the handle first so a failure cannot pin the native recorder.
    recordingRef.current = null;
    setIsRecording(false);
    setLoading(true);

    try {
      const { base64, mimeType } = await stopRecording(recording);
      const data = await api.voiceSearch(base64, mimeType, coords.lat, coords.lng);

      applyAssistedSearch(data, {
        empty: {
          title: t('home.noMedicineHeard'),
          detail: data.transcript
            ? t('home.heardButNoMedicine', { transcript: data.transcript })
            : t('home.holdMicHint'),
        },
        title: (d) => t('home.heard', { query: d.query }),
        detail: (d) => (d.transcript ? `"${d.transcript}"` : ''),
      });
    } catch (err) {
      console.warn('Voice search failed:', err.message);
      setAssistNote({
        kind: 'warn',
        title: t('home.voiceUnavailable'),
        detail: t('home.voiceUnavailableDetail'),
      });
    } finally {
      setLoading(false);
    }
  };

  const searchByPhoto = async (fromCamera) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t('common.permissionNeeded'),
          t('home.photoPermission', {
            kind: fromCamera ? t('common.camera') : t('common.photo'),
          })
        );
        return;
      }

      const options = { mediaTypes: ['images'], quality: 0.6, base64: true };
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled) return;

      const asset = result.assets[0];
      setLoading(true);
      setAssistNote(null);

      const data = await api.identifyMedicine(
        asset.base64,
        asset.mimeType || 'image/jpeg',
        coords.lat,
        coords.lng
      );

      applyAssistedSearch(data, {
        empty: {
          title: t('home.couldNotIdentify'),
          detail: data.identified?.notes || t('home.couldNotIdentifyDetail'),
        },
        title: (d) => t('home.identified', { name: d.identified?.name || d.query }),
        detail: (d) =>
          [d.identified?.strength, d.identified?.form, d.identified?.notes]
            .filter(Boolean)
            .join(' • '),
      });
    } catch (err) {
      console.warn('Photo search failed:', err.message);
      setAssistNote({
        kind: 'warn',
        title: t('home.photoUnavailable'),
        detail: t('home.photoUnavailableDetail'),
      });
    } finally {
      setLoading(false);
    }
  };

  const promptForPhotoSearch = () => {
    Alert.alert(t('home.photoSearchTitle'), t('home.photoSearchPrompt'), [
      { text: t('common.takePhoto'), onPress: () => searchByPhoto(true) },
      { text: t('common.chooseGallery'), onPress: () => searchByPhoto(false) },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const openPharmacySheet = (pharmacy, match = null) => {
    setSelectedPharmacy({ ...pharmacy, match: match || matchByPharmacyId.get(pharmacy.id) });
  };

  const handleReserveConfirm = async () => {
    if (!selectedItem) return;
    setReserving(true);
    try {
      const reservation = await api.createReservation(selectedItem.inventoryId, reserveQty);
      setCreatedReservation(reservation);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || t('home.reservationFailed');
      Alert.alert(t('home.reservationError'), msg);
    } finally {
      setReserving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.appTitle}>መድሃኔት AI</Text>
          <Text style={styles.locationTag}>
            📍 {t(coords.labelKey)} • {t('home.pharmacyCount', { count: pharmacies.length })}
          </Text>
        </View>
        <View style={styles.quickActions}>
          <LanguageToggle style={styles.headerLanguageToggle} />
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenPrescription}>
            <Text style={styles.iconBtnText}>{t('home.rxScan')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.chatBtn]} onPress={onOpenChat}>
            <Text style={styles.chatBtnText}>{t('home.aiDoctor')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={isRecording ? t('home.listening') : t('home.searchPlaceholder')}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setAssistNote(null);
              if (text.length >= 2) performSearch(text);
            }}
            placeholderTextColor="#94a3b8"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setAssistNote(null); }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.assistBtn, isRecording && styles.assistBtnRecording]}
            onPressIn={startVoiceSearch}
            onPressOut={stopVoiceSearch}
          >
            <Text style={styles.assistBtnText}>{isRecording ? '🔴' : '🎙️'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.assistBtn} onPress={promptForPhotoSearch}>
            <Text style={styles.assistBtnText}>📷</Text>
          </TouchableOpacity>
        </View>

        {assistNote && (
          <View
            style={[
              styles.assistNote,
              assistNote.kind === 'warn' ? styles.assistNoteWarn : styles.assistNoteOk,
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.assistNoteTitle}>{assistNote.title}</Text>
              {!!assistNote.detail && (
                <Text style={styles.assistNoteDetail}>{assistNote.detail}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setAssistNote(null)}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                {t(`categories.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Control */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>{t('home.sortBy')}</Text>
        <TouchableOpacity
          style={[styles.sortChip, sortBy === 'distance' && styles.sortChipActive]}
          onPress={() => setSortBy('distance')}
        >
          <Text style={[styles.sortChipText, sortBy === 'distance' && styles.sortChipTextActive]}>
            {t('home.nearest')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortChip, sortBy === 'score' && styles.sortChipActive]}
          onPress={() => setSortBy('score')}
        >
          <Text style={[styles.sortChipText, sortBy === 'score' && styles.sortChipTextActive]}>
            {t('home.bestValue')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Mode Switcher Header */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>
          {t('home.nearbyOptions', { count: filteredResults.length })}
        </Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleOption, viewMode === 'list' && styles.toggleOptionActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              {t('home.list')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, viewMode === 'map' && styles.toggleOptionActive]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
              {t('home.map')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List or Map View */}
      {/* The map flags the whole network, so it does not wait on the search request. */}
      {viewMode === 'map' ? (
        <View style={styles.mapWrapper}>
          <View style={styles.mapLegend}>
            <Text style={styles.legendItem}>
              {t('home.legendHas', { query: query || t('home.legendFallbackMedicine') })}
            </Text>
            <Text style={styles.legendItem}>{t('home.legendRegistered')}</Text>
          </View>

          {MapView && Marker ? (
            <MapView
              // Remount when the GPS fix lands so the map re-centres on the user
              // instead of staying on the Addis Ababa fallback.
              key={`${coords.lat},${coords.lng}`}
              style={styles.map}
              showsUserLocation
              initialRegion={{
                latitude: coords.lat,
                longitude: coords.lng,
                latitudeDelta: 0.12,
                longitudeDelta: 0.12,
              }}
            >
              {pharmacies.map((pharmacy) => {
                const match = matchByPharmacyId.get(pharmacy.id);
                return (
                  <Marker
                    key={pharmacy.id}
                    coordinate={{ latitude: pharmacy.lat, longitude: pharmacy.lng }}
                    title={pharmacy.name}
                    description={
                      match
                        ? `${match.medicineName} • ${t('home.currency', {
                            price: match.price,
                          })} • ${t('home.kmShort', { km: pharmacy.distanceKm })}`
                        : `${t('home.kmShort', { km: pharmacy.distanceKm })} • ${
                            pharmacy.isOpen ? t('common.openNow') : t('common.closed')
                          }`
                    }
                    pinColor={match ? '#16a34a' : '#2563eb'}
                    onCalloutPress={() => openPharmacySheet(pharmacy, match)}
                    onPress={() => openPharmacySheet(pharmacy, match)}
                  />
                );
              })}
            </MapView>
          ) : (
            // Native maps are unavailable in some clients, so fall back to a
            // tappable proximity-ordered directory rather than a dead panel.
            <FlatList
              data={pharmacies}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listPadding}
              ListHeaderComponent={
                <Text style={styles.fallbackNote}>
                  {t('home.mapUnavailable', { count: pharmacies.length })}
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.pharmacyRowCard} onPress={() => openPharmacySheet(item)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pharmacyName}>
                      {matchByPharmacyId.has(item.id) ? '🟢' : '🔵'} {item.name}
                    </Text>
                    <Text style={styles.addressText}>{item.address}</Text>
                  </View>
                  <View style={styles.badgeCol}>
                    <Text style={styles.distanceText}>
                      {t('home.kmShort', { km: item.distanceKm })}
                    </Text>
                    <Text style={item.isOpen ? styles.openNow : styles.closedNow}>
                      {item.isOpen ? t('common.open') : t('common.closed')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      ) : loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#006b2c" />
          <Text style={styles.loadingText}>{t('home.searching')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredResults}
          keyExtractor={(item, index) => item.inventoryId || index.toString()}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>{t('home.noResults')}</Text>
              <Text style={styles.emptySub}>{t('home.noResultsSub')}</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.medicineName}>{item.medicineName}</Text>
                  <Text style={styles.genericName}>{item.genericName} • {item.strength}</Text>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{t('home.currency', { price: item.price })}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.pharmacyRow}
                onPress={() => openPharmacySheet(pharmacyFromResult(item), item)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.pharmacyName}>🏥 {item.pharmacyName}</Text>
                  <Text style={styles.addressText}>{item.address}</Text>
                  <Text style={styles.hoursText}>
                    🕒 {item.openTime} - {item.closeTime} •{' '}
                    <Text style={item.isOpen ? styles.openNow : styles.closedNow}>
                      {item.isOpen ? t('common.openNow') : t('common.closed')}
                    </Text>
                  </Text>
                </View>
                <View style={styles.badgeCol}>
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockBadgeText}>
                      {t('home.inStock', { count: item.quantity })}
                    </Text>
                  </View>
                  <Text style={styles.distanceText}>
                    {t('home.kmAway', { km: item.distanceKm })}
                  </Text>
                  {sortBy === 'distance' && index === 0 && (
                    <Text style={styles.nearestTag}>{t('home.nearestToYou')}</Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.directionsBtn}
                  onPress={() => openDirections(pharmacyFromResult(item), t)}
                >
                  <Text style={styles.directionsBtnText}>{t('home.directions')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.reserveBtn}
                  onPress={() => {
                    setSelectedItem(item);
                    setReserveQty(1);
                    setCreatedReservation(null);
                  }}
                >
                  <Text style={styles.reserveBtnText}>{t('home.reserve')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Pharmacy Detail & Directions Sheet */}
      {selectedPharmacy && (
        <Modal animationType="slide" transparent visible={true} onRequestClose={() => setSelectedPharmacy(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>🏥 {selectedPharmacy.name}</Text>
              <Text style={styles.modalSub}>{selectedPharmacy.address}</Text>

              <View style={styles.pharmacyMetaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>
                    {t('home.kmAway', { km: selectedPharmacy.distanceKm })}
                  </Text>
                </View>
                <View style={[styles.metaPill, selectedPharmacy.isOpen ? styles.metaOpen : styles.metaClosed]}>
                  <Text style={styles.metaPillText}>
                    {selectedPharmacy.isOpen ? `🟢 ${t('common.openNow')}` : `🔴 ${t('common.closed')}`}
                  </Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>
                    🕒 {selectedPharmacy.openTime} - {selectedPharmacy.closeTime}
                  </Text>
                </View>
              </View>

              {selectedPharmacy.match && (
                <View style={styles.matchBox}>
                  <Text style={styles.matchTitle}>
                    {t('home.hasMedicine', {
                      name: selectedPharmacy.match.medicineName,
                      strength: selectedPharmacy.match.strength,
                    })}
                  </Text>
                  <Text style={styles.matchSub}>
                    {t('home.stockLine', {
                      price: selectedPharmacy.match.price,
                      count: selectedPharmacy.match.quantity,
                    })}
                  </Text>
                  <TouchableOpacity
                    style={styles.matchReserveBtn}
                    onPress={() => {
                      const match = selectedPharmacy.match;
                      setSelectedPharmacy(null);
                      setSelectedItem(match);
                      setReserveQty(1);
                      setCreatedReservation(null);
                    }}
                  >
                    <Text style={styles.matchReserveText}>{t('home.reserve')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.primaryDirectionsBtn}
                onPress={() => openDirections(selectedPharmacy, t)}
              >
                <Text style={styles.primaryDirectionsText}>{t('home.getDirections')}</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setSelectedPharmacy(null)}
                >
                  <Text style={styles.cancelModalText}>{t('common.close')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => callPharmacy(selectedPharmacy.phone, t)}
                >
                  <Text style={styles.callBtnText}>
                    {t('home.call', { phone: selectedPharmacy.phone })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Reservation Confirmation Modal */}
      {selectedItem && (
        <Modal animationType="slide" transparent visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {!createdReservation ? (
                <>
                  <Text style={styles.modalTitle}>{t('home.confirmReservation')}</Text>
                  <Text style={styles.modalSub}>
                    {t('home.holdStock', { name: selectedItem.pharmacyName })}
                  </Text>

                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalMedName}>{selectedItem.medicineName}</Text>
                    <Text style={styles.modalMedSub}>{selectedItem.genericName} • {selectedItem.strength}</Text>

                    <View style={styles.qtyRow}>
                      <Text style={styles.qtyLabel}>{t('home.quantity')}</Text>
                      <View style={styles.counterRow}>
                        <TouchableOpacity
                          style={styles.counterBtn}
                          onPress={() => setReserveQty(Math.max(1, reserveQty - 1))}
                        >
                          <Text style={styles.counterBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{reserveQty}</Text>
                        <TouchableOpacity
                          style={styles.counterBtn}
                          onPress={() => setReserveQty(Math.min(selectedItem.quantity, reserveQty + 1))}
                        >
                          <Text style={styles.counterBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.totalLabel}>{t('home.totalPayable')}</Text>
                      <Text style={styles.totalValue}>
                        {t('home.currency', {
                          price: (selectedItem.price * reserveQty).toFixed(2),
                        })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.cancelModalBtn}
                      onPress={() => setSelectedItem(null)}
                    >
                      <Text style={styles.cancelModalText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmModalBtn}
                      onPress={handleReserveConfirm}
                      disabled={reserving}
                    >
                      {reserving ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.confirmModalText}>{t('home.confirmOtp')}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.successIconBox}>
                    <Text style={styles.successIcon}>✅</Text>
                  </View>
                  <Text style={styles.successTitle}>{t('home.stockReserved')}</Text>
                  <Text style={styles.successSub}>{t('home.showOtpToPharmacist')}</Text>

                  <View style={styles.otpCard}>
                    <Text style={styles.otpLabel}>{t('home.otpLabel')}</Text>
                    <Text style={styles.otpCode}>{createdReservation.pickupCode}</Text>
                    <Text style={styles.otpExpiry}>{t('home.otpExpiry')}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => {
                      setSelectedItem(null);
                      setCreatedReservation(null);
                    }}
                  >
                    <Text style={styles.doneBtnText}>{t('home.viewReservations')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#006b2c',
  },
  locationTag: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerLanguageToggle: {
    alignSelf: 'center',
  },
  iconBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  iconBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  chatBtn: {
    backgroundColor: '#006b2c',
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  clearIcon: {
    fontSize: 14,
    color: '#94a3b8',
    paddingHorizontal: 6,
  },
  assistBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  assistBtnRecording: {
    backgroundColor: '#fee2e2',
  },
  assistBtnText: {
    fontSize: 16,
  },
  assistNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
  },
  assistNoteOk: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  assistNoteWarn: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  assistNoteTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  assistNoteDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    paddingBottom: 12,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  categoryChipActive: {
    backgroundColor: '#006b2c',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 3,
  },
  toggleOption: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 11,
  },
  toggleOptionActive: {
    backgroundColor: '#ffffff',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleTextActive: {
    color: '#006b2c',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 12,
  },
  mapWrapper: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  genericName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  priceTag: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  priceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#166534',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  pharmacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  pharmacyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  addressText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  hoursText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  badgeCol: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  distanceText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  directionsBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  directionsBtnText: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  reserveBtn: {
    flex: 2,
    backgroundColor: '#006b2c',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  reserveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 4,
    backgroundColor: '#ffffff',
  },
  sortLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  sortChipActive: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  sortChipTextActive: {
    color: '#166534',
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  legendItem: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  fallbackNote: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
    textAlign: 'center',
  },
  pharmacyRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  openNow: {
    color: '#15803d',
    fontWeight: 'bold',
    fontSize: 11,
  },
  closedNow: {
    color: '#b91c1c',
    fontWeight: 'bold',
    fontSize: 11,
  },
  nearestTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginTop: 2,
  },
  pharmacyMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  metaOpen: {
    backgroundColor: '#dcfce7',
  },
  metaClosed: {
    backgroundColor: '#fee2e2',
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  matchBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  matchTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
  },
  matchSub: {
    fontSize: 12,
    color: '#15803d',
    marginTop: 2,
  },
  matchReserveBtn: {
    marginTop: 10,
    backgroundColor: '#006b2c',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  matchReserveText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  primaryDirectionsBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryDirectionsText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  callBtn: {
    flex: 2,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  callBtnText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
  emptySub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 16,
  },
  modalDetailBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  modalMedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalMedSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  qtyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006b2c',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  cancelModalText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmModalBtn: {
    flex: 2,
    backgroundColor: '#006b2c',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmModalText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  successIconBox: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  successIcon: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  otpCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#86efac',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#166534',
    letterSpacing: 1,
  },
  otpCode: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#006b2c',
    letterSpacing: 8,
    marginVertical: 8,
  },
  otpExpiry: {
    fontSize: 12,
    color: '#15803d',
  },
  doneBtn: {
    backgroundColor: '#006b2c',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { api } from '../services/api';

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

export default function HomeScreen({ onOpenChat, onOpenPrescription }) {
  const [query, setQuery] = useState('Amoxil');
  const [category, setCategory] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [selectedItem, setSelectedItem] = useState(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);

  // Default coordinates: Addis Ababa Bole
  const userLat = 8.9945;
  const userLng = 38.7896;

  const performSearch = async (searchTerm = query) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const data = await api.searchStock(searchTerm, userLat, userLng, 25);
      setResults(data.results || []);
    } catch (err) {
      console.warn('Search failed:', err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch('Amoxil');
  }, []);

  const filteredResults = results.filter((item) => {
    if (category === 'All') return true;
    return item.category?.toLowerCase() === category.toLowerCase();
  });

  const handleReserveConfirm = async () => {
    if (!selectedItem) return;
    setReserving(true);
    try {
      const reservation = await api.createReservation(selectedItem.inventoryId, reserveQty);
      setCreatedReservation(reservation);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create reservation';
      Alert.alert('Reservation Error', msg);
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
          <Text style={styles.locationTag}>📍 Addis Ababa, Bole</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenPrescription}>
            <Text style={styles.iconBtnText}>📷 Rx Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.chatBtn]} onPress={onOpenChat}>
            <Text style={styles.chatBtnText}>🤖 AI Doctor</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicine (e.g. Amoxil, Paracetamol, Metformin)..."
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (text.length >= 2) performSearch(text);
            }}
            placeholderTextColor="#94a3b8"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); performSearch('a'); }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
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
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* View Mode Switcher Header */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>
          {filteredResults.length} nearby option{filteredResults.length === 1 ? '' : 's'}
        </Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleOption, viewMode === 'list' && styles.toggleOptionActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, viewMode === 'map' && styles.toggleOptionActive]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List or Map View */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#006b2c" />
          <Text style={styles.loadingText}>Searching verified pharmacy inventory...</Text>
        </View>
      ) : viewMode === 'map' ? (
        <View style={styles.mapWrapper}>
          {MapView && Marker ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: userLat,
                longitude: userLng,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
            >
              {filteredResults.map((item, idx) => (
                <Marker
                  key={item.inventoryId || idx}
                  coordinate={{ latitude: item.lat, longitude: item.lng }}
                  title={item.pharmacyName}
                  description={`${item.medicineName} - ETB ${item.price}`}
                  onPress={() => setSelectedItem(item)}
                />
              ))}
            </MapView>
          ) : (
            <View style={styles.centerLoading}>
              <Text style={styles.loadingText}>📍 Map View</Text>
              <Text style={{ color: '#64748b', marginTop: 4 }}>Showing {filteredResults.length} nearby pharmacy locations</Text>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredResults}
          keyExtractor={(item, index) => item.inventoryId || index.toString()}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No matching medicines found</Text>
              <Text style={styles.emptySub}>Try searching for 'Amoxil', 'Paracetamol', or 'Metformin'</Text>
            </View>
          }
          renderItem={({ item }) => {
            const distanceKm = item.distanceM ? (item.distanceM / 1000).toFixed(1) : '1.2';
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.medicineName}>{item.medicineName}</Text>
                    <Text style={styles.genericName}>{item.genericName} • {item.strength}</Text>
                  </View>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>ETB {item.price}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.pharmacyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pharmacyName}>🏥 {item.pharmacyName}</Text>
                    <Text style={styles.addressText}>{item.address}</Text>
                    <Text style={styles.hoursText}>🕒 {item.openTime} - {item.closeTime}</Text>
                  </View>
                  <View style={styles.badgeCol}>
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockBadgeText}>In Stock ({item.quantity})</Text>
                    </View>
                    <Text style={styles.distanceText}>📍 {distanceKm} km away</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.reserveBtn}
                  onPress={() => {
                    setSelectedItem(item);
                    setReserveQty(1);
                    setCreatedReservation(null);
                  }}
                >
                  <Text style={styles.reserveBtnText}>Reserve Stock for Pickup</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* Reservation Confirmation Modal */}
      {selectedItem && (
        <Modal animationType="slide" transparent visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {!createdReservation ? (
                <>
                  <Text style={styles.modalTitle}>Confirm Medicine Reservation</Text>
                  <Text style={styles.modalSub}>
                    Hold stock at {selectedItem.pharmacyName} for 24 hours.
                  </Text>

                  <View style={styles.modalDetailBox}>
                    <Text style={styles.modalMedName}>{selectedItem.medicineName}</Text>
                    <Text style={styles.modalMedSub}>{selectedItem.genericName} • {selectedItem.strength}</Text>

                    <View style={styles.qtyRow}>
                      <Text style={styles.qtyLabel}>Quantity:</Text>
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
                      <Text style={styles.totalLabel}>Total Payable:</Text>
                      <Text style={styles.totalValue}>ETB {(selectedItem.price * reserveQty).toFixed(2)}</Text>
                    </View>
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.cancelModalBtn}
                      onPress={() => setSelectedItem(null)}
                    >
                      <Text style={styles.cancelModalText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmModalBtn}
                      onPress={handleReserveConfirm}
                      disabled={reserving}
                    >
                      {reserving ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.confirmModalText}>Confirm & Generate OTP</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.successIconBox}>
                    <Text style={styles.successIcon}>✅</Text>
                  </View>
                  <Text style={styles.successTitle}>Stock Reserved!</Text>
                  <Text style={styles.successSub}>
                    Show this 4-digit pickup code to the pharmacist upon arrival.
                  </Text>

                  <View style={styles.otpCard}>
                    <Text style={styles.otpLabel}>YOUR PICKUP OTP CODE</Text>
                    <Text style={styles.otpCode}>{createdReservation.pickupCode}</Text>
                    <Text style={styles.otpExpiry}>Expires in 24 hours</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => {
                      setSelectedItem(null);
                      setCreatedReservation(null);
                    }}
                  >
                    <Text style={styles.doneBtnText}>View My Reservations</Text>
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
  reserveBtn: {
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

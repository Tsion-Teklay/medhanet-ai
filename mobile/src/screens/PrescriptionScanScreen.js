import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';

export default function PrescriptionScanScreen({ onClose }) {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [reservingId, setReservingId] = useState(null);
  const [reservedSuccess, setReservedSuccess] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [showRawText, setShowRawText] = useState(false);
  const [pharmacies, setPharmacies] = useState(null);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [sendingToId, setSendingToId] = useState(null);
  const [sentTo, setSentTo] = useState(null);

  const pickImage = async (useCamera = false) => {
    try {
      let permissionResult;
      if (useCamera) {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        Alert.alert('Permission Needed', 'Please allow camera/photo library access to scan prescriptions.');
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: true })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: true });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setScanResult(null);
        setReservedSuccess(null);
        setScanError(null);
        setPharmacies(null);
        setSentTo(null);
      }
    } catch (err) {
      console.warn('Image picker error:', err.message);
    }
  };

  const handleScanPrescription = async () => {
    if (!imageUri) return;
    setLoading(true);
    setScanError(null);
    try {
      const data = await api.uploadPrescription(imageUri);
      setScanResult(data);
    } catch (err) {
      console.warn('Scan failed:', err.message);
      setScanError(
        'Could not reach the scanner. Check your connection and try again — or send the photo straight to a pharmacy.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyPharmacies = async () => {
    setLoadingPharmacies(true);
    try {
      setPharmacies(await api.getNearbyPharmacies());
    } catch (err) {
      Alert.alert('Could not load pharmacies', 'Please check your connection and try again.');
    } finally {
      setLoadingPharmacies(false);
    }
  };

  const handleSendToPharmacy = async (pharmacy) => {
    if (!scanResult?.prescriptionId) return;
    setSendingToId(pharmacy.id);
    try {
      await api.sendPrescriptionToPharmacy(
        scanResult.prescriptionId,
        pharmacy.id,
        'Please read this prescription for me.'
      );
      setSentTo(pharmacy);
    } catch (err) {
      Alert.alert('Could not send', 'The prescription could not be sent to that pharmacy.');
    } finally {
      setSendingToId(null);
    }
  };

  const handleQuickReserve = async (inventoryId, pharmacyName) => {
    setReservingId(inventoryId);
    try {
      const res = await api.createReservation(inventoryId, 1);
      setReservedSuccess({ pharmacyName, pickupCode: res.pickupCode });
    } catch (err) {
      Alert.alert('Reservation Error', 'Could not complete reservation.');
    } finally {
      setReservingId(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📷 Gemini AI Prescription Scanner</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Upload Buttons */}
        {!imageUri ? (
          <View style={styles.uploadBox}>
            <Text style={styles.uploadIcon}>📑</Text>
            <Text style={styles.uploadTitle}>Scan Doctor's Prescription</Text>
            <Text style={styles.uploadSub}>
              Take a clear photo or upload a prescription to extract medicine dosage & find stock instantly.
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage(true)}>
                <Text style={styles.actionBtnText}>📷 Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.galleryBtn]} onPress={() => pickImage(false)}>
                <Text style={styles.galleryBtnText}>🖼️ Choose Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.previewCard}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            <TouchableOpacity style={styles.repickBtn} onPress={() => pickImage(false)}>
              <Text style={styles.repickText}>Change Image</Text>
            </TouchableOpacity>

            {!scanResult && (
              <TouchableOpacity
                style={styles.scanSubmitBtn}
                onPress={handleScanPrescription}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.scanSubmitText}>✨ Scan with Gemini AI</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {scanError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{scanError}</Text>
          </View>
        )}

        {/* Scan Results */}
        {scanResult && (
          <View style={styles.resultsContainer}>
            <View style={styles.aiBadgeHeader}>
              <Text style={styles.aiBadgeTitle}>🤖 Prescription Read</Text>
              <Text
                style={[
                  styles.confidenceText,
                  scanResult.needsReview && styles.confidenceLow,
                ]}
              >
                Confidence: {scanResult.ocrResult?.confidence || 'Low'}
              </Text>
            </View>

            {/* Plain-language explanation */}
            {scanResult.ocrResult?.readableSummary ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>What this prescription says</Text>
                <Text style={styles.summaryText}>{scanResult.ocrResult.readableSummary}</Text>
              </View>
            ) : null}

            {/* Verbatim transcription, plus an English rendering when it is not in English */}
            {scanResult.ocrResult?.rawText ? (
              <View style={styles.sectionCard}>
                <TouchableOpacity onPress={() => setShowRawText(!showRawText)}>
                  <Text style={styles.sectionTitle}>
                    📄 Prescription text {showRawText ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {showRawText && (
                  <>
                    <Text style={styles.rawText}>{scanResult.ocrResult.rawText}</Text>
                    {scanResult.ocrResult.englishText &&
                    scanResult.ocrResult.language !== 'English' ? (
                      <>
                        <Text style={styles.rawTextLabel}>Translated to English</Text>
                        <Text style={styles.rawText}>{scanResult.ocrResult.englishText}</Text>
                      </>
                    ) : null}
                  </>
                )}
              </View>
            ) : null}

            {/* Extracted Medicines */}
            {scanResult.ocrResult?.medicines?.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Prescribed Medications</Text>
                {scanResult.ocrResult.medicines.map((med, idx) => (
                  <View key={idx} style={styles.medRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rxName}>{med.name}</Text>
                      <Text style={styles.rxSub}>{med.genericName} • {med.strength}</Text>
                      <Text style={styles.rxDosage}>📋 Instructions: {med.dosage}</Text>
                      {med.legible && med.legible !== 'clear' ? (
                        <Text style={styles.legibleWarn}>
                          ⚠️ {med.legible === 'guessed' ? 'Handwriting unclear — best guess' : 'Only partly legible'}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
                {scanResult.ocrResult?.patientNotes ? (
                  <Text style={styles.patientNotes}>💡 Note: {scanResult.ocrResult.patientNotes}</Text>
                ) : null}
              </View>
            )}

            {/* Not readable / not a prescription: hand it to a human */}
            {scanResult.needsReview && (
              <View style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>⚠️ A pharmacist should check this</Text>
                <Text style={styles.reviewReason}>
                  {scanResult.ocrResult?.reviewReason ||
                    'The scan was not clear enough to be certain. Do not rely on it as-is.'}
                </Text>

                {sentTo ? (
                  <View style={styles.successBanner}>
                    <Text style={styles.successBannerText}>
                      ✅ Sent to {sentTo.name}. They can see your photo and will call you on {'\n'}
                      your registered phone number.
                    </Text>
                  </View>
                ) : !pharmacies ? (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={loadNearbyPharmacies}
                    disabled={loadingPharmacies}
                  >
                    {loadingPharmacies ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.reviewBtnText}>🏥 Send to a nearby pharmacy</Text>
                    )}
                  </TouchableOpacity>
                ) : pharmacies.length === 0 ? (
                  <Text style={styles.reviewReason}>No verified pharmacies found nearby.</Text>
                ) : (
                  <View>
                    <Text style={styles.pickLabel}>Choose a pharmacy to review it:</Text>
                    {pharmacies.map((ph) => (
                      <View key={ph.id} style={styles.stockRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.stockPharmName}>🏥 {ph.name}</Text>
                          <Text style={styles.stockPrice}>
                            {ph.distanceKm} km • {ph.isOpen ? 'Open now' : 'Closed'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.quickReserveBtn}
                          onPress={() => handleSendToPharmacy(ph)}
                          disabled={sendingToId === ph.id}
                        >
                          {sendingToId === ph.id ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={styles.quickReserveText}>Send</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Stock Match Section */}
            {scanResult.matchedStock?.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Nearby Pharmacies With Stock</Text>

              {reservedSuccess && (
                <View style={styles.successBanner}>
                  <Text style={styles.successBannerText}>
                    ✅ Stock reserved at {reservedSuccess.pharmacyName}! OTP: {reservedSuccess.pickupCode}
                  </Text>
                </View>
              )}

              {scanResult.matchedStock?.map((item, i) => (
                <View key={i}>
                  {item.matchedMedicines?.map((m) =>
                    m.pharmaciesWithStock?.map((pharm) => (
                      <View key={pharm.inventoryId} style={styles.stockRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.stockPharmName}>🏥 {pharm.pharmacyName}</Text>
                          <Text style={styles.stockPrice}>ETB {pharm.price} • {pharm.quantity} in stock</Text>
                        </View>

                        <TouchableOpacity
                          style={styles.quickReserveBtn}
                          onPress={() => handleQuickReserve(pharm.inventoryId, pharm.pharmacyName)}
                          disabled={reservingId === pharm.inventoryId}
                        >
                          {reservingId === pharm.inventoryId ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={styles.quickReserveText}>1-Tap Reserve</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              ))}
            </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    marginRight: 12,
  },
  closeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#006b2c',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  content: {
    padding: 20,
  },
  uploadBox: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  uploadSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#006b2c',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  galleryBtn: {
    backgroundColor: '#f1f5f9',
  },
  galleryBtnText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: 'bold',
  },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
  },
  repickBtn: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 6,
  },
  repickText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  scanSubmitBtn: {
    backgroundColor: '#006b2c',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  scanSubmitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 20,
  },
  aiBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiBadgeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006b2c',
  },
  confidenceText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: 'bold',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  medRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  rxName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  rxSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  rxDosage: {
    fontSize: 12,
    color: '#006b2c',
    fontWeight: '600',
    marginTop: 4,
  },
  patientNotes: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 10,
    fontStyle: 'italic',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  stockPharmName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
  },
  stockPrice: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
  },
  quickReserveBtn: {
    backgroundColor: '#006b2c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quickReserveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  confidenceLow: {
    color: '#92400e',
    backgroundColor: '#fef3c7',
  },
  summaryText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  rawText: {
    fontSize: 12,
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
    marginTop: 8,
  },
  rawTextLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 14,
    textTransform: 'uppercase',
  },
  legibleWarn: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '600',
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 14,
    borderRadius: 16,
    marginTop: 16,
  },
  errorBannerText: {
    color: '#991b1b',
    fontSize: 13,
  },
  reviewCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#92400e',
  },
  reviewReason: {
    fontSize: 12,
    color: '#78350f',
    marginTop: 6,
    lineHeight: 18,
  },
  reviewBtn: {
    backgroundColor: '#b45309',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
  },
  reviewBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pickLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#78350f',
    marginTop: 14,
    marginBottom: 4,
  },
  successBanner: {
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  successBannerText: {
    color: '#15803d',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

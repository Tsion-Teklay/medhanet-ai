import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { api } from '../services/api';

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = async () => {
    try {
      const data = await api.getPatientReservations();
      setReservations(data || []);
    } catch (err) {
      console.warn('Failed to load reservations:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = (id) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation and release the stock?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.cancelReservation(id);
              fetchReservations();
            } catch (err) {
              Alert.alert('Error', 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reservations</Text>
        <Text style={styles.headerSub}>Show OTP codes to pharmacy upon arrival</Text>
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#006b2c" />
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReservations(); }} />
          }
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No active reservations</Text>
              <Text style={styles.emptySub}>
                Search medicines on the home screen to reserve nearby stock!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const med = item.inventory?.medicine;
            const pharmacy = item.inventory?.pharmacy;
            const isCompleted = item.status === 'COMPLETED';
            const isCancelled = item.status === 'CANCELLED';

            return (
              <View style={[styles.card, (isCompleted || isCancelled) && styles.cardInactive]}>
                <View style={styles.cardHeader}>
                  <View style={styles.statusBadge}>
                    <Text
                      style={[
                        styles.statusText,
                        isCompleted && styles.statusCompleted,
                        isCancelled && styles.statusCancelled,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.medName}>{med?.name || 'Medicine'}</Text>
                <Text style={styles.medDetails}>
                  {med?.genericName} • Qty: {item.quantity} unit(s)
                </Text>

                <View style={styles.otpSection}>
                  <Text style={styles.otpLabel}>PICKUP CODE (OTP)</Text>
                  <Text style={styles.otpCode}>{item.pickupCode}</Text>
                </View>

                <View style={styles.pharmacyBox}>
                  <Text style={styles.pharmacyTitle}>🏥 {pharmacy?.name || 'Pharmacy'}</Text>
                  <Text style={styles.pharmacyAddress}>{pharmacy?.address}</Text>
                  <Text style={styles.pharmacyPhone}>📞 {pharmacy?.phone}</Text>
                </View>

                {!isCompleted && !isCancelled && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(item.id)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel Reservation</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listPadding: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardInactive: {
    opacity: 0.7,
    backgroundColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
  },
  statusCompleted: {
    color: '#0284c7',
  },
  statusCancelled: {
    color: '#dc2626',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  medName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  medDetails: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  otpSection: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginVertical: 14,
  },
  otpLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
    letterSpacing: 1,
  },
  otpCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#006b2c',
    letterSpacing: 6,
    marginTop: 4,
  },
  pharmacyBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  pharmacyTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
  },
  pharmacyAddress: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  pharmacyPhone: {
    fontSize: 12,
    color: '#006b2c',
    fontWeight: '600',
    marginTop: 4,
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyBox: {
    padding: 40,
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
});

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { setOnUnauthorized } from './src/services/api';
import { LanguageProvider, useI18n } from './src/i18n';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReservationsScreen from './src/screens/ReservationsScreen';
import PrescriptionScanScreen from './src/screens/PrescriptionScanScreen';
import AIChatScreen from './src/screens/AIChatScreen';

export default function App() {
  return (
    <LanguageProvider>
      <MedhaNetApp />
    </LanguageProvider>
  );
}

function MedhaNetApp() {
  const { t } = useI18n();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'reservations' | 'scan' | 'chat'

  useEffect(() => {
    setOnUnauthorized(() => {
      setIsAuthenticated(false);
      setActiveTab('home');
    });
  }, []);

  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Screen Content */}
      <View style={styles.screenArea}>
        {activeTab === 'home' && (
          <HomeScreen
            onOpenChat={() => setActiveTab('chat')}
            onOpenPrescription={() => setActiveTab('scan')}
          />
        )}
        {activeTab === 'reservations' && <ReservationsScreen />}
        {activeTab === 'scan' && <PrescriptionScanScreen onClose={() => setActiveTab('home')} />}
        {activeTab === 'chat' && <AIChatScreen onClose={() => setActiveTab('home')} />}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'home' && styles.tabItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
            {t('tabs.search')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'reservations' && styles.tabItemActive]}
          onPress={() => setActiveTab('reservations')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={[styles.tabLabel, activeTab === 'reservations' && styles.tabLabelActive]}>
            {t('tabs.reservations')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'scan' && styles.tabItemActive]}
          onPress={() => setActiveTab('scan')}
        >
          <Text style={styles.tabIcon}>📷</Text>
          <Text style={[styles.tabLabel, activeTab === 'scan' && styles.tabLabelActive]}>
            {t('tabs.scan')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'chat' && styles.tabItemActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={styles.tabIcon}>🤖</Text>
          <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>
            {t('tabs.chat')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: '#f0fdf4',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#006b2c',
    fontWeight: 'bold',
  },
});

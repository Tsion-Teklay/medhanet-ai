import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { api } from '../services/api';

export default function AuthScreen({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('0922000000');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!phone || !password) {
      setError('Please fill in phone and password');
      return;
    }
    if (isRegister && !name) {
      setError('Please enter your full name');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.register(phone, password, name);
      } else {
        await api.login(phone, password);
      }
      onLoginSuccess();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setPhone('0922000000');
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      await api.login('0922000000', 'password123');
      onLoginSuccess();
    } catch (err) {
      setError('Demo login failed. Make sure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>መ</Text>
          </View>
          <Text style={styles.title}>መድሃኔት AI</Text>
          <Text style={styles.subtitle}>
            Ethiopia's AI-Powered Healthcare & Medicine Network
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isRegister ? 'Create Patient Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.cardSub}>
            {isRegister
              ? 'Register to search nearby stock & reserve medicines'
              : 'Log in to manage your medical reservations'}
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {isRegister && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Abebe Bikila"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94a3b8"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="0922000000"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isRegister ? 'Sign Up as Patient' : 'Log In'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleDemoLogin}
            disabled={loading}
          >
            <Text style={styles.demoBtnText}>⚡ Quick Demo Patient Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            <Text style={styles.toggleText}>
              {isRegister
                ? 'Already have an account? Log in'
                : "Don't have an account? Register as Patient"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#006b2c',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#006b2c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  submitBtn: {
    backgroundColor: '#006b2c',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  demoBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  demoBtnText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#006b2c',
    fontSize: 13,
    fontWeight: '600',
  },
});

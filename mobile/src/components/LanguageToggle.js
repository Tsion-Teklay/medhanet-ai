import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../i18n';

const OPTIONS = [
  { id: 'en', label: 'EN' },
  { id: 'am', label: 'አማ' },
];

/** Compact EN/አማ switch. Placed in every screen header so it is always reachable. */
export default function LanguageToggle({ style }) {
  const { language, setLanguage } = useI18n();

  return (
    <View style={[styles.wrapper, style]}>
      {OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[styles.option, language === option.id && styles.optionActive]}
          onPress={() => setLanguage(option.id)}
          accessibilityRole="button"
          accessibilityLabel={`Switch app language to ${option.id === 'am' ? 'Amharic' : 'English'}`}
        >
          <Text style={[styles.label, language === option.id && styles.labelActive]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 2,
  },
  option: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  optionActive: {
    backgroundColor: '#006b2c',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  labelActive: {
    color: '#ffffff',
  },
});

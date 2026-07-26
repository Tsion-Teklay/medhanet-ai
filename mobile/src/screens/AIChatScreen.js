import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';
import { startRecording, stopRecording } from '../services/voice';
import { useI18n } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';

const SUGGESTION_KEYS = [
  'chat.suggestion1',
  'chat.suggestion2',
  'chat.suggestion3',
  'chat.suggestion4',
];

const LANGUAGES = [
  { id: 'auto', labelKey: 'chat.langAuto' },
  { id: 'en', labelKey: 'chat.langEnglish' },
  { id: 'am', labelKey: 'chat.langAmharic' },
];

const isAmharic = (text) => {
  const letters = (text || '').match(/\p{L}/gu) || [];
  if (letters.length === 0) return false;
  const ethiopic = letters.filter((c) => /[\u1200-\u137F]/.test(c)).length;
  return ethiopic / letters.length > 0.3;
};

/**
 * The model replies in markdown. React Native has no markdown renderer, so
 * without this the bubbles show raw ** and ### instead of formatting.
 */
const renderFormatted = (content, baseStyle, boldStyle) =>
  String(content)
    .split('\n')
    .map((line, lineIndex) => {
      const heading = line.match(/^(#{1,6})\s+(.*)$/);
      const bullet = line.match(/^\s*([-*•]|\d+\.)\s+(.*)$/);
      let text = line;
      let lineStyle = null;

      if (heading) {
        text = heading[2];
        lineStyle = boldStyle;
      } else if (bullet) {
        text = `•  ${bullet[2]}`;
      }

      // Split on **bold** runs, keeping the delimited segments.
      const segments = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

      return (
        <Text key={lineIndex} style={[baseStyle, lineStyle]}>
          {segments.map((segment, i) =>
            segment.startsWith('**') && segment.endsWith('**') ? (
              <Text key={i} style={boldStyle}>
                {segment.slice(2, -2)}
              </Text>
            ) : (
              segment
            )
          )}
          {'\n'}
        </Text>
      );
    });

export default function AIChatScreen({ onClose }) {
  const { t, language: appLanguage } = useI18n();
  // The greeting is keyed rather than stored so it follows the app language.
  const [messages, setMessages] = useState([
    { id: 'welcome-1', role: 'assistant', contentKey: 'chat.welcome' },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [attachment, setAttachment] = useState(null); // { uri, base64, mimeType }
  const [language, setLanguage] = useState(appLanguage);
  const [translations, setTranslations] = useState({}); // messageId -> { text, showing }
  const [translatingId, setTranslatingId] = useState(null);
  const recordingRef = useRef(null);

  // Switching the app to Amharic should also switch the doctor's replies.
  useEffect(() => setLanguage(appLanguage), [appLanguage]);

  const handleTranslate = async (message) => {
    const existing = translations[message.id];
    if (existing) {
      setTranslations((prev) => ({
        ...prev,
        [message.id]: { ...existing, showing: !existing.showing },
      }));
      return;
    }

    setTranslatingId(message.id);
    try {
      const target = isAmharic(message.content) ? 'en' : 'am';
      const res = await api.translateText(message.content, target);
      setTranslations((prev) => ({
        ...prev,
        [message.id]: { text: res.text, target, showing: true },
      }));
    } catch (err) {
      console.warn('Translation failed:', err.message);
      addAssistantMessage(t('chat.translateFailed'));
    } finally {
      setTranslatingId(null);
    }
  };

  const handleSendMessage = async (textToSend = inputText, photo = attachment) => {
    const text = (textToSend || '').trim();
    if (!text && !photo) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text || t('chat.aboutThisPhoto'),
      imageUri: photo?.uri,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAttachment(null);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(text, {
        imageBase64: photo?.base64,
        imageMimeType: photo?.mimeType,
        language,
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply || res.response,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (res.emergency) {
        setEmergencyAlert({
          message: res.reply,
          contacts: res.emergencyContacts || [
            { nameKey: 'chat.emergencyMedicalLine', phone: '907' },
            { nameKey: 'chat.emergencyNational', phone: '911' },
            { nameKey: 'chat.emergencyRedCross', phone: '922' },
          ],
        });
      }
    } catch (err) {
      console.warn('Chat error:', err.message);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: t('chat.connectionWarning'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceRecording = async () => {
    if (recordingRef.current) return;
    try {
      const recording = await startRecording();
      if (!recording) {
        addAssistantMessage(t('chat.micPermission'));
        return;
      }
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.warn('Voice recording error:', err.message);
      recordingRef.current = null;
      setIsRecording(false);
    }
  };

  const attachPhoto = async (fromCamera) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t('common.permissionNeeded'),
          t('chat.attachPermission', {
            kind: fromCamera ? t('common.camera') : t('common.photo'),
          })
        );
        return;
      }

      const options = {
        mediaTypes: ['images'],
        quality: 0.6,
        base64: true,
      };
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled) return;

      const asset = result.assets[0];
      setAttachment({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    } catch (err) {
      console.warn('Photo attach error:', err.message);
      Alert.alert(t('chat.attachFailed'), t('common.tryAgain'));
    }
  };

  const promptForPhoto = () => {
    Alert.alert(t('chat.attachTitle'), t('chat.attachPrompt'), [
      { text: t('common.takePhoto'), onPress: () => attachPhoto(true) },
      { text: t('common.chooseGallery'), onPress: () => attachPhoto(false) },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const addAssistantMessage = (content) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'assistant', content },
    ]);
  };

  const stopVoiceRecording = async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    // Release the slot up front: a throw below must not leave the native
    // recorder pinned, or every later recording fails to prepare.
    recordingRef.current = null;
    setIsRecording(false);
    setLoading(true);
    try {
      const { base64, mimeType } = await stopRecording(recording);

      const voiceRes = await api.transcribeVoiceAudio(base64, null, mimeType);
      setLoading(false);

      if (!voiceRes.query) {
        addAssistantMessage(t('chat.noSpeech'));
        return;
      }

      handleSendMessage(voiceRes.query);
    } catch (err) {
      console.warn('Voice transcription error:', err.message);
      setLoading(false);
      addAssistantMessage(t('chat.voiceFailed'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <View style={styles.doctorBadge}>
          <Text style={styles.doctorTitle}>{t('chat.title')}</Text>
          <Text style={styles.doctorSub}>{t('chat.subtitle')}</Text>
        </View>
        <LanguageToggle style={styles.headerLanguageToggle} />
      </View>

      {/* Reply Language */}
      <View style={styles.languageRow}>
        <Text style={styles.languageLabel}>{t('chat.replyIn')}</Text>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.id}
            style={[styles.languageChip, language === lang.id && styles.languageChipActive]}
            onPress={() => setLanguage(lang.id)}
          >
            <Text
              style={[
                styles.languageChipText,
                language === lang.id && styles.languageChipTextActive,
              ]}
            >
              {t(lang.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Emergency Alert Banner */}
      {emergencyAlert && (
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyTitle}>{t('chat.emergencyTitle')}</Text>
          <Text style={styles.emergencySub}>{t('chat.emergencySub')}</Text>
          <View style={styles.hotlineRow}>
            {emergencyAlert.contacts.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={styles.hotlineBtn}
                onPress={() => Linking.openURL(`tel:${c.phone}`)}
              >
                <Text style={styles.hotlineBtnText}>
                  📞 {c.nameKey ? t(c.nameKey) : c.name}: {c.phone}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isUser = item.role === 'user';
          const translation = translations[item.id];
          const original = item.contentKey ? t(item.contentKey) : item.content;
          const shown = translation?.showing ? translation.text : original;

          return (
            <View style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
              <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                {item.imageUri && (
                  <Image source={{ uri: item.imageUri }} style={styles.bubbleImage} />
                )}
                {isUser ? (
                  <Text style={[styles.bubbleText, styles.userBubbleText]}>{shown}</Text>
                ) : (
                  renderFormatted(shown, styles.bubbleText, styles.bubbleBold)
                )}
              </View>

              {!isUser && item.id !== 'welcome-1' && (
                <TouchableOpacity
                  style={styles.translateBtn}
                  onPress={() => handleTranslate(item)}
                  disabled={translatingId === item.id}
                >
                  {translatingId === item.id ? (
                    <ActivityIndicator size="small" color="#1d4ed8" />
                  ) : (
                    <Text style={styles.translateBtnText}>
                      {translation?.showing
                        ? t('chat.showOriginal')
                        : isAmharic(item.content)
                        ? t('chat.translateToEnglish')
                        : t('chat.translateToAmharic')}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#006b2c" />
          <Text style={styles.typingText}>{t('chat.typing')}</Text>
        </View>
      )}

      {/* Quick Suggestion Chips */}
      <View style={styles.suggestionsContainer}>
        <FlatList
          horizontal
          data={SUGGESTION_KEYS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chip} onPress={() => handleSendMessage(t(item))}>
              <Text style={styles.chipText}>{t(item)}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Pending Photo Preview */}
      {attachment && (
        <View style={styles.attachmentBar}>
          <Image source={{ uri: attachment.uri }} style={styles.attachmentThumb} />
          <Text style={styles.attachmentLabel}>{t('chat.photoAttached')}</Text>
          <TouchableOpacity onPress={() => setAttachment(null)}>
            <Text style={styles.attachmentRemove}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={[styles.micBtn, isRecording && styles.micBtnActive]}
          onPressIn={startVoiceRecording}
          onPressOut={stopVoiceRecording}
        >
          <Text style={styles.micText}>{isRecording ? '🔴' : '🎙️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.micBtn, attachment && styles.attachBtnActive]}
          onPress={promptForPhoto}
        >
          <Text style={styles.micText}>📎</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={isRecording ? t('chat.listening') : t('chat.placeholder')}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSendMessage()}
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => handleSendMessage()}
          disabled={(!inputText.trim() && !attachment) || loading}
        >
          <Text style={styles.sendBtnText}>{t('chat.send')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  closeBtn: {
    marginRight: 12,
  },
  closeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#006b2c',
  },
  doctorBadge: {
    flex: 1,
  },
  headerLanguageToggle: {
    marginLeft: 8,
  },
  doctorTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  doctorSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  emergencyBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 14,
    margin: 12,
    borderRadius: 16,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#991b1b',
  },
  emergencySub: {
    fontSize: 12,
    color: '#7f1d1d',
    marginTop: 2,
    marginBottom: 8,
  },
  hotlineRow: {
    gap: 6,
  },
  hotlineBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  hotlineBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageList: {
    padding: 16,
  },
  bubbleWrapper: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  assistantWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#006b2c',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
  },
  userBubbleText: {
    color: '#ffffff',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginLeft: 12,
  },
  chipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: {
    backgroundColor: '#fee2e2',
  },
  attachBtnActive: {
    backgroundColor: '#dbeafe',
  },
  micText: {
    fontSize: 18,
  },
  bubbleBold: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  translateBtn: {
    marginTop: 4,
    marginLeft: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  translateBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  languageLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  languageChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
  },
  languageChipActive: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  languageChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  languageChipTextActive: {
    color: '#166534',
  },
  bubbleImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#e2e8f0',
  },
  attachmentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#eff6ff',
    borderTopWidth: 1,
    borderColor: '#bfdbfe',
  },
  attachmentThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  attachmentLabel: {
    flex: 1,
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  attachmentRemove: {
    fontSize: 16,
    color: '#64748b',
    paddingHorizontal: 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  sendBtn: {
    backgroundColor: '#006b2c',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

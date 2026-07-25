import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { api } from '../services/api';

const QUICK_SUGGESTIONS = [
  'Is Amoxicillin available nearby?',
  'What are the side effects of Metformin?',
  'I have mild fever and headache',
  'What is Coartem dosage for adults?',
];

export default function AIChatScreen({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'ሰላም! (Hello!) I am MedhaNet AI, your Ethiopian healthcare assistant. How can I assist you with your health or medication search today?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const recordingRef = useRef(null);

  const handleSendMessage = async (textToSend = inputText) => {
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(textToSend.trim());

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
            { name: 'Emergency Medical Line', phone: '907' },
            { name: 'National Emergency', phone: '911' },
            { name: 'Ethiopian Red Cross', phone: '922' },
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
          content:
            '⚠️ Connection warning: Could not reach the AI Doctor service. Please ensure the backend and AI Python service are running.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.warn('Voice recording error:', err.message);
    }
  };

  const stopVoiceRecording = async () => {
    if (!recordingRef.current) return;
    setIsRecording(false);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      let base64Audio = null;
      if (uri) {
        try {
          base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (fsErr) {
          console.warn('FileSystem read error:', fsErr.message);
        }
      }

      setLoading(true);
      // Transcribe voice recording via backend AI service
      const voiceRes = await api.transcribeVoiceAudio(base64Audio);
      const transcribedQuery = voiceRes.query || 'What are the dosage instructions for Paracetamol?';
      setLoading(false);

      handleSendMessage(transcribedQuery);
    } catch (err) {
      console.warn('Stop recording error:', err.message);
      setLoading(false);
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
          <Text style={styles.closeText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.doctorBadge}>
          <Text style={styles.doctorTitle}>🤖 MedhaNet AI Doctor</Text>
          <Text style={styles.doctorSub}>Amharic & English • Emergency Guarded</Text>
        </View>
      </View>

      {/* Emergency Alert Banner */}
      {emergencyAlert && (
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyTitle}>🚨 EMERGENCY SYMPTOMS DETECTED</Text>
          <Text style={styles.emergencySub}>Please call local emergency services immediately:</Text>
          <View style={styles.hotlineRow}>
            {emergencyAlert.contacts.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={styles.hotlineBtn}
                onPress={() => Linking.openURL(`tel:${c.phone}`)}
              >
                <Text style={styles.hotlineBtnText}>📞 {c.name}: {c.phone}</Text>
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
          return (
            <View style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
              <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>{item.content}</Text>
              </View>
            </View>
          );
        }}
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#006b2c" />
          <Text style={styles.typingText}>MedhaNet AI is typing...</Text>
        </View>
      )}

      {/* Quick Suggestion Chips */}
      <View style={styles.suggestionsContainer}>
        <FlatList
          horizontal
          data={QUICK_SUGGESTIONS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chip} onPress={() => handleSendMessage(item)}>
              <Text style={styles.chipText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Chat Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={[styles.micBtn, isRecording && styles.micBtnActive]}
          onPressIn={startVoiceRecording}
          onPressOut={stopVoiceRecording}
        >
          <Text style={styles.micText}>{isRecording ? '🔴' : '🎙️'}</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={isRecording ? 'Listening to voice...' : 'Type a health question in English or Amharic...'}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSendMessage()}
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || loading}
        >
          <Text style={styles.sendBtnText}>Send</Text>
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
  micText: {
    fontSize: 18,
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

import { Audio } from 'expo-av';
import { File } from 'expo-file-system';

// Gemini only accepts a fixed set of audio containers, so record straight into
// one of them rather than the .m4a the HIGH_QUALITY preset produces.
const RECORDING_OPTIONS = {
  isMeteringEnabled: false,
  android: {
    extension: '.aac',
    outputFormat: Audio.AndroidOutputFormat.AAC_ADTS,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 64000,
  },
};

const MIME_BY_EXTENSION = {
  aac: 'audio/aac',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  webm: 'audio/webm',
};

/**
 * Begins recording and resolves with the live Recording object, or null when the
 * microphone is unavailable. The caller owns the handle and must pass it back to
 * stopRecording so the native recorder is released.
 */
export async function startRecording() {
  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) return null;

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
  return recording;
}

/** Stops the recording and returns the clip as base64 plus its MIME type. */
export async function stopRecording(recording) {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  if (!uri) throw new Error('Recording produced no audio file');

  const extension = uri.split('.').pop().toLowerCase();
  return {
    base64: await new File(uri).base64(),
    mimeType: MIME_BY_EXTENSION[extension] || 'audio/aac',
  };
}

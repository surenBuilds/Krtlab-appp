/**
 * Converts raw PCM audio data (16-bit, mono) to a playable WAV Blob URL.
 * Gemini TTS returns raw PCM at 24kHz.
 */
export function pcmToWav(pcmBase64: string, sampleRate: number = 24000): string {
  try {
    const binaryString = atob(pcmBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF chunk descriptor
    // "RIFF"
    view.setUint32(0, 0x52494646, false);
    // chunk size
    view.setUint32(4, 36 + len, true);
    // "WAVE"
    view.setUint32(8, 0x57415645, false);

    // fmt sub-chunk
    // "fmt "
    view.setUint32(12, 0x666d7420, false);
    // subchunk1size (16 for PCM)
    view.setUint32(16, 16, true);
    // audio format (1 for PCM)
    view.setUint16(20, 1, true);
    // num channels (1 for mono)
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sampleRate * numChannels * bitsPerSample/8)
    view.setUint32(28, sampleRate * 2, true);
    // block align (numChannels * bitsPerSample/8)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);

    // data sub-chunk
    // "data"
    view.setUint32(36, 0x64617461, false);
    // subchunk2size
    view.setUint32(40, len, true);

    const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error converting PCM to WAV:", error);
    return "";
  }
}

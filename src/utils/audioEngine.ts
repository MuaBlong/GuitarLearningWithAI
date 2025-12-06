// Audio Engine cho ứng dụng học nhạc lý
// Sử dụng Web Audio API để tạo và phát âm thanh guitar

export interface ChordNote {
  string: number; // Dây guitar (1-6)
  fret: number;   // Vị trí fret
  frequency: number; // Tần số của note
  duration: number; // Thời gian phát (seconds)
}

export interface AudioSettings {
  volume: number;
  distortion: number;
  reverb: number;
  tempo: number;
}

class AudioEngineClass {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private settings: AudioSettings = {
    volume: 0.5,
    distortion: 0,
    reverb: 0.1,
    tempo: 120
  };

  // Tần số chuẩn cho các note trên guitar (E4 = 329.63 Hz)
  private readonly noteFrequencies: { [key: string]: number } = {
    'C': 261.63,
    'C#': 277.18, 'Db': 277.18,
    'D': 293.66,
    'D#': 311.13, 'Eb': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99, 'Gb': 369.99,
    'G': 392.00,
    'G#': 415.30, 'Ab': 415.30,
    'A': 440.00,
    'A#': 466.16, 'Bb': 466.16,
    'B': 493.88
  };

  // Tuning chuẩn của guitar (từ dây 1 đến dây 6)
  private readonly standardTuning = ['E', 'B', 'G', 'D', 'A', 'E'];

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if suspended (required by browser autoplay policies)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isInitialized = true;
      console.log('🎵 Audio Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Audio Engine:', error);
      throw new Error('Không thể khởi tạo audio engine. Vui lòng kiểm tra quyền microphone.');
    }
  }

  // Tính tần số của note dựa trên dây và fret
  private getFrequencyForStringFret(string: number, fret: number): number {
    const openStringNote = this.standardTuning[string - 1];
    const baseFreq = this.noteFrequencies[openStringNote];
    
    // Mỗi fret tăng tần số lên 1 semitone (nhân với 2^(1/12))
    return baseFreq * Math.pow(2, fret / 12);
  }

  // Tạo oscillator cho một note
  private createOscillator(frequency: number, startTime: number, duration: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    // Setup oscillator
    oscillator.type = 'sawtooth'; // Âm thanh giống guitar hơn
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Setup filter (simulate guitar tone)
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(3000, startTime);
    filterNode.Q.setValueAtTime(1, startTime);

    // Setup envelope (ADSR)
    const attackTime = 0.01;
    const decayTime = 0.1;
    const sustainLevel = 0.3;
    const releaseTime = 0.5;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(this.settings.volume, startTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel * this.settings.volume, startTime + attackTime + decayTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    // Connect nodes
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Start and stop
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  // Phát một note đơn
  async playNote(string: number, fret: number, duration: number = 1): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioContext) return;

    const frequency = this.getFrequencyForStringFret(string, fret);
    const now = this.audioContext.currentTime;
    
    this.createOscillator(frequency, now, duration);
  }

  // Phát hợp âm từ finger position string
  async playChordFromFingerPattern(fingerPattern: string, duration: number = 2): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioContext) return;

    // Parse finger pattern (e.g., "E|0 B|1 G|0 D|2 A|3 E|x")
    const stringPositions = this.parseFingerPattern(fingerPattern);
    const now = this.audioContext.currentTime;

    // Phát từng note của hợp âm với delay nhỏ để tạo hiệu ứng strum
    stringPositions.forEach((pos, index) => {
      if (pos.fret >= 0) { // x = muted string
        const delay = index * 0.05; // 50ms delay between strings
        this.createOscillator(pos.frequency, now + delay, duration);
      }
    });
  }

  // Parse finger pattern thành array of positions
  private parseFingerPattern(pattern: string): Array<{string: number, fret: number, frequency: number}> {
    const parts = pattern.split(' ');
    const positions: Array<{string: number, fret: number, frequency: number}> = [];

    parts.forEach(part => {
      const [stringName, fretStr] = part.split('|');
      const stringNumber = this.getStringNumber(stringName);
      const fret = fretStr === 'x' ? -1 : parseInt(fretStr);
      
      if (stringNumber > 0 && fret >= 0) {
        const frequency = this.getFrequencyForStringFret(stringNumber, fret);
        positions.push({ string: stringNumber, fret, frequency });
      }
    });

    return positions;
  }

  // Convert string name to number (E=1, B=2, G=3, D=4, A=5, E=6)
  private getStringNumber(stringName: string): number {
    const stringMap: { [key: string]: number } = {
      'E': 1, // High E
      'B': 2,
      'G': 3,
      'D': 4,
      'A': 5,
      'e': 6  // Low E
    };
    return stringMap[stringName] || 0;
  }

  // Phát rhythm pattern
  async playRhythmPattern(
    fingerPattern: string, 
    pattern: Array<{beat: number, type: 'down' | 'up' | 'mute', duration: number}>,
    tempo: number = 120
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioContext) return;

    const beatDuration = 60 / tempo; // Duration of one beat in seconds
    const now = this.audioContext.currentTime;

    pattern.forEach(({ beat, type, duration }) => {
      const startTime = now + (beat * beatDuration);
      
      if (type === 'mute') {
        // Tạo âm thanh mute (percussive)
        this.createPercussiveSound(startTime, 0.1);
      } else {
        // Phát hợp âm với volume khác nhau cho up/down strokes
        const volume = type === 'down' ? this.settings.volume : this.settings.volume * 0.7;
        this.playChordFromFingerPatternAtTime(fingerPattern, startTime, duration, volume);
      }
    });
  }

  // Phát hợp âm tại thời điểm cụ thể
  private playChordFromFingerPatternAtTime(
    fingerPattern: string, 
    startTime: number, 
    duration: number, 
    volume: number
  ): void {
    const stringPositions = this.parseFingerPattern(fingerPattern);

    stringPositions.forEach((pos, index) => {
      if (pos.fret >= 0) {
        const delay = index * 0.02; // Faster strum
        this.createOscillatorWithVolume(pos.frequency, startTime + delay, duration, volume);
      }
    });
  }

  // Tạo oscillator với volume cụ thể
  private createOscillatorWithVolume(
    frequency: number, 
    startTime: number, 
    duration: number, 
    volume: number
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(3000, startTime);

    const attackTime = 0.01;
    const releaseTime = Math.min(duration * 0.5, 0.3);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  // Tạo âm thanh percussive cho mute
  private createPercussiveSound(startTime: number, duration: number): void {
    if (!this.audioContext) return;

    const noise = this.audioContext.createBufferSource();
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < buffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    noise.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    filterNode.type = 'highpass';
    filterNode.frequency.setValueAtTime(1000, startTime);

    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    noise.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    noise.start(startTime);
    noise.stop(startTime + duration);
  }

  // Phát metronome click
  async playMetronomeClick(isAccent: boolean = false): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const frequency = isAccent ? 800 : 600;
    const duration = 0.1;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Update settings
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Cleanup
  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }
}

// Export singleton instance
export const audioEngine = new AudioEngineClass();
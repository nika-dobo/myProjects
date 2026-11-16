/**
 * SoundShift Stage 4 - Pitch Detector & Autocorrelation DSP Mini-Game
 * Uses AnalyserNode.getFloatTimeDomainData() with Autocorrelation algorithm
 * to extract exact voice frequency in Hz and run station acoustic calibration tasks.
 */

class PitchDetectorEngine {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);

    // Mini-Game State
    this.isActive = false;
    this.targetFrequency = 440; // Default 440 Hz (A4 note)
    this.tolerance = 15;        // ±15 Hz tolerance
    this.holdDurationNeeded = 3.0; // 3 seconds
    this.currentHoldTime = 0;
    this.onTaskComplete = null;
  }

  /**
   * Run Autocorrelation algorithm to detect fundamental voice frequency in Hz
   * @returns {number} Frequency in Hz, or -1 if no clear pitch/speech detected
   */
  getPitch() {
    if (!window.soundShiftAudio || !window.soundShiftAudio.micAnalyser) return -1;

    const analyser = window.soundShiftAudio.micAnalyser;
    const sampleRate = window.soundShiftAudio.audioCtx.sampleRate;

    analyser.getFloatTimeDomainData(this.buffer);

    // 1. Calculate Root Mean Square (RMS) volume level
    let rms = 0;
    for (let i = 0; i < this.bufferSize; i++) {
      const val = this.buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / this.bufferSize);

    // If volume is below noise threshold, return -1
    if (rms < 0.015) return -1;

    // 2. Compute Autocorrelation
    let r1 = 0, r2 = this.bufferSize - 1;
    const threshold = 0.2;

    for (let i = 0; i < this.bufferSize / 2; i++) {
      if (Math.abs(this.buffer[i]) < threshold) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < this.bufferSize / 2; i++) {
      if (Math.abs(this.buffer[this.bufferSize - i]) < threshold) {
        r2 = this.bufferSize - i;
        break;
      }
    }

    const buf = this.buffer.slice(r1, r2);
    const bufSize = buf.length;

    const c = new Float32Array(bufSize);
    for (let i = 0; i < bufSize; i++) {
      for (let j = 0; j < bufSize - i; j++) {
        c[i] = c[i] + buf[j] * buf[j + i];
      }
    }

    // Find first trough
    let d = 0;
    while (c[d] > c[d + 1]) d++;

    // Find peak after trough
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < bufSize; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;

    // Parabolic interpolation for sub-sample precision
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    const frequency = sampleRate / T0;

    // Filter reasonable human vocal range (60 Hz to 1200 Hz)
    if (frequency >= 60 && frequency <= 1200) {
      return Math.round(frequency * 10) / 10;
    }

    return -1;
  }

  /**
   * Start Frequency Calibration Mini-Game
   */
  startMiniGame(targetHz = 440, onCompleteCallback = null) {
    this.targetFrequency = targetHz;
    this.currentHoldTime = 0;
    this.isActive = true;
    this.onTaskComplete = onCompleteCallback;

    const modal = document.getElementById('pitch-minigame-modal');
    if (modal) modal.classList.remove('hidden');

    const targetDisplay = document.getElementById('pitch-target-hz');
    if (targetDisplay) targetDisplay.textContent = `${targetHz} Hz`;

    console.log(`[PitchDetector] Started Mini-Game task. Target: ${targetHz} Hz`);
  }

  /**
   * Update Pitch Mini-Game state per frame
   */
  update(deltaTime = 0.033) {
    if (!this.isActive) return;

    const detectedHz = this.getPitch();
    const hzDisplay = document.getElementById('pitch-current-hz');
    const progressBar = document.getElementById('pitch-progress-bar');
    const gaugeIndicator = document.getElementById('pitch-gauge-indicator');

    if (hzDisplay) {
      hzDisplay.textContent = detectedHz > 0 ? `${detectedHz} Hz` : 'SING/HUM INTO MIC...';
    }

    if (detectedHz > 0) {
      const diff = Math.abs(detectedHz - this.targetFrequency);
      const isWithinTolerance = diff <= this.tolerance;

      // Position gauge indicator (-50px to +50px relative offset)
      if (gaugeIndicator) {
        const offsetPercent = Math.max(-100, Math.min(100, ((detectedHz - this.targetFrequency) / 100) * 100));
        gaugeIndicator.style.transform = `translateX(${offsetPercent}%)`;
        gaugeIndicator.className = `w-4 h-8 rounded-md transition-all ${
          isWithinTolerance ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-500'
        }`;
      }

      if (isWithinTolerance) {
        this.currentHoldTime += deltaTime;
        const percent = Math.min(100, (this.currentHoldTime / this.holdDurationNeeded) * 100);

        if (progressBar) {
          progressBar.style.width = `${percent}%`;
          progressBar.className = 'h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all';
        }

        if (this.currentHoldTime >= this.holdDurationNeeded) {
          this.isActive = false;
          console.log('[PitchDetector] Calibration Task SUCCESSFUL!');
          if (this.onTaskComplete) this.onTaskComplete();

          setTimeout(() => {
            const modal = document.getElementById('pitch-minigame-modal');
            if (modal) modal.classList.add('hidden');
          }, 800);
        }
      } else {
        // Decay hold progress when out of tune
        this.currentHoldTime = Math.max(0, this.currentHoldTime - deltaTime * 1.5);
        if (progressBar) progressBar.style.width = `${(this.currentHoldTime / this.holdDurationNeeded) * 100}%`;
      }
    } else {
      this.currentHoldTime = Math.max(0, this.currentHoldTime - deltaTime * 1.5);
      if (progressBar) progressBar.style.width = `${(this.currentHoldTime / this.holdDurationNeeded) * 100}%`;
    }
  }
}

// Global Instance
window.pitchDetector = new PitchDetectorEngine();

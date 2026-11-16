/**
 * SoundShift Stage 2 - 3D Web Audio Spatial Engine & WebRTC Mesh Manager
 * Handles PeerJS connections, Microphone capture, 3D HRTF PannerNodes,
 * and 3D Listener updates matching player positions in 3D space.
 */

class SoundShiftAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.micStream = null;
    this.micSource = null;
    this.micAnalyser = null;
    this.peer = null;
    this.myPeerId = null;
    this.socket = null;
    this.isMuted = false;
    this.isAudioUnlocked = false;

    // Map of remote socketId => { peerId, call, stream, sourceNode, gainNode, pannerNode, distance: number }
    this.remoteConnections = new Map();

    // Configuration
    this.MAX_AUDIBLE_DISTANCE = 35.0; // 35 meters max audible range
    this.REF_DISTANCE = 2.0;          // Reference distance for exponential decay
    this.ROLLOFF_FACTOR = 1.5;
  }

  /**
   * Unlock AudioContext on initial user gesture (required by Web Audio API autoplay policy)
   */
  async unlockAudio() {
    if (this.isAudioUnlocked) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.error('[AudioEngine] Web Audio API is not supported in this browser.');
      return;
    }

    this.audioCtx = new AudioContextClass();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.isAudioUnlocked = true;
    console.log('[AudioEngine] AudioContext successfully initialized and resumed.');
  }

  /**
   * Initialize Microphone capture and local AnalyserNode for volume metering
   */
  async initMicrophone() {
    await this.unlockAudio();

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      // Create AnalyserNode for local speaking indicator
      this.micSource = this.audioCtx.createMediaStreamSource(this.micStream);
      this.micAnalyser = this.audioCtx.createAnalyser();
      this.micAnalyser.fftSize = 256;
      this.micAnalyser.smoothingTimeConstant = 0.5;
      this.micSource.connect(this.micAnalyser);

      console.log('[AudioEngine] Microphone stream captured successfully.');
      return true;
    } catch (err) {
      console.error('[AudioEngine] Failed to access microphone:', err);
      return false;
    }
  }

  /**
   * Toggle local microphone mute state
   */
  toggleMute() {
    if (!this.micStream) return false;
    this.isMuted = !this.isMuted;
    this.micStream.getAudioTracks().forEach(track => {
      track.enabled = !this.isMuted;
    });
    console.log(`[AudioEngine] Microphone ${this.isMuted ? 'MUTED' : 'UNMUTED'}`);
    return this.isMuted;
  }

  /**
   * Calculate current local microphone volume level (0 to 100)
   */
  getMicLevel() {
    if (!this.micAnalyser || this.isMuted) return 0;
    const dataArray = new Uint8Array(this.micAnalyser.frequencyBinCount);
    this.micAnalyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    return Math.min(100, Math.round((average / 128) * 100));
  }

  /**
   * Initialize PeerJS WebRTC P2P Mesh Network
   */
  initPeerJS(socket) {
    this.socket = socket;

    // Use default public PeerJS server
    this.peer = new Peer({
      debug: 1
    });

    this.peer.on('open', (id) => {
      this.myPeerId = id;
      console.log(`[PeerJS] Successfully connected with Peer ID: ${id}`);
      this.socket.emit('register_peer', { peerId: id });
    });

    // Handle incoming P2P call from remote player
    this.peer.on('call', (call) => {
      console.log(`[PeerJS] Incoming audio call from peer: ${call.peer}`);
      if (this.micStream) {
        call.answer(this.micStream);
      } else {
        call.answer(); // Answer without mic if mic stream failed
      }

      call.on('stream', (remoteStream) => {
        this._attachRemoteStream(call.peer, remoteStream, call);
      });

      call.on('close', () => {
        this._removeRemotePeer(call.peer);
      });

      call.on('error', (err) => {
        console.error(`[PeerJS] Call error with peer ${call.peer}:`, err);
      });
    });

    this.peer.on('error', (err) => {
      console.error('[PeerJS] Peer connection error:', err);
    });
  }

  /**
   * Call a remote peer using their Peer ID
   */
  callPeer(socketId, peerId) {
    if (!this.peer || !this.micStream || peerId === this.myPeerId) return;

    console.log(`[PeerJS] Calling remote peer: ${peerId} (Socket: ${socketId})`);
    const call = this.peer.call(peerId, this.micStream);

    if (!call) return;

    call.on('stream', (remoteStream) => {
      this._attachRemoteStream(peerId, remoteStream, call, socketId);
    });

    call.on('close', () => {
      this._removeRemotePeer(peerId);
    });

    call.on('error', (err) => {
      console.error(`[PeerJS] Call error calling ${peerId}:`, err);
    });
  }

  /**
   * Attach remote audio stream to Web Audio 3D Spatial Pipeline
   * Pipeline: MediaStreamAudioSourceNode -> GainNode -> PannerNode (HRTF) -> AudioContext.destination
   */
  _attachRemoteStream(peerId, remoteStream, call, socketId = null) {
    if (!this.audioCtx) return;

    // Avoid duplicate pipeline creation for same peer
    if (this.remoteConnections.has(peerId)) {
      const existing = this.remoteConnections.get(peerId);
      existing.call = call;
      existing.stream = remoteStream;
      return;
    }

    // 1. Create MediaStreamAudioSourceNode
    const sourceNode = this.audioCtx.createMediaStreamSource(remoteStream);

    // 2. Create GainNode for volume control and attenuation
    const gainNode = this.audioCtx.createGain();
    gainNode.gain.value = 1.0;

    // 2b. Stage 4: Create Traitor Distortion Audio Node Chain (Radio Bandpass + Ring Modulator)
    const distortionFilter = this.audioCtx.createBiquadFilter();
    distortionFilter.type = 'bandpass';
    distortionFilter.frequency.value = 1200; // Bandpass centered at 1200 Hz for radio effect
    distortionFilter.Q.value = 2.5;

    // Ring Modulator Oscillator for Robotic Radio Interference
    const ringOsc = this.audioCtx.createOscillator();
    ringOsc.type = 'sine';
    ringOsc.frequency.value = 45; // 45 Hz carrier frequency
    ringOsc.start();

    const ringGain = this.audioCtx.createGain();
    ringGain.gain.value = 0.0; // Disabled by default, activated when Traitor is nearby (<15m)
    ringOsc.connect(ringGain.gain);

    // 3. Create 3D HRTF PannerNode
    const pannerNode = this.audioCtx.createPanner();
    pannerNode.panningModel = 'HRTF';
    pannerNode.distanceModel = 'exponential';
    pannerNode.refDistance = this.REF_DISTANCE;
    pannerNode.maxDistance = this.MAX_AUDIBLE_DISTANCE;
    pannerNode.rolloffFactor = this.ROLLOFF_FACTOR;

    // Initial 3D position offscreen until synchronized
    pannerNode.positionX.value = 0;
    pannerNode.positionY.value = 0;
    pannerNode.positionZ.value = 100;

    // Connect Pipeline: Source -> DistortionFilter -> GainNode -> PannerNode -> AudioContext.destination
    sourceNode.connect(distortionFilter);
    distortionFilter.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(this.audioCtx.destination);

    // Hidden audio HTML element to maintain stream playback state across browsers
    const audioElem = document.createElement('audio');
    audioElem.srcObject = remoteStream;
    audioElem.autoplay = true;
    audioElem.muted = true; // Audio is routed via Web Audio API destination, element muted to avoid duplicate output

    const peerData = {
      peerId,
      socketId,
      call,
      stream: remoteStream,
      sourceNode,
      gainNode,
      pannerNode,
      audioElem,
      distance: 0
    };

    this.remoteConnections.set(peerId, peerData);
    if (socketId) {
      this.remoteConnections.set(socketId, peerData); // Also index by socketId for quick position lookup
    }

    console.log(`[AudioEngine] 3D HRTF Audio Pipeline established for Peer ${peerId}`);
  }

  /**
   * Remove remote peer pipeline on disconnect
   */
  _removeRemotePeer(peerIdKey) {
    const peerData = this.remoteConnections.get(peerIdKey);
    if (peerData) {
      try {
        peerData.gainNode.disconnect();
        peerData.pannerNode.disconnect();
        if (peerData.audioElem) peerData.audioElem.remove();
      } catch (e) {
        // Suppress clean disconnect errors
      }
      this.remoteConnections.delete(peerData.peerId);
      if (peerData.socketId) this.remoteConnections.delete(peerData.socketId);
      console.log(`[AudioEngine] Removed audio pipeline for peer ${peerIdKey}`);
    }
  }

  /**
   * Update 3D Spatial Audio Listener position & Orientation, and all Remote PannerNodes
   * Called in main render/position update tick loop
   * @param {Object} myPos { x, y, z } Local player 3D position
   * @param {Object} myRot { y } Local player 3D rotation angle in radians
   * @param {Map|Array} remotePlayers List or map of remote player objects from server
   */
  update3DSpatialAudio(myPos, myRot, remotePlayers) {
    if (!this.audioCtx || !this.isAudioUnlocked) return;

    const time = this.audioCtx.currentTime;
    const listener = this.audioCtx.listener;

    // 1. Update 3D AudioListener position to match player's head position
    if (listener.positionX) {
      listener.positionX.setTargetAtTime(myPos.x, time, 0.05);
      listener.positionY.setTargetAtTime(myPos.y || 1.6, time, 0.05); // Standard eye height ~1.6m
      listener.positionZ.setTargetAtTime(myPos.z, time, 0.05);
    } else {
      // Legacy fallback for older Web Audio API
      listener.setPosition(myPos.x, myPos.y || 1.6, myPos.z);
    }

    // 2. Update 3D AudioListener Orientation (forward & up vectors)
    const rotY = myRot ? (myRot.y || 0) : 0;
    const forwardX = Math.sin(rotY);
    const forwardZ = -Math.cos(rotY);
    const forwardY = 0;

    if (listener.forwardX) {
      listener.forwardX.setTargetAtTime(forwardX, time, 0.05);
      listener.forwardY.setTargetAtTime(forwardY, time, 0.05);
      listener.forwardZ.setTargetAtTime(forwardZ, time, 0.05);
      listener.upX.setTargetAtTime(0, time, 0.05);
      listener.upY.setTargetAtTime(1, time, 0.05);
      listener.upZ.setTargetAtTime(0, time, 0.05);
    } else {
      listener.setOrientation(forwardX, forwardY, forwardZ, 0, 1, 0);
    }

    // 3. Update PannerNode position for each remote player
    if (!remotePlayers) return;

    const playerList = Array.isArray(remotePlayers) ? remotePlayers : Object.values(remotePlayers);

    playerList.forEach(player => {
      if (!player || player.socketId === this.socket?.id) return;

      const peerData = this.remoteConnections.get(player.socketId) || this.remoteConnections.get(player.peerId);

      if (peerData && peerData.pannerNode) {
        const px = player.x || 0;
        const py = player.y || 1.6;
        const pz = player.z || 0;

        // Set PannerNode 3D position
        peerData.pannerNode.positionX.setTargetAtTime(px, time, 0.05);
        peerData.pannerNode.positionY.setTargetAtTime(py, time, 0.05);
        peerData.pannerNode.positionZ.setTargetAtTime(pz, time, 0.05);

        // Calculate 3D Euclidean distance d = sqrt((x2-x1)^2 + (y2-y1)^2 + (z2-z1)^2)
        const dx = px - myPos.x;
        const dy = py - (myPos.y || 1.6);
        const dz = pz - myPos.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        peerData.distance = distance;

        // Apply custom cutoff when beyond MAX_AUDIBLE_DISTANCE
        if (distance > this.MAX_AUDIBLE_DISTANCE) {
          peerData.gainNode.gain.setTargetAtTime(0.0, time, 0.1);
        } else {
          peerData.gainNode.gain.setTargetAtTime(1.0, time, 0.1);
        }
      }
    });
  }
}

  /**
   * Stage 5: Play Built-in Soundboard Synthetic Audio FX over stream
   * @param {number} effectType 1: Alarm Siren, 2: Static Glitch, 3: Radar Beep, 4: Horn Warning
   */
  playSoundboardEffect(effectType) {
    if (!this.audioCtx || !this.isAudioUnlocked) return;

    const time = this.audioCtx.currentTime;

    if (effectType === 1) {
      // 1. Alarm Siren (Pitch frequency sweep 400Hz -> 1200Hz)
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, time);
      osc.frequency.exponentialRampToValueAtTime(1200, time + 0.4);

      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(time);
      osc.stop(time + 0.5);
      console.log('[Soundboard] Played Alarm Siren FX');
    } else if (effectType === 2) {
      // 2. Static Glitch Burst (White Noise Buffer)
      const bufferSize = this.audioCtx.sampleRate * 0.25; // 250ms
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

      noise.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start(time);
      console.log('[Soundboard] Played Static Glitch FX');
    } else if (effectType === 3) {
      // 3. Radar Pulse Beep (High Resonant Sine 880Hz)
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, time);

      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(time);
      osc.stop(time + 0.3);
      console.log('[Soundboard] Played Radar Beep FX');
    } else if (effectType === 4) {
      // 4. Horn Warning (Low Dual Saw Bass Horn)
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, time); // A2
      osc2.frequency.setValueAtTime(116.5, time); // Detuned A#2

      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 0.8);
      osc2.stop(time + 0.8);
      console.log('[Soundboard] Played Horn Warning FX');
    }
  }
}

// Global Audio Engine Instance
window.soundShiftAudio = new SoundShiftAudioEngine();

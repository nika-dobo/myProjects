/**
 * SoundShift Stage 4 - Frontend Application, 3D Engine & Pitch Detector Controller
 * Manages Socket.io client, PeerJS WebRTC P2P mesh audio, Three.js 3D World, 3D movement (KeyW/KeyA/KeyS/KeyD),
 * Pitch Detection Mini-Game (FFT Autocorrelation), and Spatial HRTF updates.
 */

(function () {
  'use strict';

  // Initialize Socket.io connection
  const socket = io();

  // Local State
  let myPlayerId = null;
  let myRole = null;
  let currentRoomId = null;
  let isHost = false;
  let myPosition = { x: 0, y: 1.6, z: 0 };
  let myRotation = { y: 0 }; // Rotation around Y axis in radians
  let movementKeys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
  let positionSyncInterval = null;

  // Remote connected players map: socketId => player object
  const remotePlayers = new Map();

  // DOM Elements
  const screens = {
    landing: document.getElementById('screen-landing'),
    lobby: document.getElementById('screen-lobby'),
    game: document.getElementById('screen-game')
  };

  const inputs = {
    nickname: document.getElementById('input-nickname'),
    roomCode: document.getElementById('input-room-code')
  };

  const buttons = {
    createRoom: document.getElementById('btn-create-room'),
    joinRoom: document.getElementById('btn-join-room'),
    copyCode: document.getElementById('btn-copy-code'),
    toggleReady: document.getElementById('btn-toggle-ready'),
    startGame: document.getElementById('btn-start-game'),
    emergencyMeeting: document.getElementById('btn-emergency-meeting'),
    closeRoleOverlay: document.getElementById('btn-close-role-overlay'),
    toggleMic: document.getElementById('btn-toggle-mic'),
    fullscreen: document.getElementById('btn-fullscreen')
  };

  const lobbyUI = {
    roomCode: document.getElementById('lobby-room-code'),
    playerCount: document.getElementById('lobby-player-count'),
    playerList: document.getElementById('lobby-player-list'),
    readyStatusText: document.getElementById('ready-status-text')
  };

  const gameUI = {
    roleBadge: document.getElementById('role-badge'),
    roleOverlay: document.getElementById('role-overlay'),
    roleTitle: document.getElementById('role-title'),
    roleDesc: document.getElementById('role-desc'),
    debugCoords: document.getElementById('debug-coords'),
    systemLog: document.getElementById('system-log'),
    proximityList: document.getElementById('audio-proximity-list'),
    micStatusIcon: document.getElementById('mic-status-icon'),
    micStatusText: document.getElementById('mic-status-text')
  };

  const keyElements = {
    w: document.getElementById('key-w'),
    a: document.getElementById('key-a'),
    s: document.getElementById('key-s'),
    d: document.getElementById('key-d')
  };

  // Restore saved nickname
  const savedNick = localStorage.getItem('soundshift_nickname');
  if (savedNick && inputs.nickname) {
    inputs.nickname.value = savedNick;
  }

  // --- UI Screen Navigation Helper ---
  function showScreen(screenKey) {
    Object.keys(screens).forEach((key) => {
      if (screens[key]) {
        screens[key].classList.toggle('hidden', key !== screenKey);
      }
    });
  }

  // --- Toast Notification Helper ---
  function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded-xl border text-xs font-semibold shadow-xl transition-all duration-300 pointer-events-auto flex items-center justify-between gap-3 ${
      type === 'error'
        ? 'bg-red-950/90 border-red-500/50 text-red-200'
        : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
    }`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="text-xs opacity-60 hover:opacity-100">&times;</button>
    `;

    toast.querySelector('button').onclick = () => toast.remove();
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  // --- System Log Helper ---
  function logMessage(text, colorClass = 'text-cyan-400') {
    if (!gameUI.systemLog) return;
    const item = document.createElement('div');
    item.className = colorClass;
    item.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    gameUI.systemLog.appendChild(item);
    gameUI.systemLog.scrollTop = gameUI.systemLog.scrollHeight;
  }

  // --- On-Screen WASD Keypress Visualizer Helper ---
  function updateKeyVisualizer(key, isPressed) {
    const elem = keyElements[key];
    if (elem) {
      if (isPressed) {
        elem.className = 'w-10 h-10 rounded-xl bg-cyan-400 text-slate-950 border border-cyan-300 flex items-center justify-center font-mono font-black text-sm shadow-lg shadow-cyan-400/50 scale-105 transition-all';
      } else {
        elem.className = 'w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-sm text-slate-300 shadow transition-all';
      }
    }
  }

  // --- Initialize Audio System ---
  async function setupAudioEngine() {
    if (window.soundShiftAudio) {
      await window.soundShiftAudio.initMicrophone();
      window.soundShiftAudio.initPeerJS(socket);
    }
  }

  // --- Event Listeners ---

  // Create Room
  buttons.createRoom.addEventListener('click', async () => {
    const nickname = inputs.nickname.value.trim();
    if (nickname) localStorage.setItem('soundshift_nickname', nickname);

    await setupAudioEngine();
    socket.emit('create_room', { nickname });
  });

  // Join Room
  buttons.joinRoom.addEventListener('click', async () => {
    const nickname = inputs.nickname.value.trim();
    const roomId = inputs.roomCode.value.trim().toUpperCase();

    if (!roomId) {
      showToast('Please enter a 6-digit room code.');
      return;
    }

    if (nickname) localStorage.setItem('soundshift_nickname', nickname);
    await setupAudioEngine();
    socket.emit('join_room', { roomId, nickname });
  });

  // Toggle Microphone Mute
  if (buttons.toggleMic) {
    buttons.toggleMic.addEventListener('click', () => {
      if (window.soundShiftAudio) {
        const isMuted = window.soundShiftAudio.toggleMute();
        gameUI.micStatusText.textContent = isMuted ? 'MIC MUTED' : 'MIC ACTIVE';
        gameUI.micStatusIcon.className = `w-2.5 h-2.5 rounded-full ${isMuted ? 'bg-red-500' : 'bg-emerald-400'}`;
        showToast(isMuted ? 'Microphone Muted' : 'Microphone Unmuted', isMuted ? 'error' : 'success');
      }
    });
  }

  // Toggle Fullscreen Viewport
  if (buttons.fullscreen) {
    buttons.fullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          showToast(`Full-screen error: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // Copy Room Code
  buttons.copyCode.addEventListener('click', () => {
    if (!currentRoomId) return;
    navigator.clipboard.writeText(currentRoomId)
      .then(() => showToast('Room code copied to clipboard!', 'success'))
      .catch(() => showToast('Failed to copy code.'));
  });

  // Toggle Ready
  buttons.toggleReady.addEventListener('click', () => {
    socket.emit('toggle_ready');
  });

  // Start Game
  buttons.startGame.addEventListener('click', () => {
    if (!isHost) return;
    socket.emit('start_game');
  });

  // Emergency Meeting
  buttons.emergencyMeeting.addEventListener('click', () => {
    socket.emit('trigger_meeting');
  });

  // Close Role Overlay
  buttons.closeRoleOverlay.addEventListener('click', () => {
    gameUI.roleOverlay.classList.add('hidden');
    // Offer Pitch Calibration task trigger
    if (window.pitchDetector && myRole === 'OPERATOR') {
      setTimeout(() => {
        window.pitchDetector.startMiniGame(440, () => {
          showToast('Station Transmitter Frequency Calibrated!', 'success');
          logMessage('Acoustic Transmitter calibrated to 440 Hz', 'text-emerald-400 font-bold');
        });
      }, 1500);
    }
  });

  // Keyboard Navigation using e.code for universal multi-language layout compatibility!
  window.addEventListener('keydown', (e) => {
    // Ignore keypresses if focus is inside input elements
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const code = e.code;
    const key = e.key.toLowerCase();

    if (code === 'KeyW' || key === 'w' || key === 'ц' || code === 'ArrowUp') {
      movementKeys.w = true;
      updateKeyVisualizer('w', true);
    }
    if (code === 'KeyA' || key === 'a' || key === 'ф' || code === 'ArrowLeft') {
      movementKeys.a = true;
      updateKeyVisualizer('a', true);
    }
    if (code === 'KeyS' || key === 's' || key === 'ы' || code === 'ArrowDown') {
      movementKeys.s = true;
      updateKeyVisualizer('s', true);
    }
    if (code === 'KeyD' || key === 'd' || key === 'в' || code === 'ArrowRight') {
      movementKeys.d = true;
      updateKeyVisualizer('d', true);
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const code = e.code;
    const key = e.key.toLowerCase();

    if (code === 'KeyW' || key === 'w' || key === 'ц' || code === 'ArrowUp') {
      movementKeys.w = false;
      updateKeyVisualizer('w', false);
    }
    if (code === 'KeyA' || key === 'a' || key === 'ф' || code === 'ArrowLeft') {
      movementKeys.a = false;
      updateKeyVisualizer('a', false);
    }
    if (code === 'KeyS' || key === 's' || key === 'ы' || code === 'ArrowDown') {
      movementKeys.s = false;
      updateKeyVisualizer('s', false);
    }
    if (code === 'KeyD' || key === 'd' || key === 'в' || code === 'ArrowRight') {
      movementKeys.d = false;
      updateKeyVisualizer('d', false);
    }
  });

  // 3D Camera-Relative WASD Movement Loop (~30Hz server sync + spatial audio update + Three.js lerp)
  function startMovementLoop() {
    if (positionSyncInterval) clearInterval(positionSyncInterval);

    const moveSpeed = 0.18; // meters per frame (~5.4 m/s)

    positionSyncInterval = setInterval(() => {
      let dx = 0;
      let dz = 0;

      if (movementKeys.w || movementKeys.ArrowUp) dz -= 1;
      if (movementKeys.s || movementKeys.ArrowDown) dz += 1;
      if (movementKeys.a || movementKeys.ArrowLeft) dx -= 1;
      if (movementKeys.d || movementKeys.ArrowRight) dx += 1;

      let moved = false;

      if (dx !== 0 || dz !== 0) {
        // Get current Camera Orbit Yaw angle from Three.js 3D Engine
        const cameraYaw = (window.soundShift3D && window.soundShift3D.isInitialized) ? window.soundShift3D.cameraYaw : 0;

        // Rotate WASD input direction vector by current cameraYaw angle
        const moveX = dx * Math.cos(cameraYaw) + dz * Math.sin(cameraYaw);
        const moveZ = -dx * Math.sin(cameraYaw) + dz * Math.cos(cameraYaw);

        // Normalize direction vector for uniform diagonal speed
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        const normX = moveX / length;
        const normZ = moveZ / length;

        myPosition.x += normX * moveSpeed;
        myPosition.z += normZ * moveSpeed;

        // Automatically rotate player mesh to face movement direction
        myRotation.y = Math.atan2(normX, -normZ);
        moved = true;
      }

      if (moved) {
        myPosition.x = Math.max(-28, Math.min(28, Math.round(myPosition.x * 100) / 100));
        myPosition.z = Math.max(-28, Math.min(28, Math.round(myPosition.z * 100) / 100));

        if (gameUI.debugCoords) {
          gameUI.debugCoords.textContent = `3D POS: X: ${myPosition.x}m, Z: ${myPosition.z}m`;
        }

        socket.emit('update_position', {
          x: myPosition.x,
          y: myPosition.y,
          z: myPosition.z,
          rotationY: myRotation.y
        });
      }

      // Update Three.js 3D Local Player Mesh & Camera
      if (window.soundShift3D && window.soundShift3D.isInitialized) {
        window.soundShift3D.updateLocalPlayerPosition(myPosition.x, myPosition.y, myPosition.z, myRotation.y);
      }

      // Update 3D HRTF Spatial Audio Engine
      if (window.soundShiftAudio) {
        window.soundShiftAudio.update3DSpatialAudio(myPosition, myRotation, Array.from(remotePlayers.values()));
        renderSpatialRadarUI();
      }

      // Update Pitch Detector Mini-Game Task Loop
      if (window.pitchDetector && window.pitchDetector.isActive) {
        window.pitchDetector.update(0.033);
      }
    }, 33); // ~30Hz tick rate
  }

  // Render 3D Spatial Audio Radar UI
  function renderSpatialRadarUI() {
    if (!gameUI.proximityList) return;

    if (remotePlayers.size === 0) {
      gameUI.proximityList.innerHTML = `<div class="text-slate-500 italic text-xs">No operators nearby...</div>`;
      return;
    }

    gameUI.proximityList.innerHTML = '';
    remotePlayers.forEach((player) => {
      const dx = (player.x || 0) - myPosition.x;
      const dy = (player.y || 1.6) - myPosition.y;
      const dz = (player.z || 0) - myPosition.z;
      const distance = Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz) * 10) / 10;

      const isAudible = distance <= 35.0;

      const item = document.createElement('div');
      item.className = 'flex items-center justify-between p-1.5 bg-slate-900/60 rounded-lg border border-slate-800 text-xs';
      item.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full ${isAudible ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}"></span>
          <span class="font-medium text-slate-200">${player.nickname}</span>
        </div>
        <div class="mono text-[11px] ${isAudible ? 'text-cyan-400' : 'text-slate-500'}">
          ${distance}m ${isAudible ? '🔊 3D HRTF' : '🔇 OUT OF RANGE'}
        </div>
      `;
      gameUI.proximityList.appendChild(item);
    });
  }

  // --- Socket.io Handlers ---

  socket.on('room_created', ({ roomId, player, roomState }) => {
    currentRoomId = roomId;
    myPlayerId = player.id;
    isHost = true;

    lobbyUI.roomCode.textContent = roomId;
    showScreen('lobby');
    renderLobby(roomState);
    showToast(`Room ${roomId} created! 3D Audio Mesh ready.`, 'success');
  });

  socket.on('joined_room', ({ roomId, player, roomState }) => {
    currentRoomId = roomId;
    myPlayerId = player.id;
    isHost = (player.socketId === roomState.hostId);

    lobbyUI.roomCode.textContent = roomId;
    showScreen('lobby');
    renderLobby(roomState);
    showToast(`Joined channel ${roomId}`, 'success');
  });

  socket.on('room_updated', (roomState) => {
    renderLobby(roomState);
  });

  socket.on('peer_updated', ({ socketId, peerId, nickname }) => {
    if (socketId !== socket.id && window.soundShiftAudio) {
      console.log(`[WebRTC Mesh] Discovered new peer ${nickname} (${peerId}). Initiating P2P stream...`);
      window.soundShiftAudio.callPeer(socketId, peerId);
      logMessage(`P2P 3D Audio channel linked with ${nickname}`, 'text-emerald-400');
    }
  });

  function renderLobby(roomState) {
    if (!roomState) return;

    lobbyUI.playerCount.textContent = `${roomState.playerCount}/${roomState.maxPlayers}`;
    isHost = (socket.id === roomState.hostId);

    if (isHost) {
      buttons.startGame.classList.remove('hidden');
      buttons.startGame.disabled = roomState.playerCount < 2;
    } else {
      buttons.startGame.classList.add('hidden');
    }

    lobbyUI.playerList.innerHTML = '';
    remotePlayers.clear();

    roomState.players.forEach((p) => {
      if (p.socketId !== socket.id) {
        remotePlayers.set(p.socketId, p);

        if (window.soundShift3D && window.soundShift3D.isInitialized) {
          window.soundShift3D.updateRemotePlayer(p.socketId, p.x || 0, p.y || 1.6, p.z || 0, p.rotationY || 0, p.nickname, p.role);
        }
      }

      const card = document.createElement('div');
      const isMe = p.socketId === socket.id;

      card.className = `glass-card p-3 rounded-xl flex items-center justify-between border ${
        isMe ? 'border-cyan-500/50 bg-cyan-950/20' : 'border-slate-800'
      }`;

      card.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs ${
            p.isHost ? 'text-amber-400 border border-amber-500/30' : 'text-slate-300'
          }">
            ${p.nickname.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="text-sm font-semibold text-white flex items-center gap-2">
              ${p.nickname} ${isMe ? '<span class="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">(You)</span>' : ''}
            </div>
            <div class="text-[10px] text-slate-400 mono">
              ${p.peerId ? `3D PEER: ${p.peerId.substring(0, 8)}...` : 'CONNECTING AUDIO...'}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          ${p.isHost ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">HOST</span>' : ''}
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
            p.ready ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
          }">
            ${p.ready ? 'READY' : 'NOT READY'}
          </span>
        </div>
      `;

      lobbyUI.playerList.appendChild(card);

      if (isMe && lobbyUI.readyStatusText) {
        lobbyUI.readyStatusText.textContent = p.ready ? 'SET NOT READY' : 'SET READY';
      }

      if (!isMe && p.peerId && window.soundShiftAudio) {
        window.soundShiftAudio.callPeer(p.socketId, p.peerId);
      }
    });
  }

  socket.on('game_started', ({ role, x, y, z, rotationY, roomState }) => {
    myRole = role;
    myPosition = { x: x || 0, y: y || 1.6, z: z || 0 };
    myRotation = { y: rotationY || 0 };

    showScreen('game');

    if (window.soundShift3D) {
      window.soundShift3D.init(socket.id, role);
      window.soundShift3D.spawnLocalPlayer(myPosition.x, myPosition.y, myPosition.z, myRotation.y, savedNick || 'Operator', role);

      remotePlayers.forEach((p, sId) => {
        window.soundShift3D.updateRemotePlayer(sId, p.x || 0, p.y || 1.6, p.z || 0, p.rotationY || 0, p.nickname, p.role);
      });
    }

    const isTraitor = (role === 'NOISE');
    gameUI.roleBadge.textContent = `ROLE: ${role}`;
    gameUI.roleBadge.className = `px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
      isTraitor
        ? 'bg-red-950/80 border border-red-500/50 text-red-400 glow-text-red'
        : 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 glow-text-cyan'
    }`;

    gameUI.roleTitle.textContent = isTraitor ? 'NOISE (ПОМЕХА)' : 'OPERATOR (ОПЕРАТОР)';
    gameUI.roleTitle.className = `text-4xl sm:text-6xl font-black tracking-widest uppercase ${
      isTraitor ? 'text-red-500 glow-text-red' : 'text-cyan-400 glow-text-cyan'
    }`;

    gameUI.roleDesc.textContent = isTraitor
      ? 'Sabotage station systems, disrupt 3D voice channels, and eliminate operators during Silence mode.'
      : 'Maintain acoustic transmitters, calibrate frequencies in 3D space, and identify the Intruder.';

    gameUI.roleOverlay.classList.remove('hidden');

    logMessage(`3D Mission Started! Role: ${role}`, isTraitor ? 'text-red-400 font-bold' : 'text-cyan-400 font-bold');

    startMovementLoop();
  });

  socket.on('player_moved', ({ socketId, x, y, z, rotationY }) => {
    const p = remotePlayers.get(socketId);
    if (p) {
      p.x = x;
      p.y = y;
      p.z = z;
      p.rotationY = rotationY;

      if (window.soundShift3D && window.soundShift3D.isInitialized) {
        window.soundShift3D.updateRemotePlayer(socketId, x, y, z, rotationY, p.nickname, p.role);
      }
    }
  });

  socket.on('meeting_started', ({ callerName }) => {
    logMessage(`EMERGENCY MEETING called by ${callerName}!`, 'text-amber-400 font-bold');
    showToast(`Emergency Meeting called by ${callerName}!`, 'error');
  });

  socket.on('player_left', ({ socketId }) => {
    remotePlayers.delete(socketId);
    if (window.soundShift3D && window.soundShift3D.remotePlayers) {
      const remote = window.soundShift3D.remotePlayers.get(socketId);
      if (remote && remote.mesh) {
        window.soundShift3D.scene.remove(remote.mesh);
        window.soundShift3D.remotePlayers.delete(socketId);
      }
    }
    logMessage(`Operator disconnected from channel.`, 'text-slate-400');
  });

  socket.on('error_message', ({ message }) => {
    showToast(message, 'error');
  });

})();

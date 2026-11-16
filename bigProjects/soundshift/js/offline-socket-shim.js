/**
 * Local single-player / static demo shim for Socket.io when SoundShift
 * is launched statically without the Node.js Express + Socket.io backend.
 */
(function () {
  if (typeof window.io === "function") return;

  window.io = function createOfflineSocket() {
    const handlers = {};
    const socket = {
      id: "local-op-1",
      on(event, fn) {
        handlers[event] = handlers[event] || [];
        handlers[event].push(fn);
      },
      emit(event, payload = {}) {
        handleClientEmit(event, payload);
      },
    };

    function trigger(event, data) {
      (handlers[event] || []).forEach((fn) => fn(data));
    }

    let room = null;
    let botTimer = null;

    function buildRoomState() {
      return {
        roomId: room.roomId,
        hostId: socket.id,
        playerCount: room.players.length,
        maxPlayers: 8,
        players: room.players,
      };
    }

    function handleClientEmit(event, payload) {
      if (event === "create_room" || event === "join_room") {
        const nick = (payload.nickname || "").trim() || "Echo-1";
        const code = payload.roomId || "DEMO3D";
        const me = {
          id: "p1",
          socketId: socket.id,
          nickname: nick,
          isHost: true,
          ready: true,
          peerId: "local-peer-1",
          x: 0,
          y: 1.6,
          z: 4,
          rotationY: 0,
          role: "OPERATOR",
        };
        const bot1 = {
          id: "p2",
          socketId: "bot-vega",
          nickname: "Vega-2 (AI)",
          isHost: false,
          ready: true,
          peerId: "",
          x: -5,
          y: 1.6,
          z: -3,
          rotationY: 0.4,
          role: "OPERATOR",
        };
        const bot2 = {
          id: "p3",
          socketId: "bot-cipher",
          nickname: "Cipher-9 (AI)",
          isHost: false,
          ready: true,
          peerId: "",
          x: 6,
          y: 1.6,
          z: -4,
          rotationY: -0.6,
          role: "NOISE",
        };
        room = { roomId: code, players: [me, bot1, bot2] };
        setTimeout(() => {
          trigger(event === "create_room" ? "room_created" : "joined_room", {
            roomId: code,
            player: me,
            roomState: buildRoomState(),
          });
        }, 60);
      } else if (event === "toggle_ready" && room) {
        const me = room.players.find((p) => p.socketId === socket.id);
        if (me) me.ready = !me.ready;
        trigger("room_updated", buildRoomState());
      } else if (event === "start_game" && room) {
        trigger("game_started", {
          role: "OPERATOR",
          x: 0,
          y: 1.6,
          z: 4,
          rotationY: 0,
          roomState: buildRoomState(),
        });
        if (botTimer) clearInterval(botTimer);
        let t = 0;
        botTimer = setInterval(() => {
          t += 0.08;
          const b1x = Math.cos(t) * 5;
          const b1z = Math.sin(t) * 5 - 2;
          const b2x = Math.sin(t * 0.7) * 7;
          const b2z = Math.cos(t * 0.7) * 6 - 3;
          trigger("player_moved", { socketId: "bot-vega", x: b1x, y: 1.6, z: b1z, rotationY: t });
          trigger("player_moved", { socketId: "bot-cipher", x: b2x, y: 1.6, z: b2z, rotationY: -t });
        }, 120);
      } else if (event === "trigger_meeting" && room) {
        const me = room.players.find((p) => p.socketId === socket.id);
        trigger("meeting_started", { callerName: me ? me.nickname : "Operator" });
      }
    }

    return socket;
  };
})();

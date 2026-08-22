const fs = require("fs");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const DEFAULT_PORT = Number(process.env.PORT || process.env.LOVESEAT_PORT || 3847);
const INTERACT_COOLDOWN_MS = Number(process.env.LOVESEAT_COOLDOWN_MS || 15 * 1000);
const MAX_MESSAGE = 48;
const LOVE_EMOTES = ["♥", "💕", "💖", "💗", "💓", "💞", "💘", "💝", "😍", "🥰", "🌸", "💌"];
const SEATS = [
  { x: 92, y: 172 },
  { x: 152, y: 172 },
  { x: 248, y: 164 },
  { x: 360, y: 170 },
  { x: 300, y: 198 },
  { x: 430, y: 150 },
];
const RENDERER = path.join(__dirname, "..", "renderer");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const LEVELS = [
  { name: "Stranger", min: 0 },
  { name: "Friend", min: 4 },
  { name: "Close", min: 10 },
  { name: "Family", min: 18 },
  { name: "Lover", min: 28 },
];

function levelFor(score) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (score >= level.min) current = level;
  }
  return current.name;
}

function pairKey(a, b) {
  return [a, b].sort().join(":");
}

function createRoom() {
  return {
    users: new Map(),
    seats: Array(6).fill(null),
    relationships: new Map(),
    lastInteractAt: new Map(),
    bubbles: [],
  };
}

const rooms = new Map();

function getRoom(code) {
  const key = String(code || "hearth").trim().toLowerCase() || "hearth";
  if (!rooms.has(key)) rooms.set(key, createRoom());
  return { key, room: rooms.get(key) };
}

function playerIdOf(payload, socket) {
  const raw = String(payload?.playerId || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 40);
  return raw.length >= 8 ? raw : socket.id;
}

function assignSeat(room, userId, preferred) {
  const held = room.seats.indexOf(userId);
  if (held !== -1) return held;
  if (Number.isInteger(preferred) && preferred >= 0 && preferred < room.seats.length && !room.seats[preferred]) {
    room.seats[preferred] = userId;
    return preferred;
  }
  const free = room.seats.findIndex((id) => !id);
  if (free === -1) return -1;
  room.seats[free] = userId;
  return free;
}

function leaveRoom(room, userId) {
  room.users.delete(userId);
  room.lastInteractAt.delete(userId);
  room.seats = room.seats.map((id) => (id === userId ? null : id));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function publicState(room) {
  return {
    seats: room.seats,
    users: Object.fromEntries(
      [...room.users.entries()].map(([id, user]) => [
        id,
        {
          id: user.id,
          name: user.name,
          appearance: user.appearance,
          seat: user.seat,
          x: user.x,
          y: user.y,
          pose: user.pose,
          facing: user.facing,
          location: user.location || null,
          joinedAt: user.joinedAt,
        },
      ])
    ),
    relationships: Object.fromEntries(
      [...room.relationships.entries()].map(([key, score]) => [
        key,
        { score, level: levelFor(score) },
      ])
    ),
    bubbles: room.bubbles.slice(-8),
    cooldownMs: INTERACT_COOLDOWN_MS,
  };
}

function emitRoom(io, key, room) {
  io.to(key).emit("room:state", publicState(room));
}

function roomStats() {
  let players = 0;
  for (const room of rooms.values()) players += room.users.size;
  return { rooms: rooms.size, players };
}

function safeFile(urlPath) {
  const cleaned = decodeURIComponent(urlPath.split("?")[0]);
  const name = cleaned === "/" ? "/index.html" : cleaned;
  const abs = path.normalize(path.join(RENDERER, name));
  if (!abs.startsWith(RENDERER)) return null;
  return abs;
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}

function handleHttp(req, res) {
  const url = req.url || "/";
  if (url.startsWith("/health")) {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify({ ok: true, service: "little-loveseat", ...roomStats() }));
    return;
  }
  const file = safeFile(url);
  if (!file) {
    res.writeHead(403);
    res.end();
    return;
  }
  sendFile(res, file);
}

function attachHearth(httpServer, options = {}) {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
    transports: ["websocket", "polling"],
    pingInterval: 20000,
    pingTimeout: 25000,
    allowEIO3: true,
    path: options.socketPath || "/socket.io",
  });

  io.on("connection", (socket) => {
    let joined = null;
    let userId = socket.id;

    socket.on("room:join", (payload, ack) => {
      const name = String(payload?.character?.name || "").trim().slice(0, 16);
      if (!name) {
        ack?.({ ok: false, error: "Name your character first." });
        return;
      }

      userId = playerIdOf(payload, socket);
      socket.data.userId = userId;

      if (joined) {
        const prev = rooms.get(joined);
        if (prev) {
          const occupant = prev.users.get(userId);
          if (!occupant || occupant.socketId === socket.id) {
            leaveRoom(prev, userId);
          }
          socket.leave(joined);
          emitRoom(io, joined, prev);
          if (prev.users.size === 0) rooms.delete(joined);
        }
      }

      const { key, room } = getRoom(payload?.room);
      const existing = room.users.get(userId);
      const seat = assignSeat(room, userId, existing?.seat);
      if (seat === -1) {
        ack?.({ ok: false, error: "This room is full. Try another code." });
        return;
      }

      const spot = SEATS[seat];
      room.users.set(userId, {
        id: userId,
        socketId: socket.id,
        name,
        appearance: payload.character.appearance || {},
        seat,
        x: existing?.x ?? spot.x,
        y: existing?.y ?? spot.y,
        pose: existing?.pose || "sit",
        facing: existing?.facing || "right",
        location: existing?.location || null,
        joinedAt: existing?.joinedAt || Date.now(),
      });
      socket.join(key);
      joined = key;
      emitRoom(io, key, room);
      ack?.({ ok: true, id: userId, room: key, seat, cooldownMs: INTERACT_COOLDOWN_MS });
    });

    socket.on("interact", (payload, ack) => {
      if (!joined) {
        ack?.({ ok: false, error: "Join a room first." });
        return;
      }
      const room = rooms.get(joined);
      if (!room) {
        ack?.({ ok: false, error: "Room missing." });
        return;
      }
      const me = room.users.get(userId);
      const target = room.users.get(payload?.targetId);
      if (!me || !target || target.id === me.id) {
        ack?.({ ok: false, error: "Pick someone sitting with you." });
        return;
      }

      const now = Date.now();
      const last = room.lastInteractAt.get(userId) || 0;
      const wait = INTERACT_COOLDOWN_MS - (now - last);
      if (wait > 0) {
        ack?.({ ok: false, error: "Wait 15 seconds between notes.", waitMs: wait });
        return;
      }

      const type = payload?.type === "love" ? "love" : "message";
      const emote = LOVE_EMOTES.includes(payload?.emote) ? payload.emote : LOVE_EMOTES[0];
      const text =
        type === "love"
          ? emote
          : String(payload?.text || "")
              .trim()
              .slice(0, MAX_MESSAGE);
      if (type === "message" && !text) {
        ack?.({ ok: false, error: "Write a tiny note." });
        return;
      }

      const key = pairKey(me.id, target.id);
      const gain = type === "love" ? 3 : 1;
      const score = (room.relationships.get(key) || 0) + gain;
      room.relationships.set(key, score);
      room.lastInteractAt.set(userId, now);
      const bubble = {
        id: `${now}-${me.id}`,
        from: me.id,
        to: target.id,
        type,
        text,
        at: now,
        level: levelFor(score),
        score,
      };
      room.bubbles.push(bubble);
      if (room.bubbles.length > 24) room.bubbles.shift();
      emitRoom(io, joined, room);
      ack?.({ ok: true, waitMs: INTERACT_COOLDOWN_MS, relationship: bubble });
    });

    socket.on("room:move", (payload, ack) => {
      if (!joined) {
        ack?.({ ok: false, error: "Join a room first." });
        return;
      }
      const room = rooms.get(joined);
      const me = room?.users.get(userId);
      if (!me) {
        ack?.({ ok: false, error: "You are not in this room." });
        return;
      }
      const x = clamp(Number(payload?.x) || me.x, 40, 500);
      const y = clamp(Number(payload?.y) || me.y, 110, 230);
      const pose = payload?.pose === "sit" ? "sit" : payload?.pose === "walk" ? "walk" : "stand";
      let seat = Number.isInteger(payload?.seat) ? payload.seat : null;
      if (seat !== null && (seat < 0 || seat >= SEATS.length)) seat = null;
      if (seat !== null) {
        const occupant = room.seats[seat];
        if (occupant && occupant !== userId) {
          ack?.({ ok: false, error: "That seat is taken." });
          return;
        }
        room.seats = room.seats.map((id) => (id === userId ? null : id));
        room.seats[seat] = userId;
        me.x = SEATS[seat].x;
        me.y = SEATS[seat].y;
        me.pose = "sit";
        me.seat = seat;
      } else {
        room.seats = room.seats.map((id) => (id === userId ? null : id));
        me.x = x;
        me.y = y;
        me.pose = pose === "sit" ? "stand" : pose;
        me.seat = null;
      }
      me.facing = payload?.facing === "left" ? "left" : "right";
      emitRoom(io, joined, room);
      ack?.({ ok: true, x: me.x, y: me.y, pose: me.pose, seat: me.seat });
    });

    socket.on("location:share", (payload, ack) => {
      if (!joined) {
        ack?.({ ok: false, error: "Join a room first." });
        return;
      }
      const room = rooms.get(joined);
      const me = room?.users.get(userId);
      if (!me) {
        ack?.({ ok: false, error: "You are not in this room." });
        return;
      }
      const label = String(payload?.label || "")
        .trim()
        .slice(0, 48);
      if (!label) {
        ack?.({ ok: false, error: "No place to share." });
        return;
      }
      const lat = Number(payload?.lat);
      const lng = Number(payload?.lng);
      me.location = {
        label,
        lat: Number.isFinite(lat) ? Math.round(lat * 100) / 100 : null,
        lng: Number.isFinite(lng) ? Math.round(lng * 100) / 100 : null,
      };
      emitRoom(io, joined, room);
      ack?.({ ok: true, location: me.location });
    });

    socket.on("disconnect", () => {
      if (!joined) return;
      const room = rooms.get(joined);
      if (!room) return;
      const occupant = room.users.get(userId);
      if (occupant && occupant.socketId !== socket.id) return;
      leaveRoom(room, userId);
      emitRoom(io, joined, room);
      if (room.users.size === 0) rooms.delete(joined);
    });
  });

  return io;
}

function createHttpServer() {
  return http.createServer(handleHttp);
}

function startHttpServer(port, options = {}) {
  const httpServer = createHttpServer();
  const io = attachHearth(httpServer, options);
  return new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, "0.0.0.0", () => {
      httpServer.removeListener("error", reject);
      resolve({ httpServer, io, port });
    });
  });
}

async function startServer(preferredPort = DEFAULT_PORT) {
  try {
    const started = await startHttpServer(preferredPort);
    console.log(`Little Loveseat listening on 0.0.0.0:${started.port}`);
    return started;
  } catch (err) {
    if (err && err.code === "EADDRINUSE") {
      console.log(`Port ${preferredPort} already in use — joining existing hearth.`);
      return { port: preferredPort, reused: true };
    }
    throw err;
  }
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  startServer,
  attachHearth,
  createHttpServer,
  DEFAULT_PORT,
  INTERACT_COOLDOWN_MS,
};

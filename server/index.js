const http = require("http");
const { Server } = require("socket.io");

const DEFAULT_PORT = Number(process.env.PORT || process.env.LOVESEAT_PORT || 3847);
const INTERACT_COOLDOWN_MS = Number(process.env.LOVESEAT_COOLDOWN_MS || 5 * 60 * 1000);
const MAX_MESSAGE = 48;

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

function assignSeat(room, userId) {
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

function publicState(room) {
  return {
    seats: room.seats,
    users: Object.fromEntries(room.users),
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

function startHttpServer(port) {
  const httpServer = http.createServer((req, res) => {
    const url = req.url || "/";
    if (url.startsWith("/health")) {
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ ok: true, service: "little-loveseat", ...roomStats() }));
      return;
    }
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Little Loveseat hearth is lit. Point the widget server URL here.");
  });
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
    transports: ["websocket", "polling"],
    pingInterval: 20000,
    pingTimeout: 25000,
    allowEIO3: true,
  });

  io.on("connection", (socket) => {
    let joined = null;

    socket.on("room:join", (payload, ack) => {
      const name = String(payload?.character?.name || "").trim().slice(0, 16);
      if (!name) {
        ack?.({ ok: false, error: "Name your character first." });
        return;
      }
      if (joined) {
        const prev = rooms.get(joined);
        if (prev) {
          leaveRoom(prev, socket.id);
          socket.leave(joined);
          emitRoom(io, joined, prev);
        }
      }

      const { key, room } = getRoom(payload?.room);
      const seat = assignSeat(room, socket.id);
      if (seat === -1) {
        ack?.({ ok: false, error: "This room is full. Try another code." });
        return;
      }

      room.users.set(socket.id, {
        id: socket.id,
        name,
        appearance: payload.character.appearance || {},
        seat,
        joinedAt: Date.now(),
      });
      socket.join(key);
      joined = key;
      emitRoom(io, key, room);
      ack?.({ ok: true, id: socket.id, room: key, seat, cooldownMs: INTERACT_COOLDOWN_MS });
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
      const me = room.users.get(socket.id);
      const target = room.users.get(payload?.targetId);
      if (!me || !target || target.id === me.id) {
        ack?.({ ok: false, error: "Pick someone sitting with you." });
        return;
      }

      const now = Date.now();
      const last = room.lastInteractAt.get(socket.id) || 0;
      const wait = INTERACT_COOLDOWN_MS - (now - last);
      if (wait > 0) {
        ack?.({ ok: false, error: "Hearts need a rest.", waitMs: wait });
        return;
      }

      const type = payload?.type === "love" ? "love" : "message";
      const text =
        type === "love"
          ? "♥"
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
      room.lastInteractAt.set(socket.id, now);
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

    socket.on("disconnect", () => {
      if (!joined) return;
      const room = rooms.get(joined);
      if (!room) return;
      leaveRoom(room, socket.id);
      emitRoom(io, joined, room);
      if (room.users.size === 0) rooms.delete(joined);
    });
  });

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

module.exports = { startServer, DEFAULT_PORT, INTERACT_COOLDOWN_MS };

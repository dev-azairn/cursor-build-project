const STORAGE_KEY = "little-loveseat-v2";
const PLAYER_KEY = "little-loveseat-player";
const DEFAULT_ROOM = "hearth";
const isWeb = location.protocol.startsWith("http");
const FEATURES = ["accessory", "hair", "eyes", "sex", "skin", "pose"];
const CLOTH_KINDS = ["dress", "top", "bottom", "color"];

const state = {
  character: {
    name: "",
    appearance: LoveseatStyles.defaultAppearance("female"),
  },
  room: DEFAULT_ROOM,
  serverUrl: "",
  alwaysOnTop: true,
  lastInteractAt: 0,
  cooldownMs: 5 * 60 * 1000,
  meId: null,
  selectedId: null,
  inRoom: false,
  feature: "hair",
  clothKind: "dress",
  animFrame: 0,
  previewPose: "stand",
  snapshot: { seats: Array(6).fill(null), users: {}, relationships: {}, bubbles: [] },
};

let socket = null;
let seenBubbles = new Set();

function playerId() {
  let id = localStorage.getItem(PLAYER_KEY) || "";
  if (!/^[a-zA-Z0-9_-]{8,40}$/.test(id)) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}${Math.random()}`).replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);
    localStorage.setItem(PLAYER_KEY, id);
  }
  return id;
}

function loadLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.character) {
      state.character.name = saved.character.name || "";
      state.character.appearance = LoveseatArt.appearanceOf(saved.character.appearance || {});
    }
    if (saved?.room) state.room = saved.room;
    if (saved?.serverUrl) state.serverUrl = saved.serverUrl;
    if (typeof saved?.alwaysOnTop === "boolean") state.alwaysOnTop = saved.alwaysOnTop;
    if (saved?.lastInteractAt) state.lastInteractAt = saved.lastInteractAt;
  } catch {
    /* ignore */
  }
  if (!isWeb) return;
  const q = new URLSearchParams(location.search);
  if (q.get("room")) state.room = q.get("room").trim().toLowerCase() || DEFAULT_ROOM;
  if (q.get("server")) state.serverUrl = normalizeServerUrl(q.get("server"));
}

function saveLocal() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      character: state.character,
      room: state.room,
      serverUrl: state.serverUrl,
      alwaysOnTop: state.alwaysOnTop,
      lastInteractAt: state.lastInteractAt,
    })
  );
}

function $(id) {
  return document.getElementById(id);
}

function pairKey(a, b) {
  return [a, b].sort().join(":");
}

function normalizeServerUrl(raw) {
  const trimmed = String(raw || "").trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

function remainingMs() {
  return Math.max(0, state.cooldownMs - (Date.now() - state.lastInteractAt));
}

function formatWait(ms) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function setStatus(text) {
  $("status").textContent = text;
}

function showModal(id, visible) {
  $(id).classList.toggle("hidden", !visible);
}

function showDashboard(visible) {
  $("dashboard").classList.toggle("hidden", !visible);
  $("stage").classList.toggle("hidden", visible);
  $("chrome-drag").textContent = visible ? "Character Customization" : "Little Loveseat";
}

function randomRoomCode() {
  const words = ["hearth", "cocoa", "petal", "nook", "honey", "maple"];
  return `${words[Math.floor(Math.random() * words.length)]}${Math.floor(10 + Math.random() * 89)}`;
}

function featureItems() {
  const app = state.character.appearance;
  if (state.feature === "accessory") return LoveseatStyles.ACCESSORIES.map((a) => a.id);
  if (state.feature === "hair") return LoveseatStyles.hairForSex(app.sex).map((h) => h.id);
  if (state.feature === "eyes") return LoveseatStyles.EYE_COLORS.map((c) => c.hex);
  if (state.feature === "sex") return ["female", "male"];
  if (state.feature === "skin") return LoveseatStyles.SKINS;
  return ["stand", "sit"];
}

function currentFeatureValue() {
  const app = state.character.appearance;
  if (state.feature === "accessory") return app.accessory;
  if (state.feature === "hair") return app.hair;
  if (state.feature === "eyes") return app.eyeColor;
  if (state.feature === "sex") return app.sex;
  if (state.feature === "skin") return app.skin;
  return state.previewPose;
}

function applyFeatureValue(value) {
  const app = state.character.appearance;
  if (state.feature === "accessory") app.accessory = value;
  else if (state.feature === "hair") app.hair = value;
  else if (state.feature === "eyes") app.eyeColor = value;
  else if (state.feature === "sex") {
    state.character.appearance = LoveseatStyles.defaultAppearance(value);
  } else if (state.feature === "skin") app.skin = value;
  else state.previewPose = value;
  syncCustomize();
}

function cycleFeature(dir) {
  const items = featureItems();
  const i = Math.max(0, items.indexOf(currentFeatureValue()));
  applyFeatureValue(items[(i + dir + items.length) % items.length]);
}

function clothItems() {
  const app = state.character.appearance;
  if (state.clothKind === "dress") return app.sex === "female" ? LoveseatStyles.DRESSES : [];
  if (state.clothKind === "top") return LoveseatStyles.TOPS;
  if (state.clothKind === "bottom") return LoveseatStyles.bottomsForSex(app.sex);
  return LoveseatStyles.CLOTH_COLORS;
}

function renderPreview() {
  LoveseatArt.drawCharacter($("preview"), state.character.appearance, {
    pose: state.previewPose,
    frame: state.animFrame,
    scale: 6,
  });
}

function slotButton(selected, draw, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `slot ${selected ? "on" : ""}`;
  const canvas = document.createElement("canvas");
  canvas.width = 36;
  canvas.height = 36;
  draw(canvas);
  btn.appendChild(canvas);
  btn.addEventListener("click", onClick);
  return btn;
}

function fillFeatureSlots() {
  const root = $("feature-slots");
  root.innerHTML = "";
  const app = state.character.appearance;
  FEATURES.forEach((id) => {
    root.appendChild(
      slotButton(state.feature === id, (canvas) => {
        if (id === "accessory") LoveseatArt.drawClothIcon(canvas, "accessory", app.accessory, app.clothColor);
        else if (id === "hair") LoveseatArt.drawClothIcon(canvas, "hair", app.hair, app.hairColor);
        else if (id === "eyes") {
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = app.eyeColor;
          ctx.fillRect(8, 8, 20, 20);
        } else if (id === "sex") {
          LoveseatArt.drawCharacter(canvas, app, { pose: "stand", scale: 2, frame: 0 });
        } else if (id === "skin") {
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = app.skin;
          ctx.fillRect(6, 6, 24, 24);
        } else LoveseatArt.drawCharacter(canvas, app, { pose: state.previewPose, scale: 2, frame: 0 });
      }, () => {
        state.feature = id;
        syncCustomize();
      })
    );
  });
}

function fillClothSlots() {
  const root = $("cloth-slots");
  root.innerHTML = "";
  const app = state.character.appearance;
  if (state.clothKind === "dress" && app.sex !== "female") state.clothKind = "top";
  const items = clothItems();
  items.forEach((item) => {
    const id = item.id || item.hex || item;
    const selected =
      (state.clothKind === "dress" && app.wearDress && app.dress === id) ||
      (state.clothKind === "top" && !app.wearDress && app.top === id) ||
      (state.clothKind === "bottom" && !app.wearDress && app.bottom === id) ||
      (state.clothKind === "color" && app.clothColor.toLowerCase() === String(id).toLowerCase());
    root.appendChild(
      slotButton(selected, (canvas) => {
        if (state.clothKind === "color") {
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = id;
          ctx.fillRect(4, 4, 28, 28);
        } else LoveseatArt.drawClothIcon(canvas, state.clothKind, id, app.clothColor);
      }, () => {
        if (state.clothKind === "dress") {
          app.wearDress = true;
          app.dress = id;
        } else if (state.clothKind === "top") {
          app.wearDress = false;
          app.top = id;
        } else if (state.clothKind === "bottom") {
          app.wearDress = false;
          app.bottom = id;
        } else app.clothColor = id;
        syncCustomize();
      })
    );
  });
}

function syncCustomize() {
  document.querySelectorAll("#sex-row [data-sex]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.sex === state.character.appearance.sex);
  });
  fillFeatureSlots();
  fillClothSlots();
  renderPreview();
}

function renderSeats() {
  const root = $("seats");
  root.innerHTML = "";
  for (let i = 0; i < 6; i += 1) {
    const userId = state.snapshot.seats[i];
    const user = userId ? state.snapshot.users[userId] : null;
    const seat = document.createElement("button");
    seat.type = "button";
    seat.className = `seat ${user ? "" : "empty"} ${userId === state.meId ? "mine" : ""} ${
      userId && userId === state.selectedId ? "selected" : ""
    }`;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 80;
    if (user) {
      LoveseatArt.drawCharacter(canvas, user.appearance, { pose: "sit", frame: state.animFrame, scale: 4 });
    }
    const stool = document.createElement("div");
    stool.className = "stool";
    const name = document.createElement("div");
    name.className = "seat-name";
    name.textContent = user ? user.name : "empty";
    seat.append(canvas, stool, name);
    seat.addEventListener("click", () => {
      if (!user || user.id === state.meId) return;
      openInteract(user);
    });
    root.appendChild(seat);
  }
}

function spawnFx(type, fromId) {
  const seats = [...document.querySelectorAll(".seat")];
  const index = state.snapshot.seats.indexOf(fromId);
  const node = seats[index];
  if (!node) return;
  const rect = node.getBoundingClientRect();
  const stage = $("stage").getBoundingClientRect();
  if (type === "love") {
    const heart = document.createElement("div");
    heart.className = "heart-fx";
    heart.textContent = "♥";
    heart.style.left = `${rect.left - stage.left + 28}px`;
    heart.style.top = `${rect.top - stage.top + 8}px`;
    $("fx").appendChild(heart);
    setTimeout(() => heart.remove(), 1400);
  }
}

function showBubble(bubble) {
  if (seenBubbles.has(bubble.id)) return;
  seenBubbles.add(bubble.id);
  const seats = [...document.querySelectorAll(".seat")];
  const index = state.snapshot.seats.indexOf(bubble.from);
  const node = seats[index];
  if (!node) return;
  const rect = node.getBoundingClientRect();
  const stage = $("stage").getBoundingClientRect();
  const el = document.createElement("div");
  el.className = `bubble ${bubble.type === "love" ? "love" : ""}`;
  el.textContent = bubble.text;
  el.style.left = `${Math.min(rect.left - stage.left, 380)}px`;
  el.style.top = `${Math.max(8, rect.top - stage.top - 8)}px`;
  $("fx").appendChild(el);
  if (bubble.type === "love") spawnFx("love", bubble.from);
  setTimeout(() => el.remove(), 2800);
}

function relationshipWith(targetId) {
  const key = pairKey(state.meId, targetId);
  return state.snapshot.relationships[key] || { score: 0, level: "Stranger" };
}

function openInteract(user) {
  state.selectedId = user.id;
  renderSeats();
  $("interact-title").textContent = user.name;
  const rel = relationshipWith(user.id);
  $("rel-line").textContent = `${rel.level} · ${rel.score} hearts`;
  updateCooldownUi();
  showModal("modal-interact", true);
}

function updateCooldownUi() {
  const wait = remainingMs();
  const locked = wait > 0;
  $("send-love").disabled = locked;
  $("send-note").disabled = locked;
  $("cooldown").textContent = locked
    ? `Next interaction in ${formatWait(wait)}`
    : "You can send love or a short note.";
}

function applySnapshot(snapshot) {
  state.snapshot = snapshot;
  state.cooldownMs = snapshot.cooldownMs || state.cooldownMs;
  $("you-chip").textContent = state.character.name || "you";
  const count = Object.keys(snapshot.users || {}).length;
  if (state.inRoom) setStatus(`${state.room} · ${count} sitting`);
  renderSeats();
  (snapshot.bubbles || []).forEach(showBubble);
}

async function defaultServerUrl() {
  const net = window.widget && (await window.widget.network());
  if (net?.remote) return net.remote;
  if (isWeb) return location.origin;
  if (net?.local) return net.local;
  return "http://127.0.0.1:3847";
}

function socketOptions(url) {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    host = "";
  }
  const vercel = /\.vercel\.app$/i.test(host);
  return {
    transports: vercel ? ["websocket"] : ["websocket", "polling"],
    path: vercel ? "/api/socket-io/socket.io" : "/socket.io",
    reconnection: true,
    reconnectionAttempts: 12,
    timeout: 10000,
  };
}

async function refreshNetworkHint() {
  const net = window.widget && (await window.widget.network());
  const lan = net?.lan?.[0];
  const local = net?.local || (isWeb ? location.origin : "http://127.0.0.1:3847");
  const remote = net?.remote;
  if (isWeb) $("lan-hint").textContent = `This site ${location.origin}. Friends open this page, same room code.`;
  else if (remote) $("lan-hint").textContent = `Public ${remote} · this PC ${local}${lan ? ` · LAN ${lan}` : ""}`;
  else if (lan) $("lan-hint").textContent = `This PC ${local} · LAN ${lan}`;
  else $("lan-hint").textContent = `This PC ${local}. Deploy with npm run server for internet play.`;
  return net;
}

function ensureNamed() {
  const name = $("char-name").value.trim().slice(0, 16);
  if (!name) {
    $("char-name").focus();
    setStatus("Name your chibi first.");
    return false;
  }
  state.character.name = name;
  state.character.appearance = LoveseatArt.appearanceOf(state.character.appearance);
  saveLocal();
  return true;
}

async function inviteText() {
  const url = normalizeServerUrl($("server-url").value || state.serverUrl) || (await defaultServerUrl());
  const room = ($("room-code").value || state.room).trim().toLowerCase() || DEFAULT_ROOM;
  return `${url}/?room=${encodeURIComponent(room)}`;
}

async function copyInvite() {
  const text = await inviteText();
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Join link copied.");
  } catch {
    setStatus(text);
  }
}

async function connectAndJoin() {
  const fallback = await defaultServerUrl();
  const url = normalizeServerUrl(state.serverUrl) || fallback;
  state.serverUrl = url;
  saveLocal();
  if (socket) socket.disconnect();
  setStatus(`connecting ${url.replace(/^https?:\/\//, "")}…`);
  socket = io(url, socketOptions(url));

  socket.on("connect", () => {
    socket.emit(
      "room:join",
      { room: state.room, character: state.character, playerId: playerId() },
      (res) => {
        if (!res?.ok) {
          setStatus(res?.error || "Could not sit down.");
          return;
        }
        state.meId = res.id;
        state.cooldownMs = res.cooldownMs || state.cooldownMs;
        state.inRoom = true;
        showDashboard(false);
        setStatus(`${res.room} @ ${url.replace(/^https?:\/\//, "")}`);
      }
    );
  });

  socket.on("room:state", applySnapshot);
  socket.on("disconnect", (reason) => {
    if (reason === "io client disconnect") return;
    setStatus("Lost the hearth. Reconnecting…");
  });
  socket.on("connect_error", (err) => {
    setStatus(err?.message ? `Cannot reach server: ${err.message}` : "Cannot reach that server URL.");
  });
}

function interact(type) {
  if (!socket || remainingMs() > 0) return;
  const text = $("note").value.trim();
  socket.emit("interact", { type, targetId: state.selectedId, text }, (res) => {
    if (!res?.ok) {
      if (res?.waitMs) {
        state.lastInteractAt = Date.now() - (state.cooldownMs - res.waitMs);
        saveLocal();
        updateCooldownUi();
      }
      setStatus(res?.error || "Could not send.");
      return;
    }
    state.lastInteractAt = Date.now();
    saveLocal();
    $("note").value = "";
    if (res.relationship) {
      $("rel-line").textContent = `${res.relationship.level} · ${res.relationship.score} hearts`;
    }
    updateCooldownUi();
    showModal("modal-interact", false);
  });
}

function bindUi() {
  $("char-name").value = state.character.name;
  $("room-code").value = state.room;
  syncCustomize();
  refreshNetworkHint().then(async () => {
    if (!state.serverUrl) state.serverUrl = await defaultServerUrl();
    $("server-url").value = state.serverUrl;
  });

  $("prev-opt").addEventListener("click", () => cycleFeature(-1));
  $("next-opt").addEventListener("click", () => cycleFeature(1));
  $("cloth-cat").addEventListener("click", () => {
    const kinds = state.character.appearance.sex === "female" ? CLOTH_KINDS : ["top", "bottom", "color"];
    const i = Math.max(0, kinds.indexOf(state.clothKind));
    state.clothKind = kinds[(i + 1) % kinds.length];
    fillClothSlots();
  });
  document.querySelectorAll("#sex-row [data-sex]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = state.character.name;
      state.character.appearance = LoveseatStyles.defaultAppearance(btn.dataset.sex);
      state.character.name = name;
      state.clothKind = btn.dataset.sex === "female" ? "dress" : "top";
      syncCustomize();
    });
  });

  $("create-room").addEventListener("click", async () => {
    if (!ensureNamed()) return;
    state.room = randomRoomCode();
    $("room-code").value = state.room;
    state.serverUrl = normalizeServerUrl($("server-url").value) || (await defaultServerUrl());
    saveLocal();
    await copyInvite();
    await connectAndJoin();
  });
  $("open-join").addEventListener("click", async () => {
    if (!ensureNamed()) return;
    $("room-code").value = state.room;
    $("server-url").value = state.serverUrl || (await defaultServerUrl());
    await refreshNetworkHint();
    showModal("modal-room", true);
  });
  $("join-room").addEventListener("click", async () => {
    if (!ensureNamed()) return;
    state.room = $("room-code").value.trim().toLowerCase() || DEFAULT_ROOM;
    state.serverUrl = normalizeServerUrl($("server-url").value);
    saveLocal();
    showModal("modal-room", false);
    await connectAndJoin();
  });
  $("use-local").addEventListener("click", async () => {
    const net = await refreshNetworkHint();
    $("server-url").value = net?.local || "http://127.0.0.1:3847";
  });
  $("use-lan").addEventListener("click", async () => {
    const net = await refreshNetworkHint();
    $("server-url").value = net?.lan?.[0] || net?.local || "http://127.0.0.1:3847";
  });
  $("use-this-site").addEventListener("click", () => {
    $("server-url").value = location.origin;
  });
  $("copy-invite").addEventListener("click", copyInvite);

  $("btn-create").addEventListener("click", () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    state.inRoom = false;
    state.meId = null;
    showDashboard(true);
    setStatus("Dashboard · customize, then create or join.");
  });
  $("btn-room").addEventListener("click", async () => {
    $("room-code").value = state.room;
    $("server-url").value = state.serverUrl || (await defaultServerUrl());
    await refreshNetworkHint();
    showModal("modal-room", true);
  });
  $("btn-top").addEventListener("click", async () => {
    state.alwaysOnTop = !state.alwaysOnTop;
    if (window.widget) await window.widget.setAlwaysOnTop(state.alwaysOnTop);
    $("btn-top").classList.toggle("on", state.alwaysOnTop);
    saveLocal();
  });
  function quitOrClose(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    if (window.widget?.close) window.widget.close();
    else window.close();
  }
  $("btn-min").addEventListener("mousedown", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    window.widget?.minimize();
  });
  $("btn-close").addEventListener("mousedown", quitOrClose);
  $("btn-close").addEventListener("click", quitOrClose);
  $("send-love").addEventListener("click", () => interact("love"));
  $("send-note").addEventListener("click", () => interact("message"));
  $("cancel-interact").addEventListener("click", () => {
    state.selectedId = null;
    showModal("modal-interact", false);
    renderSeats();
  });

  $("btn-top").classList.toggle("on", state.alwaysOnTop);
  if (window.widget) window.widget.setAlwaysOnTop(state.alwaysOnTop);

  setInterval(() => {
    state.animFrame = (state.animFrame + 1) % 8;
    if (!$("dashboard").classList.contains("hidden")) renderPreview();
    if (state.inRoom && !$("stage").classList.contains("hidden")) {
      document.querySelectorAll(".seat canvas").forEach((canvas, i) => {
        const userId = state.snapshot.seats[i];
        const user = userId ? state.snapshot.users[userId] : null;
        if (user) LoveseatArt.drawCharacter(canvas, user.appearance, { pose: "sit", frame: state.animFrame, scale: 4 });
      });
    }
    if (!$("modal-interact").classList.contains("hidden")) updateCooldownUi();
  }, 180);
}

async function boot() {
  if (isWeb) document.documentElement.classList.add("is-web");
  loadLocal();
  bindUi();
  const q = new URLSearchParams(location.search);
  if (state.character.name && q.get("room")) {
    await connectAndJoin();
    return;
  }
  showDashboard(true);
  setStatus("Dashboard · create a room or join with a link.");
}

boot();

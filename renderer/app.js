const STORAGE_KEY = "little-loveseat-v1";
const DEFAULT_ROOM = "hearth";

const state = {
  character: {
    name: "",
    appearance: {
      skin: LoveseatArt.SKINS[0],
      hair: "bob",
      hairColor: LoveseatArt.HAIR_COLORS[0],
      shirt: LoveseatArt.SHIRTS[0],
      accent: LoveseatArt.ACCENTS[0],
    },
  },
  room: DEFAULT_ROOM,
  alwaysOnTop: true,
  lastInteractAt: 0,
  cooldownMs: 5 * 60 * 1000,
  meId: null,
  selectedId: null,
  snapshot: { seats: Array(6).fill(null), users: {}, relationships: {}, bubbles: [] },
};

let socket = null;
let seenBubbles = new Set();

function loadLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.character) state.character = { ...state.character, ...saved.character };
    if (saved?.room) state.room = saved.room;
    if (typeof saved?.alwaysOnTop === "boolean") state.alwaysOnTop = saved.alwaysOnTop;
    if (saved?.lastInteractAt) state.lastInteractAt = saved.lastInteractAt;
  } catch {
    /* ignore */
  }
}

function saveLocal() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      character: state.character,
      room: state.room,
      alwaysOnTop: state.alwaysOnTop,
      lastInteractAt: state.lastInteractAt,
    })
  );
}

function $(id) {
  return document.getElementById(id);
}

function fillSelect(el, values, labels = values) {
  el.innerHTML = values
    .map((value, i) => `<option value="${value}">${labels[i]}</option>`)
    .join("");
}

function colorLabel(hex) {
  return hex.replace("#", "");
}

function pairKey(a, b) {
  return [a, b].sort().join(":");
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

function renderPreview() {
  LoveseatArt.drawCharacter($("preview"), state.character.appearance, true);
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
    if (user) LoveseatArt.drawCharacter(canvas, user.appearance, true);
    else {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 64, 80);
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
  setStatus(`${state.room} · ${count} sitting`);
  renderSeats();
  (snapshot.bubbles || []).forEach(showBubble);
}

async function connectAndJoin() {
  const port = (window.widget && (await window.widget.serverPort())) || 3847;
  if (socket) socket.disconnect();
  socket = io(`http://127.0.0.1:${port}`, { transports: ["websocket"] });

  socket.on("connect", () => {
    socket.emit(
      "room:join",
      { room: state.room, character: state.character },
      (res) => {
        if (!res?.ok) {
          setStatus(res?.error || "Could not sit down.");
          return;
        }
        state.meId = res.id;
        state.cooldownMs = res.cooldownMs || state.cooldownMs;
        setStatus(`seated in ${res.room}`);
      }
    );
  });

  socket.on("room:state", applySnapshot);
  socket.on("connect_error", () => setStatus("No hearth yet. Is the app open?"));
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
  fillSelect($("skin"), LoveseatArt.SKINS, LoveseatArt.SKINS.map(colorLabel));
  fillSelect($("hair"), LoveseatArt.HAIR_STYLES);
  fillSelect($("hair-color"), LoveseatArt.HAIR_COLORS, LoveseatArt.HAIR_COLORS.map(colorLabel));
  fillSelect($("shirt"), LoveseatArt.SHIRTS, LoveseatArt.SHIRTS.map(colorLabel));
  fillSelect($("accent"), LoveseatArt.ACCENTS, LoveseatArt.ACCENTS.map(colorLabel));

  $("char-name").value = state.character.name;
  $("skin").value = state.character.appearance.skin;
  $("hair").value = state.character.appearance.hair;
  $("hair-color").value = state.character.appearance.hairColor;
  $("shirt").value = state.character.appearance.shirt;
  $("accent").value = state.character.appearance.accent;
  $("room-code").value = state.room;
  renderPreview();

  ["skin", "hair", "hair-color", "shirt", "accent"].forEach((id) => {
    $(id).addEventListener("change", () => {
      state.character.appearance = {
        skin: $("skin").value,
        hair: $("hair").value,
        hairColor: $("hair-color").value,
        shirt: $("shirt").value,
        accent: $("accent").value,
      };
      renderPreview();
    });
  });

  $("save-char").addEventListener("click", async () => {
    const name = $("char-name").value.trim().slice(0, 16);
    if (!name) {
      $("char-name").focus();
      return;
    }
    state.character.name = name;
    saveLocal();
    showModal("modal-create", false);
    await connectAndJoin();
  });

  $("join-room").addEventListener("click", async () => {
    state.room = $("room-code").value.trim().toLowerCase() || DEFAULT_ROOM;
    saveLocal();
    showModal("modal-room", false);
    await connectAndJoin();
  });

  $("btn-create").addEventListener("click", () => showModal("modal-create", true));
  $("btn-room").addEventListener("click", () => {
    $("room-code").value = state.room;
    showModal("modal-room", true);
  });
  $("btn-top").addEventListener("click", async () => {
    state.alwaysOnTop = !state.alwaysOnTop;
    if (window.widget) await window.widget.setAlwaysOnTop(state.alwaysOnTop);
    $("btn-top").classList.toggle("on", state.alwaysOnTop);
    saveLocal();
  });
  $("btn-min").addEventListener("click", () => window.widget?.minimize());
  $("btn-close").addEventListener("click", () => window.widget?.close());
  $("send-love").addEventListener("click", () => interact("love"));
  $("send-note").addEventListener("click", () => interact("message"));
  $("cancel-interact").addEventListener("click", () => {
    state.selectedId = null;
    showModal("modal-interact", false);
    renderSeats();
  });

  $("btn-top").classList.toggle("on", state.alwaysOnTop);
  if (window.widget) window.widget.setAlwaysOnTop(state.alwaysOnTop);

  setInterval(updateCooldownUi, 1000);
}

async function boot() {
  loadLocal();
  bindUi();
  if (!state.character.name) {
    showModal("modal-create", true);
    setStatus("Create your pixel self.");
    return;
  }
  await connectAndJoin();
}

boot();

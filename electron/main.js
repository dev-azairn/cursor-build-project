const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const { startServer, DEFAULT_PORT } = require("../server");
const { localUrls } = require("./network");

let win = null;
let hosted = { port: DEFAULT_PORT, local: `http://127.0.0.1:${DEFAULT_PORT}`, lan: [] };

function createWindow() {
  const { workArea } = screen.getPrimaryDisplay();
  const width = 640;
  const height = 540;
  const x = workArea.x + workArea.width - width - 24;
  const y = workArea.y + workArea.height - height - 24;

  win = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    hasShadow: false,
    roundedCorners: false,
    thickFrame: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: false,
    alwaysOnTop: true,
    title: "Little Loveseat",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
  win.once("ready-to-show", () => win.show());
  win.on("closed", () => {
    win = null;
  });
}

ipcMain.handle("widget:set-always-on-top", (_event, enabled) => {
  if (!win) return false;
  win.setAlwaysOnTop(Boolean(enabled), "screen-saver");
  return win.isAlwaysOnTop();
});

ipcMain.handle("widget:is-always-on-top", () => Boolean(win && win.isAlwaysOnTop()));

ipcMain.handle("widget:close", () => {
  if (win) win.close();
});

ipcMain.handle("widget:minimize", () => {
  if (win) win.minimize();
});

ipcMain.handle("server:network", () => hosted);

app.whenReady().then(async () => {
  const skipLocal = Boolean(process.env.LOVESEAT_SERVER_URL || process.env.LOVESEAT_SKIP_LOCAL);
  if (!skipLocal) {
    const started = await startServer();
    hosted = localUrls(started.port || DEFAULT_PORT);
    hosted.remote = process.env.LOVESEAT_PUBLIC_URL || process.env.LOVESEAT_SERVER_URL || "";
    if (hosted.lan[0]) console.log(`LAN invite: ${hosted.lan[0]}`);
    if (hosted.remote) console.log(`Public hearth: ${hosted.remote}`);
  } else {
    hosted = {
      port: DEFAULT_PORT,
      local: process.env.LOVESEAT_SERVER_URL,
      lan: [],
      remote: process.env.LOVESEAT_PUBLIC_URL || process.env.LOVESEAT_SERVER_URL,
    };
  }
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

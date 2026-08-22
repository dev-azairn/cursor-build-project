const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const { startServer, DEFAULT_PORT } = require("../server");

let win = null;

function createWindow() {
  const { workArea } = screen.getPrimaryDisplay();
  const width = 560;
  const height = 420;
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

ipcMain.handle("server:port", () => DEFAULT_PORT);

app.whenReady().then(async () => {
  await startServer();
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

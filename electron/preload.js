const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("widget", {
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke("widget:set-always-on-top", enabled),
  isAlwaysOnTop: () => ipcRenderer.invoke("widget:is-always-on-top"),
  close: () => ipcRenderer.invoke("widget:close"),
  minimize: () => ipcRenderer.invoke("widget:minimize"),
  serverPort: () => ipcRenderer.invoke("server:port"),
});

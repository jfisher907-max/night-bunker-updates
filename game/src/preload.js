// Bridge between the game page and the desktop shell. The page sees only window.nbDesktop.
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

const listeners = new Set();
ipcRenderer.on('desktop:state', (e, s) => listeners.forEach(fn => { try { fn(s); } catch (err) {} }));

contextBridge.exposeInMainWorld('nbDesktop', {
  platform: process.platform,
  // Saves are synchronous so the game's existing save code keeps its shape.
  loadSave: key => ipcRenderer.sendSync('save:load', key),
  hasSave: key => ipcRenderer.sendSync('save:has', key),
  writeSave: (key, text) => ipcRenderer.sendSync('save:write', key, String(text)),
  // the game's Blender assets (glTF JSON); the page can't fetch() from file:// so the shell reads them
  readAsset: rel => ipcRenderer.invoke('asset:read', String(rel)),
  getState: () => ipcRenderer.sendSync('desktop:state'),
  setSettings: patch => ipcRenderer.invoke('desktop:set', patch),
  onState: fn => { listeners.add(fn); return () => listeners.delete(fn); },
  toggleFullscreen: () => ipcRenderer.send('desktop:fullscreen'),
  restart: () => ipcRenderer.send('desktop:restart'),
  quit: () => ipcRenderer.send('desktop:quit'),
  // updater: status {state: idle|off|checking|none|downloading|ready|installer|applying|error, version, from, progress, message, updated}
  updateStatus: () => ipcRenderer.sendSync('update:status'),
  checkUpdate: () => ipcRenderer.invoke('update:check'),
  applyUpdate: () => ipcRenderer.send('update:apply'),
  onUpdate: fn => { const h = (e, s) => { try { fn(s); } catch (err) {} }; ipcRenderer.on('update:status', h); return () => ipcRenderer.removeListener('update:status', h); },
});

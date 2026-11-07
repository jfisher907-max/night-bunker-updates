// Night Bunker desktop shell. The game itself is the web build (app/game/index.html, produced by
// scripts/prepare-game.js); this file only owns the window, display settings and the save file.
'use strict';
const { app, BrowserWindow, ipcMain, screen, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const updater = require('./updater');

const WINDOW_SIZES = [[1280, 720], [1600, 900], [1920, 1080], [2560, 1440]];
const DEFAULTS = { displayMode: 'fullscreen', width: 1600, height: 900, vsync: true, showFps: false };
// NB_USER_DATA lets the test script run against a throwaway profile.
if (process.env.NB_USER_DATA) app.setPath('userData', process.env.NB_USER_DATA);
const userDir = app.getPath('userData');
const settingsFile = path.join(userDir, 'settings.json');
const saveDir = path.join(userDir, 'saves');

// ---------- small JSON file helpers (atomic write, keep one backup) ----------
function readJson(file) {
  for (const f of [file, file + '.bak']) {
    try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) {}
  }
  return null;
}
function writeAtomic(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, text);
  try { if (fs.existsSync(file)) fs.copyFileSync(file, file + '.bak'); } catch (e) {}
  fs.renameSync(tmp, file);
}

// ---------- settings ----------
function sanitize(s) {
  const out = { ...DEFAULTS };
  if (['windowed', 'borderless', 'fullscreen'].includes(s.displayMode)) out.displayMode = s.displayMode;
  const w = Math.round(+s.width), h = Math.round(+s.height);
  if (w >= 640 && w <= 7680 && h >= 360 && h <= 4320) { out.width = w; out.height = h; }
  if (typeof s.vsync === 'boolean') out.vsync = s.vsync;
  if (typeof s.showFps === 'boolean') out.showFps = s.showFps;
  return out;
}
let settings = sanitize(readJson(settingsFile) || {});
// What the running process was started with; frame and vsync can only change on restart.
const boot = { displayMode: settings.displayMode, vsync: settings.vsync };
const saveSettings = () => { try { writeAtomic(settingsFile, JSON.stringify(settings, null, 2)); } catch (e) { console.error('settings write failed', e); } };

if (!settings.vsync) {
  app.commandLine.appendSwitch('disable-frame-rate-limit');
  app.commandLine.appendSwitch('disable-gpu-vsync');
}
// Gaming laptops: run on the discrete GPU, not the built-in chip (Windows otherwise often picks the power-saving one).
app.commandLine.appendSwitch('force_high_performance_gpu');
// Web Audio starts without needing a click first, like a native game.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

if (!app.requestSingleInstanceLock()) { app.quit(); }

let win = null;

function fitToDisplay(w, h) {
  const area = screen.getPrimaryDisplay().workAreaSize;
  return [Math.min(w, area.width), Math.min(h, area.height)];
}

function createWindow() {
  const borderless = boot.displayMode === 'borderless';
  const [w, h] = fitToDisplay(settings.width, settings.height);
  win = new BrowserWindow({
    title: 'Night Bunker',
    width: w, height: h, useContentSize: true, minWidth: 960, minHeight: 540,
    frame: !borderless,
    fullscreen: boot.displayMode === 'fullscreen',
    backgroundColor: '#06070a',
    show: false,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      backgroundThrottling: false, spellcheck: false,
    },
  });
  if (borderless) win.setBounds(screen.getPrimaryDisplay().bounds);
  win.removeMenu();
  win.once('ready-to-show', () => win.show());

  // Keyboard shortcuts that belong to the shell, not the game.
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) { e.preventDefault(); toggleFullscreen(); }
    if (input.alt && input.key === 'F4') { e.preventDefault(); app.quit(); }
    if (!app.isPackaged && input.key === 'F12') win.webContents.toggleDevTools();
  });
  // The game is local; never navigate away from it or open other windows inside the app.
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); shell.openExternal(url); } });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });

  win.on('enter-full-screen', () => pushState());
  win.on('leave-full-screen', () => pushState());
  win.on('resize', () => {
    if (win.isFullScreen() || boot.displayMode === 'borderless' || win.isMaximized()) return;
    const [cw, ch] = win.getContentSize();
    settings.width = cw; settings.height = ch;
  });
  win.on('close', saveSettings);

  win.loadFile(path.join(__dirname, '..', 'app', 'game', 'index.html'));
}

function currentMode() {
  if (boot.displayMode === 'borderless') return 'borderless';
  return win && win.isFullScreen() ? 'fullscreen' : 'windowed';
}
function state() {
  return {
    settings, mode: currentMode(), sizes: WINDOW_SIZES,
    restartNeeded: settings.vsync !== boot.vsync || (settings.displayMode === 'borderless') !== (boot.displayMode === 'borderless'),
    version: app.getVersion(),
  };
}
function pushState() { if (win && !win.isDestroyed()) win.webContents.send('desktop:state', state()); }

function toggleFullscreen() {
  if (!win || boot.displayMode === 'borderless') return;
  const full = !win.isFullScreen();
  win.setFullScreen(full);
  settings.displayMode = full ? 'fullscreen' : 'windowed';
  saveSettings();
}

// ---------- IPC ----------
const saveFile = key => path.join(saveDir, String(key).replace(/[^a-z0-9_-]/gi, '_') + '.json');

ipcMain.on('save:load', (e, key) => {
  try { const f = saveFile(key); e.returnValue = fs.existsSync(f) || fs.existsSync(f + '.bak') ? JSON.stringify(readJson(f)) : null; }
  catch (err) { e.returnValue = null; }
});
ipcMain.on('save:has', (e, key) => { e.returnValue = fs.existsSync(saveFile(key)); });
ipcMain.on('save:write', (e, key, text) => {
  try { JSON.parse(text); writeAtomic(saveFile(key), text); e.returnValue = true; }
  catch (err) { console.error('save write failed', err); e.returnValue = false; }
});
ipcMain.on('desktop:state', e => { e.returnValue = state(); });
ipcMain.handle('asset:read', (e, rel) => {
  const base = path.join(__dirname, '..', 'app', 'game', 'assets'), f = path.resolve(base, '..', rel);
  if (!f.startsWith(base + path.sep)) throw new Error('asset outside the game folder: ' + rel);
  return fs.readFileSync(f, 'utf8');
});
ipcMain.handle('desktop:set', (e, patch) => {
  const next = sanitize({ ...settings, ...patch });
  const modeChanged = next.displayMode !== settings.displayMode;
  settings = next;
  if (modeChanged && boot.displayMode !== 'borderless' && next.displayMode !== 'borderless') {
    win.setFullScreen(next.displayMode === 'fullscreen');
  }
  if (('width' in patch || 'height' in patch) && currentMode() === 'windowed') {
    if (win.isMaximized()) win.unmaximize();
    const [w, h] = fitToDisplay(next.width, next.height);
    win.setContentSize(w, h); win.center();
  }
  saveSettings(); pushState();
  return state();
});
ipcMain.on('desktop:fullscreen', toggleFullscreen);
ipcMain.on('desktop:restart', () => { saveSettings(); app.relaunch(); app.exit(0); });
ipcMain.on('desktop:quit', () => app.quit());
// Updates (src/updater.js): the page asks for the status, can re-check, and applies one with a click.
ipcMain.on('update:status', e => { e.returnValue = updater.getStatus(); });
ipcMain.handle('update:check', () => updater.check());
ipcMain.on('update:apply', () => {
  if (!updater.apply()) return;
  saveSettings();
  // give the page a moment to write its run autosave, then close so the swap can happen
  setTimeout(() => app.quit(), 1500);   // long enough to read the "Installing update" card
});

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => {
  Menu.setApplicationMenu(null); createWindow();
  let pkg = {}; try { pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')); } catch (e) {}
  updater.init({ pkg, send: s => { if (win && !win.isDestroyed()) win.webContents.send('update:status', s); } });
});
app.on('window-all-closed', () => app.quit());

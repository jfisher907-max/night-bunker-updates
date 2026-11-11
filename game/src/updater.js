// Night Bunker desktop updater (shell 2). Finds a newer build, stages its app.asar, and on "Update now" hands off to a
// small PowerShell script that waits for the game to close, swaps resources\app.asar and starts the game again.
// Sources, checked on launch and every 20 minutes:
//   1. Downloads: any Night-Bunker-Windows*.zip (or an unzipped copy of one) in the user's Downloads folder.
//   2. Online feed: package.json "nbUpdateFeed" (latest.json on the 'updates' branch of jfisher907-max/night-bunker-updates,
//      written by scripts/publish-update.sh). A failed download is retried on the next check, quietly.
// feed.json (current): file-by-file, see checkDelta. latest.json (shell 2 on 6.69.0, kept for old installs):
// { "version": "6.70.0", "url": "<zip url>", "sha256": "<hex of the zip>", "size": <bytes>, "notes": "..." }
// The update never applies by itself and is never offered mid-run: the menu shows it, the player clicks.
'use strict';
const { app, net } = require('electron');
const path = require('path');
// original-fs: Electron's patched fs treats *.asar paths as folders, and this module reads and writes archives as files.
const fs = (() => { try { return require('original-fs'); } catch (e) { return require('fs'); } })();
const zlib = require('zlib');
const crypto = require('crypto');
const { spawn } = require('child_process');

const INNER = 'Night Bunker/app.asar';                 // path of the game inside the release zip
const ZIP_RE = /^Night[-_ ]Bunker[-_ ]Windows.*\.zip$/i;
const CHECK_MS = 20 * 60 * 1000;

let dir, log, pkg, send = () => {};
let status = { state: 'idle', current: '0', version: null, from: null, progress: 0, message: '', updated: null };

function vnum(v) { return String(v || '0').split(/[.+-]/).slice(0, 4).map(n => parseInt(n, 10) || 0); }
function newer(a, b) { const x = vnum(a), y = vnum(b); for (let i = 0; i < 4; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; }
function set(patch) { status = { ...status, ...patch }; try { send(status); } catch (e) {} }
function note(msg) { try { fs.appendFileSync(log, new Date().toISOString() + ' ' + msg + '\n'); } catch (e) {} }

// ---------- reading archives ----------
// The asar header names the files; we only need package.json (version, electron runtime) and a sanity check.
function asarInfo(buf) {
  if (buf.length < 16) throw new Error('not an asar');
  const len = buf.readUInt32LE(12), base = 8 + buf.readUInt32LE(4);
  const h = JSON.parse(buf.slice(16, 16 + len).toString('utf8'));
  const ent = p => p.split('/').reduce((n, k) => (n && n.files ? n.files[k] : null), h);
  const pj = ent('package.json');
  if (!pj || !ent('src/main.js') || !ent('app/game/index.html')) throw new Error('asar is missing game files');
  const end = base + Number(pj.offset) + pj.size;
  if (end > buf.length) throw new Error('asar is cut short');
  let last = 0;
  (function walk(n) { for (const e of Object.values(n.files || {})) { if (e.files) walk(e); else if (!e.unpacked && !e.link) last = Math.max(last, base + Number(e.offset) + e.size); } })(h);
  if (last > buf.length) throw new Error('asar is cut short');
  return JSON.parse(buf.slice(base + Number(pj.offset), end).toString('utf8'));
}

// Minimal zip reader: finds one entry through the central directory and inflates it.
function zipEntry(file, name) {
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size, tail = Math.min(size, 65557), tb = Buffer.alloc(tail);
    fs.readSync(fd, tb, 0, tail, size - tail);
    let eocd = -1; for (let i = tail - 22; i >= 0; i--) if (tb.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('not a zip');
    const cdSize = tb.readUInt32LE(eocd + 12), cdOff = tb.readUInt32LE(eocd + 16), cd = Buffer.alloc(cdSize);
    fs.readSync(fd, cd, 0, cdSize, cdOff);
    for (let p = 0; p + 46 <= cd.length && cd.readUInt32LE(p) === 0x02014b50;) {
      const method = cd.readUInt16LE(p + 10), csize = cd.readUInt32LE(p + 20), usize = cd.readUInt32LE(p + 24);
      const nl = cd.readUInt16LE(p + 28), xl = cd.readUInt16LE(p + 30), cl = cd.readUInt16LE(p + 32), lho = cd.readUInt32LE(p + 42);
      const n = cd.slice(p + 46, p + 46 + nl).toString('utf8').replace(/\\/g, '/');
      p += 46 + nl + xl + cl;
      if (n !== name && !n.endsWith('/' + name)) continue;
      const lh = Buffer.alloc(30); fs.readSync(fd, lh, 0, 30, lho);
      const data = Buffer.alloc(csize); fs.readSync(fd, data, 0, csize, lho + 30 + lh.readUInt16LE(26) + lh.readUInt16LE(28));
      const out = method === 0 ? data : method === 8 ? zlib.inflateRawSync(data) : null;
      if (!out) throw new Error('unsupported zip compression');
      if (out.length !== usize) throw new Error('zip entry is damaged');
      return out;
    }
    throw new Error('zip has no ' + name);
  } finally { fs.closeSync(fd); }
}

// ---------- sources ----------
function downloadsCandidates() {
  let root; try { root = process.env.NB_DOWNLOADS || app.getPath('downloads'); } catch (e) { return []; }
  const out = [];
  let names = []; try { names = fs.readdirSync(root); } catch (e) { return []; }
  for (const n of names) {
    const f = path.join(root, n);
    if (ZIP_RE.test(n)) { out.push({ kind: 'zip', file: f }); continue; }
    if (/^Night[-_ ]Bunker/i.test(n)) {   // an unzipped copy: <folder>\Night Bunker\app.asar or <folder>\app.asar
      for (const a of [path.join(f, 'Night Bunker', 'app.asar'), path.join(f, 'app.asar')]) if (fs.existsSync(a)) out.push({ kind: 'asar', file: a });
    }
  }
  return out;
}

// Reading a 40 MB zip on every launch is wasteful; remember what each file held by size + mtime.
function seenCache() { try { return JSON.parse(fs.readFileSync(path.join(dir, 'seen.json'), 'utf8')); } catch (e) { return {}; } }
function versionOf(c, cache) {
  const st = fs.statSync(c.file), key = c.file + '|' + st.size + '|' + Math.floor(st.mtimeMs);
  if (cache[key]) return cache[key];
  const buf = c.kind === 'zip' ? zipEntry(c.file, INNER) : fs.readFileSync(c.file);
  const pj = asarInfo(buf);
  return (cache[key] = { version: pj.version, electron: pj.nbElectron || null });
}

function stage(buf, version, from) {
  const pj = asarInfo(buf);
  if (pj.version !== version) throw new Error('version mismatch in the update');
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, 'app.asar.tmp'), dst = path.join(dir, 'app.asar');
  fs.writeFileSync(tmp, buf); fs.renameSync(tmp, dst);
  const runtimeOk = !pj.nbElectron || pj.nbElectron === process.versions.electron;
  fs.writeFileSync(path.join(dir, 'staged.json'), JSON.stringify({ version, from, electron: pj.nbElectron || null, sha256: crypto.createHash('sha256').update(buf).digest('hex') }));
  note('staged ' + version + ' from ' + from + (runtimeOk ? '' : ' (needs runtime ' + pj.nbElectron + ')'));
  set(runtimeOk ? { state: 'ready', version, from, progress: 1, message: '' }
                : { state: 'installer', version, from, message: 'This update needs a new game runtime. Run "Install Night Bunker.cmd" from the new download once.' });
}

function stagedVersion() {
  try { const s = JSON.parse(fs.readFileSync(path.join(dir, 'staged.json'), 'utf8')); if (fs.existsSync(path.join(dir, 'app.asar'))) return s; } catch (e) {}
  return null;
}

async function checkDownloads() {
  const cache = seenCache(); let best = null;
  for (const c of downloadsCandidates()) {
    try { const v = versionOf(c, cache); if (newer(v.version, status.current) && (!best || newer(v.version, best.v.version))) best = { c, v }; }
    catch (e) { note('skip ' + c.file + ': ' + e.message); }
  }
  try { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'seen.json'), JSON.stringify(cache)); } catch (e) {}
  if (!best) return null;
  const s = stagedVersion();
  if (s && s.version === best.v.version) return best.v.version;
  const buf = best.c.kind === 'zip' ? zipEntry(best.c.file, INNER) : fs.readFileSync(best.c.file);
  stage(buf, best.v.version, 'downloads');
  return best.v.version;
}

function fetchBuf(url, onProgress) {
  return new Promise((resolve, reject) => {
    const req = net.request({ url, redirect: 'follow', cache: 'no-cache' });
    req.setHeader('User-Agent', 'NightBunker-Updater');
    req.on('response', res => {
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); res.on('data', () => {}); return; }
      const total = +res.headers['content-length'] || 0, parts = []; let got = 0;
      res.on('data', d => { parts.push(d); got += d.length; if (onProgress && total) onProgress(got / total); });
      res.on('end', () => resolve(Buffer.concat(parts)));
      res.on('error', reject);
    });
    req.on('error', reject);
    setTimeout(() => { try { req.abort(); } catch (e) {} reject(new Error('timed out')); }, 15 * 60 * 1000);
    req.end();
  });
}

async function checkFeed() {
  const feed = process.env.NB_UPDATE_FEED || pkg.nbUpdateFeed;
  if (!feed) return null;
  const info = JSON.parse((await fetchBuf(feed + (feed.includes('?') ? '&' : '?') + 't=' + Date.now())).toString('utf8'));
  set({ latest: info.version || null });
  if (!info.version || !(info.url || info.files) || !newer(info.version, status.current)) return null;
  const s = stagedVersion();
  if (s && s.version === info.version) return info.version;
  if (info.files) return checkDelta(info);
  set({ state: 'downloading', version: info.version, from: 'online', progress: 0, notes: info.notes || '' });
  const zip = await fetchBuf(info.url, p => set({ progress: p }));
  const sha = crypto.createHash('sha256').update(zip).digest('hex');
  if (info.sha256 && sha !== String(info.sha256).toLowerCase()) throw new Error('download did not match its checksum');
  const tmp = path.join(dir, 'download.zip'); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(tmp, zip);
  try { stage(zipEntry(tmp, INNER), info.version, 'online'); } finally { try { fs.unlinkSync(tmp); } catch (e) {} }
  return info.version;
}

// ---------- file-by-file updates (feed.json) ----------
// feed.json: { version, base: "<raw url of a commit>/game/", files: { "<asar path>": [size, sha256] }, notes }
// Only files whose hash differs from the installed app.asar are downloaded (usually index.html and package.json, a few MB);
// the rest is copied from the installed archive, then a new app.asar is written and staged like any other update.
function asarRead(file) {
  const buf = fs.readFileSync(file), len = buf.readUInt32LE(12), base = 8 + buf.readUInt32LE(4);
  const h = JSON.parse(buf.slice(16, 16 + len).toString('utf8')), out = {};
  (function walk(n, pre) { for (const [k, e] of Object.entries(n.files || {})) { const p = pre ? pre + '/' + k : k; if (e.files) walk(e, p); else if (!e.unpacked && !e.link) out[p] = { e, get: () => buf.slice(base + Number(e.offset), base + Number(e.offset) + e.size) }; } })(h, '');
  return out;
}
function asarWrite(files) {   // files: [[path, Buffer]] -> Buffer in Electron's asar layout, with integrity blocks
  const header = { files: {} }, chunks = []; let off = 0;
  const integrity = d => { const BS = 4 * 1024 * 1024, blocks = []; for (let i = 0; i < d.length; i += BS) blocks.push(crypto.createHash('sha256').update(d.slice(i, i + BS)).digest('hex')); if (!blocks.length) blocks.push(crypto.createHash('sha256').update(Buffer.alloc(0)).digest('hex')); return { algorithm: 'SHA256', hash: crypto.createHash('sha256').update(d).digest('hex'), blockSize: BS, blocks }; };
  for (const [p, d] of files) {
    const parts = p.split('/'); let n = header;
    for (let i = 0; i < parts.length - 1; i++) n = n.files[parts[i]] = n.files[parts[i]] || { files: {} };
    n.files[parts[parts.length - 1]] = { size: d.length, offset: String(off), integrity: integrity(d) };
    off += d.length; chunks.push(d);
  }
  const js = Buffer.from(JSON.stringify(header), 'utf8'), pad = (4 - (js.length % 4)) % 4;
  const payload = Buffer.alloc(8 + js.length + pad); payload.writeUInt32LE(4 + js.length + pad, 0); payload.writeUInt32LE(js.length, 4); js.copy(payload, 8);
  const sizeP = Buffer.alloc(8); sizeP.writeUInt32LE(4, 0); sizeP.writeUInt32LE(payload.length, 4);
  return Buffer.concat([sizeP, payload, ...chunks]);
}
const sha256 = d => crypto.createHash('sha256').update(d).digest('hex');
async function checkDelta(info) {
  const cur = asarRead(path.join(process.env.NB_RESOURCES || process.resourcesPath, 'app.asar'));
  const list = Object.entries(info.files), need = [];
  for (const [p, [size, sha]] of list) {
    const c = cur[p];
    if (!c || c.e.size !== size || ((c.e.integrity && c.e.integrity.hash) || sha256(c.get())) !== sha) need.push([p, size, sha]);
  }
  const total = need.reduce((a, n) => a + n[1], 0) || 1; let done = 0;
  set({ state: 'downloading', version: info.version, from: 'online', progress: 0, notes: info.notes || '' });
  note('delta ' + info.version + ': ' + need.length + ' of ' + list.length + ' files, ' + total + ' bytes');
  const got = {};
  for (const [p, size, sha] of need) {
    const d = await fetchBuf(info.base + p.split('/').map(encodeURIComponent).join('/'), f => set({ progress: (done + f * size) / total }));
    if (d.length !== size || sha256(d) !== sha) throw new Error('download did not match its checksum: ' + p);
    got[p] = d; done += size; set({ progress: done / total });
  }
  const files = list.map(([p, [, sha]]) => { const d = got[p] || cur[p].get(); if (!got[p] && sha256(d) !== sha) throw new Error('installed file differs: ' + p); return [p, d]; });
  stage(asarWrite(files), info.version, 'online');
  return info.version;
}

let busy = false;
async function check() {
  if (busy || status.state === 'applying') return status;
  busy = true;
  const prev = status.state;
  if (prev !== 'ready' && prev !== 'installer') set({ state: 'checking', message: '' });
  try {
    let v = null;
    try { v = await checkDownloads(); } catch (e) { note('downloads check failed: ' + e.message); }
    let feedErr = '', latest = null;
    if (!v || status.state !== 'ready') { try { const f = await checkFeed(); if (f) v = f; } catch (e) { feedErr = e.message; note('online check failed: ' + e.message); if (status.state === 'downloading') set({ state: 'none', version: null, progress: 0 }); } }
    if (!v && (status.state === 'checking')) set({ state: 'none' });
    set({ lastCheck: new Date().toISOString(), lastError: feedErr });
  } finally { busy = false; }
  return status;
}

// ---------- applying ----------
// The swap runs in a helper: this same exe started with ELECTRON_RUN_AS_NODE=1, i.e. plain Node, which never opens
// app.asar. It waits for the game to exit, moves the staged archive in (keeping app.asar.prev), writes result.json and
// starts the game again. (6.70.1; 6.69.0-6.70.0 used a hidden PowerShell script, which could fail with no trace.)
const HELPER = `'use strict';
process.noAsar = true;
const fs = (() => { try { return require('original-fs'); } catch (e) { return require('fs'); } })();
const path = require('path'), { spawn } = require('child_process');
const a = JSON.parse(process.argv[2]);
const log = m => { try { fs.appendFileSync(a.log, new Date().toISOString() + ' helper: ' + m + '\\n'); } catch (e) {} };
const alive = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let ok = false, msg = '';
  try {
    log('waiting for the game (pid ' + a.pid + ') to close');
    for (let t = 0; alive(a.pid) && t < 600; t++) await sleep(200);
    await sleep(500);
    const dst = path.join(a.resources, 'app.asar');
    fs.copyFileSync(a.staged, dst + '.new');
    for (let i = 0; i < 60 && !ok; i++) {
      try { fs.copyFileSync(dst, dst + '.prev'); fs.renameSync(dst + '.new', dst); ok = true; }
      catch (e) { msg = e.code + ' ' + e.message; await sleep(500); }
    }
    if (ok) { try { fs.unlinkSync(a.staged); } catch (e) {} msg = ''; log('swapped in ' + a.version); }
    else { try { fs.unlinkSync(dst + '.new'); } catch (e) {} msg = 'The game files were still in use (' + msg + ').'; log(msg); }
  } catch (e) { msg = e.message; log('failed: ' + e.stack); }
  try { fs.writeFileSync(a.result, JSON.stringify({ ok, version: a.version, message: msg, at: new Date().toISOString() })); } catch (e) {}
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  try { spawn(a.exe, a.args, { detached: true, stdio: 'ignore', cwd: path.dirname(a.exe), env }).unref(); log('relaunched'); }
  catch (e) { log('relaunch failed: ' + e.message); }
  setTimeout(() => process.exit(0), 500);
})();
`;

function apply() {
  const s = stagedVersion();
  if (!s || status.state !== 'ready') return false;
  const resources = process.env.NB_RESOURCES || process.resourcesPath;
  const helper = path.join(dir, 'apply.js'), result = path.join(dir, 'result.json');
  fs.writeFileSync(helper, HELPER);
  try { fs.unlinkSync(result); } catch (e) {}
  const a = { staged: path.join(dir, 'app.asar'), resources, exe: process.execPath, args: process.argv.slice(1),
    pid: process.pid, result, version: s.version, log };
  note('applying ' + s.version + ' with ' + process.execPath + ' as node');
  const child = spawn(process.execPath, [helper, JSON.stringify(a)], {
    detached: true, stdio: 'ignore', windowsHide: true, env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } });
  child.on('error', e => { note('helper failed to start: ' + e.message); set({ state: 'error', message: 'Could not start the updater: ' + e.message }); });
  child.unref();
  set({ state: 'applying' });
  return true;
}

// After a restart: report how the last apply went, once.
function lastResult() {
  const f = path.join(dir, 'result.json');
  try {
    const r = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')); fs.unlinkSync(f);
    note('last apply: ' + JSON.stringify(r));
    if (r.ok && r.version === status.current) return { ok: true, version: r.version };
    return { ok: false, version: r.version, message: r.message || 'The update did not finish.' };
  } catch (e) { return null; }
}

function init(opts) {
  dir = path.join(app.getPath('userData'), 'update'); log = path.join(dir, 'log.txt'); pkg = opts.pkg || {}; send = opts.send || send;
  try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  status.current = app.getVersion();
  status.updated = lastResult();
  if (status.updated && !status.updated.ok) set({ state: 'error', message: status.updated.message });
  // A staged copy that is not newer (already installed, or older) is cleared.
  const s = stagedVersion();
  if (s && !newer(s.version, status.current)) { try { fs.unlinkSync(path.join(dir, 'app.asar')); fs.unlinkSync(path.join(dir, 'staged.json')); } catch (e) {} }
  const enabled = app.isPackaged || process.env.NB_UPDATE_TEST;
  if (!enabled) { set({ state: 'off' }); return; }
  setTimeout(check, 4000);
  setInterval(check, CHECK_MS).unref();
}

module.exports = { init, check, apply, getStatus: () => status, _test: { zipEntry, asarInfo, newer, asarRead, asarWrite } };

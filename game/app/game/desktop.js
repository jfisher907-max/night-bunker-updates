// Desktop-only UI layered on the web build: a Display options panel, quit buttons and an FPS
// counter. Does nothing when window.nbDesktop is missing (plain browser).
(function () {
  'use strict';
  const D = window.nbDesktop;
  if (!D) return;
  const $ = id => document.getElementById(id);
  let st = D.getState();

  const css = document.createElement('style');
  css.textContent = `
#deskOv{z-index:7;background:radial-gradient(ellipse at 50% 35%,rgba(30,7,6,.97),rgba(4,5,7,.99) 70%)}
#deskOv .card{width:min(620px,100%)}
#deskOv .opt{display:grid;grid-template-columns:150px 1fr;gap:10px 18px;align-items:center;margin:4px 0 18px}
#deskOv .opt .hint{grid-column:2;font-size:12px;color:var(--paper-dim);margin-top:-6px}
#deskOv .seg button:disabled{opacity:.35;cursor:default}
#deskOv .restart{border:1px dashed var(--brass);padding:10px 12px;margin-bottom:16px;font-size:14px;color:var(--brass);display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
#deskFps{position:fixed;right:10px;bottom:8px;z-index:9;font:12px var(--ui);color:var(--toxic);text-shadow:0 1px 0 #000;pointer-events:none;letter-spacing:.06em}
#deskVerWrap{float:right;display:inline-flex;align-items:stretch;margin-top:4px}
#deskVerWrap .verTop{float:none;margin:0}
#deskUpdBtn{font:12px var(--ui);letter-spacing:.1em;color:var(--paper-dim);background:transparent;border:1px solid var(--paper-dim);border-right:0;padding:2px 10px;cursor:pointer;opacity:.85;white-space:nowrap}
#deskUpdBtn:hover:not(:disabled),#deskUpdBtn:focus-visible{opacity:1;color:var(--paper)}
#deskUpdBtn:disabled{cursor:default}
#deskUpdBtn.hot{color:#120303;background:var(--brass);border-color:var(--brass);opacity:1;font-weight:bold;animation:nbpulse 1.6s ease-in-out infinite}
#deskUpdBtn.busy{color:var(--brass);border-color:var(--brass);opacity:1}
#deskUpdBtn.ok{color:var(--toxic);border-color:var(--toxic);opacity:1}
#deskUpdBtn.err{color:#e0a080;border-color:#a05040;opacity:1}
@keyframes nbpulse{50%{box-shadow:0 0 12px var(--brass)}}
#deskUpd{border:1px dashed var(--brass);background:rgba(10,8,6,.82);padding:10px 14px;margin:0 0 14px;font:15px var(--ui);color:var(--brass);display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
#deskUpd .btn{font-size:17px;padding:6px 18px}
#deskUpd.err{color:#e0a080;border-color:#a05040}
#deskUpd .bar{flex:1 1 120px;height:6px;background:rgba(255,255,255,.12)}#deskUpd .bar i{display:block;height:100%;background:var(--brass)}
#deskUpdOv{position:fixed;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(4,5,7,.88);padding:16px}
#deskUpdOv[hidden]{display:none}
#deskUpdOv .card{max-width:520px;width:100%;text-align:center;border:1px solid var(--brass);background:#0d0b09;padding:26px 22px}
#deskUpdOv h2{margin:6px 0 10px}#deskUpdOv p{font:15px var(--ui);color:var(--paper-dim);margin:0 0 16px;line-height:1.5}
#deskUpdOv .spin{width:34px;height:34px;margin:4px auto 10px;border:3px solid rgba(255,255,255,.15);border-top-color:var(--brass);border-radius:50%;animation:nbspin 0.9s linear infinite}
#deskUpdOv .ok{font-size:34px;color:var(--toxic);margin:0 0 6px}#deskUpdOv.err .ok{color:#e0a080}
@keyframes nbspin{to{transform:rotate(360deg)}}
@media (max-width:560px){#deskOv .opt{grid-template-columns:1fr}#deskOv .opt .hint{grid-column:1}}`;
  document.head.appendChild(css);

  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'deskOv'; ov.hidden = true;
  ov.innerHTML = `<div class="card">
    <div class="stamp">FIELD KIT · DISPLAY</div>
    <h2>Display options</h2>
    <div class="opt">
      <label>MODE</label><div class="seg" id="dMode"><button data-v="windowed">Windowed</button><button data-v="borderless">Borderless</button><button data-v="fullscreen">Fullscreen</button></div>
      <div class="hint">F11 or Alt+Enter switches between windowed and fullscreen at any time.</div>
      <label>WINDOW SIZE</label><div class="seg" id="dSize"></div>
      <div class="hint" id="dSizeHint">Used in windowed mode. Fullscreen and borderless always fill the screen.</div>
      <label>VSYNC</label><div class="seg" id="dVsync"><button data-v="on">On</button><button data-v="off">Off</button></div>
      <div class="hint">Off removes the frame cap. Takes effect after a restart.</div>
      <label>FPS COUNTER</label><div class="seg" id="dFps"><button data-v="on">Show</button><button data-v="off">Hide</button></div>
    </div>
    <div class="restart" id="dRestart" hidden><span>Some changes apply after a restart. Your Depot progress is saved.</span><button class="btn ghost" id="dRestartBtn">Restart now</button></div>
    <div class="row"><button class="btn" id="dBack">Done</button><button class="btn ghost" id="dQuit">Quit to desktop</button><span class="note" style="margin:0" id="dVer"></span></div>
    <div class="note" id="dUpd" style="margin:10px 0 0;font-size:13px"></div>
  </div>`;
  document.body.appendChild(ov);

  const fps = document.createElement('div'); fps.id = 'deskFps'; fps.hidden = !st.settings.showFps; document.body.appendChild(fps);

  $('dSize').innerHTML = st.sizes.map(([w, h]) => `<button data-v="${w}x${h}">${w}×${h}</button>`).join('');

  function render() {
    const s = st.settings, mode = st.mode === 'borderless' || s.displayMode === 'borderless' ? s.displayMode : st.mode;
    const on = (seg, v) => seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    on($('dMode'), mode);
    on($('dSize'), `${s.width}x${s.height}`);
    $('dSize').querySelectorAll('button').forEach(b => { b.disabled = mode !== 'windowed'; });
    on($('dVsync'), s.vsync ? 'on' : 'off');
    on($('dFps'), s.showFps ? 'on' : 'off');
    $('dRestart').hidden = !st.restartNeeded;
    $('dVer').textContent = 'v' + st.version;
    fps.hidden = !s.showFps;
  }
  const set = patch => D.setSettings(patch).then(s => { st = s; render(); });
  $('dMode').addEventListener('click', e => { const v = e.target.dataset && e.target.dataset.v; if (v) set({ displayMode: v }); });
  $('dSize').addEventListener('click', e => { const v = e.target.dataset && e.target.dataset.v; if (v && !e.target.disabled) { const [w, h] = v.split('x').map(Number); set({ width: w, height: h }); } });
  $('dVsync').addEventListener('click', e => { const v = e.target.dataset && e.target.dataset.v; if (v) set({ vsync: v === 'on' }); });
  $('dFps').addEventListener('click', e => { const v = e.target.dataset && e.target.dataset.v; if (v) set({ showFps: v === 'on' }); });
  $('dRestartBtn').addEventListener('click', () => D.restart());
  $('dQuit').addEventListener('click', () => D.quit());

  let returnFocus = null;
  function open() { returnFocus = document.activeElement; st = D.getState(); render(); ov.hidden = false; $('dBack').focus(); }
  function close() { ov.hidden = true; if (returnFocus && returnFocus.focus) returnFocus.focus(); }
  $('dBack').addEventListener('click', close);
  // While the panel is open, keys must not reach the game (digits pick classes, Enter starts a run).
  window.addEventListener('keydown', e => {
    if (ov.hidden) return;
    e.stopImmediatePropagation();
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  }, true);
  D.onState(s => { st = s; if (!ov.hidden) render(); fps.hidden = !st.settings.showFps; });

  // Buttons on the title screen and the pause screen.
  const btn = (label, cls, fn) => { const b = document.createElement('button'); b.className = cls; b.textContent = label; b.addEventListener('click', fn); return b; };
  const playRow = $('playBtn') && $('playBtn').parentElement;
  if (playRow) { playRow.appendChild(btn('Display', 'btn ghost', open)); playRow.appendChild(btn('Quit', 'btn ghost', () => D.quit())); }
  const pauseRow = $('resumeBtn') && $('resumeBtn').parentElement;
  if (pauseRow) { pauseRow.appendChild(btn('Display', 'btn ghost', open)); pauseRow.appendChild(btn('Quit to desktop', 'btn ghost', () => D.quit())); }
  const overRow = $('againBtn') && $('againBtn').parentElement;
  if (overRow) overRow.appendChild(btn('Quit', 'btn ghost', () => D.quit()));
  const touch = $('touchNote'); if (touch) touch.textContent = 'Sound on recommended. F11 toggles fullscreen.';

  // FPS counter (frames per second of the page, updated twice a second).
  let frames = 0, t0 = performance.now();
  (function tick(t) {
    frames++;
    if (t - t0 >= 500) { if (!fps.hidden) fps.textContent = Math.round(frames * 1000 / (t - t0)) + ' FPS'; frames = 0; t0 = t; }
    requestAnimationFrame(tick);
  })(t0);
  // ---------- updates: a button joined to the version box on the main menu (never mid-run) ----------
  if (D.updateStatus) {
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const card = document.createElement('div'); card.id = 'deskUpdOv'; card.hidden = true; document.body.appendChild(card);
    // [ Update to v6.77.0 ][ v6.76.0 · Windows ]: the button sits flush against the version tag
    const ver = document.querySelector('.verTop'), wrap = document.createElement('span'), ub = document.createElement('button');
    wrap.id = 'deskVerWrap'; ub.id = 'deskUpdBtn'; ub.type = 'button';
    if (ver && ver.parentElement) { ver.parentElement.insertBefore(wrap, ver); wrap.appendChild(ub); wrap.appendChild(ver); }
    let us = D.updateStatus(), shownOk = false, checking = false, flash = '', flashT = 0;
    const say = (t, ms = 6000) => { flash = t; clearTimeout(flashT); flashT = setTimeout(() => { flash = ''; renderUpd(); }, ms); };
    function renderUpd() {
      const u = us;
      // the version-box button
      let label = 'Check for updates', cls = '', dis = false, tip = 'Look for a new version now';
      if (u.state === 'off') { label = 'Updates off'; dis = true; tip = 'Updates are off in this copy'; }
      else if (u.state === 'applying') { label = 'Installing…'; dis = true; cls = 'hot'; }
      else if (u.state === 'ready') { label = `Install update v${u.version}`; cls = 'hot'; tip = 'Install now: the game closes and reopens in a few seconds. Saves and runs are kept.'; }
      else if (u.state === 'downloading') { label = `Downloading v${u.version} · ${Math.round((u.progress || 0) * 100)}%`; dis = true; cls = 'busy'; }
      else if (u.state === 'installer') { label = 'Update needs reinstall'; cls = 'err'; tip = u.message || ''; }
      else if (checking || u.state === 'checking') { label = 'Checking…'; dis = true; }
      else if (flash) { label = flash; cls = /reach|failed|error/i.test(flash) ? 'err' : 'ok'; tip = u.lastError || ''; }
      ub.textContent = label; ub.className = cls; ub.disabled = dis; ub.title = tip;
      // full-screen cards: while the update installs, and once after the game reopens
      let c = '', cerr = false;
      if (u.state === 'applying') c = `<div class="spin"></div><h2>Installing update v${esc(u.version || '')}</h2><p>Night Bunker will close and reopen by itself in a few seconds. Please don't start it again in the meantime.</p>`;
      else if (u.updated && !shownOk && u.updated.ok) c = `<div class="ok">✔</div><h2>Update complete</h2><p>You're now on v${esc(u.updated.version)}. Your saves and runs carried over.</p><button class="btn" data-a="dismiss">Play</button>`;
      else if (u.updated && !shownOk && !u.updated.ok) { cerr = true; c = `<div class="ok">✖</div><h2>Update didn't install</h2><p>${esc(u.updated.message || 'Something went wrong.')} You're still on v${esc(u.current)}; it will offer the update again.</p><button class="btn" data-a="dismiss">OK</button>`; }
      card.classList.toggle('err', cerr); card.innerHTML = c ? `<div class="card">${c}</div>` : ''; card.hidden = !c;
      if (c && card.querySelector('button')) card.querySelector('button').focus();
      if (c && u.updated && u.updated.ok && !shownOk && !card._t) card._t = setTimeout(() => { if (!shownOk) { shownOk = true; renderUpd(); } }, 12000);
      // status line in the Display panel
      const when = u.lastCheck ? new Date(u.lastCheck).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
      $('dUpd').textContent = checking ? 'Checking for updates…'
        : u.state === 'off' ? 'Updates: off in this copy.'
        : u.state === 'ready' ? `Updates: v${u.version} is ready. Press "Install update v${u.version}" next to the version box on the main menu.`
        : u.state === 'downloading' ? `Updates: downloading v${u.version}… ${Math.round((u.progress || 0) * 100)}%`
        : u.lastError ? `Updates: couldn't reach the update server at ${when} (${u.lastError}). You're on v${u.current}.`
        : u.lastCheck ? `Updates: up to date. You're on v${u.current}${u.latest ? ', the newest is v' + u.latest : ''} (checked ${when}).`
        : 'Updates: checking shortly after launch.';
    }
    function manualCheck() {
      if (checking) return;
      checking = true; renderUpd();
      D.checkUpdate().then(s => {
        checking = false; us = s;
        if (s.state === 'ready' || s.state === 'downloading') say('', 1);
        else if (s.lastError) say("Can't reach update server", 9000);
        else say(`Up to date ✓`);
        renderUpd();
      }, e => { checking = false; say('Check failed', 9000); renderUpd(); });
    }
    ub.addEventListener('click', () => {
      if (us.state === 'ready') { us = { ...us, state: 'applying' }; renderUpd(); D.applyUpdate(); }
      else if (us.state === 'installer') alert(us.message);
      else manualCheck();
    });
    card.addEventListener('click', e => { if (e.target.dataset && e.target.dataset.a === 'dismiss') { shownOk = true; if (us.state === 'error') us = { ...us, state: 'none', message: '' }; renderUpd(); } });
    window.addEventListener('keydown', e => { if (!card.hidden) { e.stopImmediatePropagation(); if ((e.key === 'Enter' || e.key === 'Escape') && card.querySelector('button')) { e.preventDefault(); card.querySelector('button').click(); } } }, true);
    D.onUpdate(s => { us = s; renderUpd(); });
    renderUpd();
  }
  render();
})();

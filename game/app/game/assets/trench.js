// Night Bunker v6.72 The Dornfeld Line: TrenchPlan + TrenchDress (loaded by a script tag ahead of the game block)
// ======================= v6.72 THE DORNFELD LINE (a new PlanMaps map: a trench system under open sky) =======================
// A stretch of the Western Front at night, built below ground level: the ground you fight from is the trench floor, the earth
// stands 1.8 m over your head on every side, and the dead walk across the field above and drop in over the parapet. The fire
// trench along the north is eight sandbagged fire bays joined by traverses (the zig-zag that stops a shot carrying down the
// line); fire steps let you see over the parapet into no-man's land. Two communication trenches run back to the support line
// (the start), one flooded at the knee; the walk up the middle passes through the shell of a chapel in its own walled yard.
// Dugouts off the trenches: the aid post and the officers' dugout on the support line, the battalion dugout (the power) off
// the fire trench, a listening sap pushed out past the parapet. One ring (support, west trench, fire trench, east trench) and
// the chapel loop up the middle. Levels: 0 everywhere, fire steps 0.45; the outside ground 1.8 (every solid cell's top), the bays' parapet 1.55 with one bag course: on a fire step your eyes clear it.
const TrenchPlan = (() => {
  'use strict';
  const GROUND = 1.8, STEP = 0.45;
  function trench(seed, opts) {
    const { kit, finish } = PlanMaps;
    const st = kit(64, 54, 8, 8);
    st.rect(-1, -1, 46, 36, '#');
    st.rect(43, -6, 46, -2, '#');   // the sap's own walls, out past the parapet
    // ---- the support line (start): a straight trench with an alcove for the mortar; the aid post and the officers' dugout off its south side
    const SL = st.zone('Support Line', [[0, 28, 45, 29], [8, 30, 10, 31], [2, 31, 7, 34], [4, 30, 5, 30], [36, 31, 43, 34], [39, 30, 40, 30]], { floor: 'duck', open: true, lamps: 7 });   // 0
    for (const [x, z] of [[4, 30], [5, 30], [39, 30], [40, 30]]) st.gaps.push([x, z]);
    st.roof(2, 31, 7, 34, 'Aid Post'); st.roof(36, 31, 43, 34, "Officers' Dugout");
    // ---- the communication trenches: Sump Street west (its middle leg flooded), Lantern Alley east
    const WC = st.zone('Sump Street', [[4, 5, 5, 14], [4, 14, 9, 15], [8, 16, 9, 26]], { floor: 'mud', open: true, lamps: 3 });          // 1
    const EC = st.zone('Lantern Alley', [[40, 5, 41, 14], [36, 14, 41, 15], [36, 16, 37, 26]], { floor: 'duck', open: true, lamps: 3 });   // 2
    // ---- the fire trench: bays (rows 0-1, fire step on row 0) and traverses (rows 2-3) alternating along the north; the walk up to
    // the chapel (x 22-23), the battalion dugout off the fifth traverse, the sap through the parapet at the east end
    const FR = [];
    for (let b = 0; b < 8; b++) { FR.push([6 * b, 0, 6 * b + 3, 1]); if (b < 7) FR.push([6 * b + 3, 2, 6 * b + 6, 3]); }
    FR.push([22, 4, 23, 11], [27, 5, 31, 8], [28, 4, 29, 4], [44, -5, 45, -2], [44, -1, 45, -1]);
    const FT = st.zone('Fire Trench', FR, { floor: 'duck', open: true, lamps: 9 });   // 3 (the power, in the battalion dugout)
    for (const [x, z] of [[28, 4], [29, 4], [44, -1], [45, -1]]) st.gaps.push([x, z]);
    st.roof(27, 5, 31, 8, 'Battalion Dugout');
    for (let b = 0; b < 8; b++) for (let x = 6 * b; x <= 6 * b + 2; x++) if (!(b === 7 && x > 43)) st.elev(x, 0, x, 0, STEP);   // the fire steps
    // ---- Chapel Walk and the chapel yard: the ruin stands across the middle of the yard, a doorway in every wall
    const CW = st.zone('Chapel Walk', [[22, 20, 23, 26]], { floor: 'duck', open: true, lamps: 2 });   // 4
    const CH = st.zone('Chapel Yard', [[14, 13, 18, 18], [27, 13, 31, 18], [20, 14, 25, 17], [22, 13, 23, 13], [22, 18, 23, 18], [19, 15, 19, 16], [26, 15, 26, 16]], { floor: 'flag', open: true, lamps: 4 });   // 5
    for (const [x, z] of [[22, 13], [23, 13], [22, 18], [23, 18], [19, 15], [19, 16], [26, 15], [26, 16]]) st.gaps.push([x, z]);
    // ---- the outside ground: every solid cell's top (and the field beyond the walls) stands GROUND over the trench floor
    for (let z = 0; z < st.H; z++) for (let x = 0; x < st.W; x++) { const c = st.g[z][x]; if (c === '#' || c === 'o') st.E[z * st.W + x] = GROUND; }
    for (let b = 0; b < 8; b++) for (let x = 6 * b; x <= 6 * b + 2; x++) if (!(b === 7 && x > 43)) st.E[st.K(x, -1)] = GROUND - 0.25;   // the bays' parapet: a low bag course the fire step looks over
    // ---- the flooded leg of Sump Street
    st.wet(4, 14, 7, 15);
    // ---- doors
    st.door('A', 8, 27, 9, 27, SL, WC, 750, 'x');
    st.door('B', 36, 27, 37, 27, SL, EC, 750, 'x');
    st.door('D', 4, 4, 5, 4, WC, FT, 1000, 'x');
    st.door('E', 40, 4, 41, 4, EC, FT, 1000, 'x'); st.doors[st.doors.length - 1].loop = true;
    st.door('F', 22, 27, 23, 27, SL, CW, 1000, 'x');
    st.door('G', 22, 19, 23, 19, CW, CH, 1250, 'x');
    st.door('H', 22, 12, 23, 12, CH, FT, 1250, 'x'); st.doors[st.doors.length - 1].loop = true;
    // ---- barricades: the parapet gaps in the fire bays, the sap on three sides, the trench ends, the back walls of the
    // communication trenches, the chapel yard's walls, the support line's rear. The dead stand on the ground above every one.
    for (let b = 0; b < 7; b++) st.win(6 * b + 1, -1, 0, -1);
    st.win(43, -4, -1, 0); st.win(46, -4, 1, 0); st.win(45, -6, 0, -1);
    st.win(-1, 1, -1, 0); st.win(46, 1, 1, 0);
    st.win(3, 9, -1, 0); st.win(7, 22, -1, 0); st.win(42, 9, 1, 0); st.win(38, 22, 1, 0);
    st.win(16, 12, 0, -1); st.win(29, 12, 0, -1); st.win(16, 19, 0, 1); st.win(29, 19, 0, 1);
    st.win(14, 30, 0, 1); st.win(30, 30, 0, 1);
    // ---- what stands on the floors
    st.obj('mortar', 9, 31, 1, 1, 'C', 1.0);
    st.obj('brazier', 5, 7, 1, 1, 'C', 1.1); st.obj('brazier', 40, 12, 1, 1, 'C', 1.1); st.obj('brazier', 18, 29, 1, 1, 'C', 1.1); st.obj('brazier', 33, 29, 1, 1, 'C', 1.1); st.obj('brazier', 23, 23, 1, 1, 'C', 1.1);
    st.obj('graves', 14, 14, 2, 2, 'C', 1.0); st.obj('crater', 28, 16, 2, 2, 'C', 0.3); st.obj('cart', 15, 17, 2, 1, 'C', 1.4);
    st.obj('altar', 24, 15, 1, 2, 'C', 1.2); st.obj('pump', 9, 20, 1, 1, 'C', 1.0); st.obj('watertank', 36, 17, 1, 1, 'C', 1.6);
    // ---- fittings
    st.wb(5, 28, 0); st.wb(40, 28, 1); st.wb(4, 10, 2); st.wb(41, 10, 3); st.wb(8, 1, 4); st.wb(32, 1, 5); st.wb(31, 13, 6);
    st.perk(12, 29, 'revive'); st.perk(31, 8, 'jugg'); st.perk(8, 20, 'speed'); st.perk(37, 20, 'dtap'); st.perk(7, 34, 'bench');
    st.box(2, 29); st.box(43, 29); st.box(4, 14); st.box(41, 14); st.box(45, -5); st.box(14, 18);
    st.trap('A', 8, 25); st.trap('B', 37, 25);
    const power = { x: st.X(31), z: st.Z(6), zone: FT };
    const start = { x: st.X(22), z: st.Z(29) };
    const M = finish(st, seed, opts, { power, start, fog: 0.62, plan: 'trench', theme: 'trench' });
    M.noTrim = [FT, SL, WC, EC, CW, CH];
    M.trench = { zones: { SL, WC, EC, FT, CW, CH }, ground: GROUND, step: STEP, chapel: { x0: st.X(19), z0: st.Z(13), x1: st.X(26), z1: st.Z(18) }, sap: { x0: st.X(43), z0: st.Z(-6), x1: st.X(46), z1: st.Z(-1) },
      bays: Array.from({ length: 8 }, (_, b) => st.X(6 * b)), names: { [SL]: 'SUPPORT LINE', [WC]: 'SUMP STREET', [EC]: 'LANTERN ALLEY', [FT]: 'FIRE TRENCH', [CW]: 'CHAPEL WALK', [CH]: 'CHAPEL YARD' } };
    return M;
  }
  PlanMaps.BUILD.trench = trench;
  return { trench };
})();
// v6.72 TrenchDress: draws the Dornfeld Line (the PlanMaps 'trench' plan). A trench system under open sky: every solid cell
// is earth standing GROUND (1.9 m) over the trench floor, faced with the Blender revetments (assets/trench.json), duckboards
// down the middle, sandbag parapets along the fire bays and round every barricade, fire steps of timber and earth, dugouts
// roofed with beams, earth and corrugated iron, a fieldstone chapel standing roofless in its walled yard, and no-man's land
// beyond the parapet: mud, shell craters, wire on screw pickets, dead trees, a wrecked tank. Same contract as HallDress:
// { root, stats, wallTop, lowTop, bulbs, powerMats, rail, noRain, setPower, setQuality, dispose }. Lights: one SpotLight per
// map lightSpot (a hurricane lantern on a stake), one per brazier; nothing added later.
const TrenchDress = (() => {
  'use strict';
  const TAU = Math.PI * 2, HPI = Math.PI / 2;
  function build(group, ctx) {
    const T0 = performance.now();
    const THREE = ctx.THREE, TP = ctx.TexPack, map = ctx.map, GW = ctx.GW, GH = ctx.GH, CELL = ctx.CELL, cc = ctx.cc, cellCh = ctx.cellCh, rng = ctx.rng || Math.random;
    const floorAt = ctx.floorAt, E = map.elev, RS = map.rise, hi = ctx.quality !== 'low', high = ctx.quality === 'high';
    const R = (a, b) => a + rng() * (b - a), chance = p => rng() < p;
    const own = []; const track = o => { own.push(o); return o; };
    const root = new THREE.Group(); root.name = 'trenchDress'; group.add(root);
    const tm = (name, o) => { const m = track(TP.material(name, o)); m.envMapIntensity = 0.3; return m; }, col = h => new THREE.Color(h);
    const std = o => { const m = track(new THREE.MeshStandardMaterial(o)); m.envMapIntensity = 0.3; return m; };
    const TR = map.trench || { zones: {}, ground: 1.8, step: 0.45, names: {} }, ZN = TR.zones || {}, GROUND = TR.ground || 1.8, STEP = TR.step || 0.45;
    const WALL_TOP = GROUND + 0.1, CHAPEL_H = 4.4, YARD_H = 2.7, HUT_H = 2.35;
    const MAT = {
      mud: tm('dirt', { color: col(0x5c4e40) }), mud2: tm('dirt', { color: col(0x4e4236) }), mud3: tm('dirt', { color: col(0x6a5a48) }), clay: tm('dirt', { color: col(0x7a6650) }),
      field: tm('dirt', { color: col(0x4a4036) }), crater: tm('dirt', { color: col(0x2e2822) }),
      sandbag: tm('sandbag', { color: col(0xb8a888) }), sandbagDark: tm('sandbag', { color: col(0x8a7c62) }),
      plank: tm('planks', { color: col(0x7a6650) }), plankDark: tm('planks', { color: col(0x4e4034) }), wood: tm('wood', { color: col(0x8a7256) }), woodDark: tm('wood', { color: col(0x4a3a2c) }), boards: tm('floorPlank', { color: col(0x7a6450) }),
      stone: tm('stone', { color: col(0x9a948a) }), stoneDark: tm('stone', { color: col(0x6a655e) }), flag: tm('stone', { color: col(0x7a766e) }), flagWet: tm('stone', { color: col(0x55524c) }),
      tin: tm('tin', { color: col(0x6e6a62), side: THREE.DoubleSide }), tinDark: tm('tin', { color: col(0x4a4742), side: THREE.DoubleSide }), rust: tm('rust', { color: col(0xa08a78) }), rustDark: tm('rust', { color: col(0x6a5a50) }),
      iron: tm('gunmetal', { color: col(0x3a3a38), roughness: 1.3 }), steel: tm('gunmetal', { color: col(0x62645f), roughness: 1.0 }), canvas: tm('cloth', { color: col(0x6a6a52) }),
      water: std({ color: 0x0c1210, roughness: 0.12, metalness: 0.55 }), black: std({ color: 0x0a0a09, roughness: 0.95 }),
      fire: std({ color: 0x200800, emissive: 0xff6418, emissiveIntensity: 1.5 }), ember: std({ color: 0x180600, emissive: 0xff3a08, emissiveIntensity: 0.5 }),
      lamp: std({ color: 0x332a20, emissive: 0xffd9a0, emissiveIntensity: 0.05, roughness: 0.3 }),
    };
    const geos = []; const G = g => { geos.push(g); return g; };
    const BOX = G(new THREE.BoxGeometry(1, 1, 1)), CYL = G(new THREE.CylinderGeometry(1, 1, 1, 16)), CYL8 = G(new THREE.CylinderGeometry(1, 1, 1, 8)), PLANE = G(new THREE.PlaneGeometry(1, 1)),
      TORUS = G(new THREE.TorusGeometry(1, 0.1, 6, 24)), CONE = G(new THREE.ConeGeometry(1, 1, 12)), DISH = G(new THREE.CylinderGeometry(0.15, 1, 1, 16, 1, true)), SPH = G(new THREE.SphereGeometry(1, 10, 7));
    const Batch = HallDress.Batch;
    const B = new Batch(THREE), BN = new Batch(THREE);
    const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ'), _s = new THREE.Vector3();
    const M4 = (x, y, z, rx, ry, rz, sx, sy, sz) => { _p.set(x, y, z); _e.set(rx || 0, ry || 0, rz || 0); _q.setFromEuler(_e); _s.set(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz); return _m.compose(_p, _q, _s); };
    const box = (mat, x0, y0, z0, x1, y1, z1, bt, uv) => { if (x1 - x0 < 1e-3 || y1 - y0 < 1e-3 || z1 - z0 < 1e-3) return; (bt || B).add(BOX, mat, M4((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, 0, 0, 0, x1 - x0, y1 - y0, z1 - z0), uv === undefined ? 'w' : uv); };
    const boxR = (mat, x, y, z, sx, sy, sz, ry, bt, rx, rz) => (bt || B).add(BOX, mat, M4(x, y, z, rx || 0, ry || 0, rz || 0, sx, sy, sz), 'w');
    const put = (geo, mat, x, y, z, rx, ry, rz, sx, sy, sz, bt, uv) => (bt || B).add(geo, mat, M4(x, y, z, rx, ry, rz, sx, sy, sz), uv === undefined ? 'w' : uv);
    const _a = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
    const beam = (mat, x0, y0, z0, x1, y1, z1, s, bt, geo) => { _a.set(x1 - x0, y1 - y0, z1 - z0); const L = _a.length(); if (L < 1e-3) return; _a.divideScalar(L); _q.setFromUnitVectors(_up, _a); _p.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); _s.set(s, L, s); _m.compose(_p, _q, _s); (bt || B).add(geo || BOX, mat, _m, 'w'); };
    const PB = new PropKit.Batch(), HAS = k => PropKit.has(k);
    const pp = (key, x, y, z, ry, s, sy) => HAS(key) && PB.add(key, M4(x, y, z, 0, ry || 0, 0, s || 1, sy || s || 1, s || 1));
    const ch = (x, z) => cellCh(x, z), inG = (x, z) => x >= 0 && z >= 0 && x < GW && z < GH, k_ = (x, z) => z * GW + x;
    const zoneAt = (x, z) => inG(x, z) && map.zoneOf[z] ? map.zoneOf[z][x] : -1;
    const isDoorC = c => c >= 'A' && c <= 'H' && c !== 'C';
    const walk = c => c === '.' || c === 'C' || c === 'W' || isDoorC(c);
    const objCell = new Map(); for (const ob of map.objects) for (let z = ob.z0; z < ob.z0 + ob.h; z++) for (let x = ob.x0; x < ob.x0 + ob.w; x++) objCell.set(k_(x, z), ob);
    const winAt = new Map(); for (const w of map.windows) winAt.set(k_(w.x, w.z), w);
    const doorAt = new Map(); for (const d of map.doors) for (const [x, z] of d.cells) doorAt.set(k_(x, z), d);
    const gapSet = new Set((map.gaps || []).map(([x, z]) => k_(x, z)));
    const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const stats = { tris: 0, ms: 0, bulbs: 0 };
    const RC = map.roofCell, roofC = (x, z) => inG(x, z) && RC && RC[k_(x, z)] === 1;
    const lowTop = new Map(), signs = [];
    const hash = (x, z) => ((x * 73856093) ^ (z * 19349663)) >>> 0;
    // the chapel ring (its walls), the yard, the sap
    const CP = TR.chapel || null, inChapelRing = (x, z) => CP && x >= CP.x0 && x <= CP.x1 && z >= CP.z0 && z <= CP.z1, inChapelIn = (x, z) => CP && x > CP.x0 && x < CP.x1 && z > CP.z0 && z < CP.z1;
    const yardWall = (x, z) => { if (ch(x, z) !== '#' || inChapelRing(x, z)) return false; for (const [dx, dz] of D4) if (zoneAt(x + dx, z + dz) === ZN.CH && walk(ch(x + dx, z + dz))) return true; return false; };
    const hutWall = (x, z) => { if (!walk(ch(x, z))) { for (const [dx, dz] of D4) if (roofC(x + dx, z + dz) && walk(ch(x + dx, z + dz))) return true; } return false; };
    const mudOf = (x, z) => { const h = hash(x, z) % 7; return h < 3 ? MAT.mud : h < 5 ? MAT.mud2 : MAT.mud3; };
    const trenchCell = (x, z) => walk(ch(x, z)) && zoneAt(x, z) >= 0 && !roofC(x, z) && !inChapelIn(x, z) && zoneAt(x, z) !== ZN.CH;

    // ================================================================ floors: mud (three shades), flagstones in the chapel and its yard, boards in the dugouts, duckboards down the trenches
    const corridorRy = (x, z) => { const lx = walk(ch(x - 1, z)) + walk(ch(x + 1, z)), lz = walk(ch(x, z - 1)) + walk(ch(x, z + 1)); return lx > lz ? 0 : lz > lx ? HPI : (hash(x, z) & 1 ? 0 : HPI); };
    const wet = map.water;
    for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) {
      const zn = zoneAt(x, z), c = ch(x, z); if (zn < 0 && !isDoorC(c) && c !== 'W') continue;
      const k = k_(x, z); if (RS[k]) continue;
      const h = E[k], x0 = x * CELL, z0 = z * CELL, roofed = roofC(x, z), chapel = inChapelIn(x, z) || zn === ZN.CH;
      let mat = roofed ? MAT.boards : chapel ? ((hash(x, z) % 5) < 2 ? MAT.flagWet : MAT.flag) : mudOf(x, z);
      if (wet && wet[k]) mat = MAT.mud2;
      put(PLANE, mat, x0 + 1, h + 0.012, z0 + 1, -HPI, 0, 0, CELL, CELL, 1, BN);
      if (wet && wet[k]) put(PLANE, MAT.water, x0 + 1, h + 0.27, z0 + 1, -HPI, 0, 0, CELL + 0.02, CELL + 0.02, 1, BN, null);
      if (h >= STEP - 0.01 && h < 1) {   // a fire step: a timber front holding the earth back, planks on top
        for (const [dx, dz] of D4) { const nx = x + dx, nz = z + dz; if (!walk(ch(nx, nz)) || E[k_(nx, nz)] >= h - 0.05) continue;
          if (dx) box(MAT.plankDark, dx > 0 ? x0 + CELL - 0.06 : x0, 0, z0, dx > 0 ? x0 + CELL : x0 + 0.06, h, z0 + CELL); else box(MAT.plankDark, x0, 0, dz > 0 ? z0 + CELL - 0.06 : z0, x0 + CELL, h, dz > 0 ? z0 + CELL : z0 + 0.06);
          if (dx) box(MAT.woodDark, dx > 0 ? x0 + CELL - 0.1 : x0, 0, z0 + 0.3, dx > 0 ? x0 + CELL : x0 + 0.1, h - 0.02, z0 + 0.42, BN); }
        put(PLANE, MAT.plank, x0 + 1, h + 0.02, z0 + 1, -HPI, 0, 0, CELL - 0.1, CELL - 0.1, 1, BN);
        continue;
      }
      if (hi && h < 0.05 && !roofed && !chapel && !(wet && wet[k]) && (map.floors || [])[zn] === 'duck' && c === '.') {
        const ry = corridorRy(x, z), off = (hash(x + 3, z) % 5 - 2) * 0.16, sx = 1 + (hash(x, z + 5) % 3 - 1) * 0.02;
        if (ry === 0) pp('trench_duck', x0 + 1 + (hash(x, z) % 3 - 1) * 0.05, 0.004, z0 + 1 + off, (hash(x, z + 1) % 2 ? 0 : Math.PI) + (hash(x, z) % 7 - 3) * 0.01, sx);
        else pp('trench_duck', x0 + 1 + off, 0.004, z0 + 1 + (hash(x, z) % 3 - 1) * 0.05, HPI + (hash(x, z) % 7 - 3) * 0.01, sx);
      }
    }
    // ================================================================ the earth: every solid cell a block up to the ground, its top mud; the field beyond the walls one plane each side
    const BD = map.bounds, bx0 = BD.minX * CELL, bx1 = (BD.maxX + 1) * CELL, bz0 = BD.minZ * CELL, bz1 = (BD.maxZ + 1) * CELL, FAR = 70;
    for (const [xa, za, xb, zb] of [[bx0 - FAR, bz0 - FAR, bx1 + FAR, bz0], [bx0 - FAR, bz1, bx1 + FAR, bz1 + FAR], [bx0 - FAR, bz0, bx0, bz1], [bx1, bz0, bx1 + FAR, bz1]])
      put(PLANE, MAT.field, (xa + xb) / 2, GROUND, (za + zb) / 2, -HPI, 0, 0, xb - xa, zb - za, 1, BN);
    for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) {
      const c = ch(x, z), k = k_(x, z); if (walk(c) || c === 'o') continue; if (objCell.has(k)) continue;
      const x0 = x * CELL, z0 = z * CELL;
      if (inChapelRing(x, z)) continue;   // the chapel draws its own walls below
      const yw = yardWall(x, z), hw = hutWall(x, z), top = E[k] || GROUND;
      // the block of earth
      box(mudOf(x, z), x0, -0.05, z0, x0 + CELL, top, z0 + CELL);
      if (yw) { const t = YARD_H + (hash(x, z) % 4) * 0.08; box((hash(x + 1, z) % 3) ? MAT.stoneDark : MAT.stone, x0 - 0.02, top - 0.2, z0 - 0.02, x0 + CELL + 0.02, t, z0 + CELL + 0.02); box(MAT.stone, x0 - 0.08, t, z0 - 0.08, x0 + CELL + 0.08, t + 0.14, z0 + CELL + 0.08, BN); lowTop.set(k, t + 0.1); }
      // faces toward the walkable cells: revetments in the trenches, corrugated iron and timber in the dugouts, stone in the yard
      for (const [dx, dz] of D4) {
        const nx = x + dx, nz = z + dz; if (!walk(ch(nx, nz)) || zoneAt(nx, nz) < 0) continue;
        const nk = k_(nx, nz), fh = Math.max(RS[nk] ? E[nk] : E[nk], 0), fx = x0 + 1 + dx, fz = z0 + 1 + dz, ry = Math.atan2(dx, dz), nzn = zoneAt(nx, nz), inYard = nzn === ZN.CH;
        if (inYard) {   // the yard: the stone face right down to the flags, a plinth
          if (dx) box(MAT.stoneDark, dx > 0 ? fx - 0.12 : fx, 0, z0, dx > 0 ? fx : fx + 0.12, top - 0.2, z0 + CELL); else box(MAT.stoneDark, x0, 0, dz > 0 ? fz - 0.12 : fz, x0 + CELL, top - 0.2, dz > 0 ? fz : fz + 0.12);
          continue;
        }
        const roofed = roofC(nx, nz), stepFace = fh >= STEP - 0.01, hgt = Math.min(1.85, top - fh - 0.02), sy = hgt / 1.85;
        if (roofed) {   // a dugout wall: corrugated iron behind timber posts, a wall plate under the roof
          pp('trench_revet2', fx, fh, fz, ry, 1, sy);
          if (dx) box(MAT.woodDark, dx > 0 ? fx : fx - 0.1, top - 0.14, z0 - 0.05, dx > 0 ? fx + 0.1 : fx, top, z0 + CELL + 0.05, BN); else box(MAT.woodDark, x0 - 0.05, top - 0.14, dz > 0 ? fz : fz - 0.1, x0 + CELL + 0.05, top, dz > 0 ? fz + 0.1 : fz, BN);
          continue;
        }
        if (!hi) { if (dx) box(MAT.plankDark, dx > 0 ? fx : fx - 0.06, fh, z0, dx > 0 ? fx + 0.06 : fx, top - 0.05, z0 + CELL); else box(MAT.plankDark, x0, fh, dz > 0 ? fz : fz - 0.06, x0 + CELL, top - 0.05, dz > 0 ? fz + 0.06 : fz); continue; }
        const key = (hash(x * 3 + dx, z * 5 + dz) % 7) === 0 ? 'trench_revet2' : 'trench_revet';
        pp(key, fx, fh, fz, ry, 1, sy);
        // the earth's lip over the revetment: a plank wale, a bag or two where the parapet is low
        if (dx) box(MAT.plankDark, dx > 0 ? fx : fx - 0.09, top - 0.16, z0, dx > 0 ? fx + 0.09 : fx, top - 0.02, z0 + CELL, BN); else box(MAT.plankDark, x0, top - 0.16, dz > 0 ? fz : fz - 0.09, x0 + CELL, top - 0.02, dz > 0 ? fz + 0.09 : fz, BN);
        // sandbags along the top edge: the fire bays' parapets, the flanks of every barricade, every third face elsewhere
        const win = winAt.has(k_(nx + dx, nz + dz)) || winAt.has(k_(x + (dz ? 1 : 0), z + (dx ? 1 : 0))) || winAt.has(k_(x - (dz ? 1 : 0), z - (dx ? 1 : 0)));
        const parapet = win;
        if (parapet || (!stepFace && (hash(x + 7, z + 11) % 3) === 0)) {
          const bagsRy = dx ? HPI : 0, px = dx ? fx - dx * 0.34 : x0 + 1, pz = dz ? fz - dz * 0.34 : z0 + 1;
          if (win && high && !stepFace) pp('trench_bags', px, top, pz, bagsRy + (hash(x, z) % 2 ? Math.PI : 0));
          else {   // a cheaper course of bags from boxes (one course over a fire step, so the eye clears it)
            for (let i = 0; i < 4; i++) for (let j = 0; j < (stepFace ? 1 : 2); j++) { const t = (i + 0.5) / 4 * CELL - CELL / 2 + (j ? 0.25 : 0), y = top + 0.11 + j * 0.2; if (dx) boxR(j ? MAT.sandbagDark : MAT.sandbag, px, y, pz + t, 0.5, 0.21, 0.46, 0.08 * ((hash(x + i, z + j) % 5) - 2)); else boxR(j ? MAT.sandbagDark : MAT.sandbag, px + t, y, pz, 0.46, 0.21, 0.5, 0.08 * ((hash(x + i, z + j) % 5) - 2)); }
          }
        }
      }
      // on the earth's top inside the lines: the odd crater lip, a picket, debris (keeps the mud from reading as one tile)
      if (hi && c === '#' && !yw && !hw) { const h = hash(x + 5, z + 9) % 41;
        if (h === 0) put(TORUS, MAT.crater, x0 + 1, top + 0.02, z0 + 1, HPI, 0, 0, 0.7, 0.7, 0.5, BN);
        else if (h === 1) pp('trench_picket', x0 + R(0.4, 1.6), top, z0 + R(0.4, 1.6), R(0, TAU));
        else if (h === 2) boxR(MAT.plankDark, x0 + 1, top + 0.04, z0 + 1, 1.4, 0.08, 0.22, R(0, TAU), BN);
        else if (h === 3) put(SPH, MAT.mud2, x0 + 1, top, z0 + 1, 0, 0, 0, R(0.4, 0.8), 0.2, R(0.4, 0.8), BN); }
    }
    // ================================================================ barricades: ladders and a bag parapet at the parapet gaps; the sap's name over its mouth
    for (const w of map.windows) {
      const ix = w.x - w.nx, iz = w.z - w.nz, fl = Math.max(floorAt(cc(ix), cc(iz)), 0), fx = cc(w.x) - w.nx * (CELL / 2), fz = cc(w.z) - w.nz * (CELL / 2);
      if (!hi) continue;
      const side = hash(w.x, w.z) % 2 ? 1 : -1, sx = -w.nz * side, sz = w.nx * side;   // along the wall
      pp('trench_ladder', fx + sx * 1.35 - w.nx * 0.42, fl, fz + sz * 1.35 - w.nz * 0.42, Math.atan2(-w.nx, -w.nz));
    }
    // lean-tos on the parados of the fire bays: a corrugated sheet on two posts over a bench, where there is no barricade across
    for (const bx of (TR.bays || [])) { const bz = map.zoneRects ? map.zoneRects[ZN.FT][1] : 8;   // the bays' first row
      const x = bx + 1, z = bz + 1; if (!walk(ch(x, z)) || walk(ch(x, z + 1))) continue;
      if (hash(bx, 3) % 3) continue;
      pp('trench_tin', cc(x) + 0.2, 0, (z + 1) * CELL - 0.02, Math.PI);
    }
    // ================================================================ the chapel: fieldstone walls standing to different heights, the doorways, a few charred rafters, rubble
    if (CP) {
      const X0 = CP.x0 * CELL, X1 = (CP.x1 + 1) * CELL, Z0 = CP.z0 * CELL, Z1 = (CP.z1 + 1) * CELL;
      for (let z = CP.z0; z <= CP.z1; z++) for (let x = CP.x0; x <= CP.x1; x++) {
        const k = k_(x, z), c = ch(x, z); if (walk(c)) { if (gapSet.has(k) && hi) { const alongX = z === CP.z0 || z === CP.z1; boxR(MAT.stone, cc(x), 2.4, cc(z), alongX ? 0.9 : 2.2, 0.4, alongX ? 2.2 : 0.9, 0); } continue; }
        const x0 = x * CELL, z0 = z * CELL, corner = (x === CP.x0 || x === CP.x1) && (z === CP.z0 || z === CP.z1), gable = (x === CP.x0 || x === CP.x1);
        const h = corner ? CHAPEL_H + 0.3 : gable ? CHAPEL_H + 0.8 : 2.4 + (hash(x, z) % 5) * 0.5;
        box((hash(x, z) % 3) ? MAT.stone : MAT.stoneDark, x0, 0, z0, x0 + CELL, h, z0 + CELL); lowTop.set(k, h); box(MAT.stoneDark, x0 - 0.05, 0, z0 - 0.05, x0 + CELL + 0.05, 0.5, z0 + CELL + 0.05, BN);
        box(MAT.stoneDark, x0 - 0.06, h, z0 - 0.06, x0 + CELL + 0.06, h + 0.12 + (hash(x + 1, z) % 3) * 0.06, z0 + CELL + 0.06, BN);
        if (!gable && !corner && h > 3.6 && hi) { const alongX = z === CP.z0 || z === CP.z1;   // a lancet window hole, dark
          put(PLANE, MAT.black, alongX ? x0 + 1 : (x === CP.x0 ? x0 + CELL + 0.012 : x0 - 0.012), 2.6, alongX ? (z === CP.z0 ? z0 + CELL + 0.012 : z0 - 0.012) : z0 + 1, 0, alongX ? (z === CP.z0 ? 0 : Math.PI) : (x === CP.x0 ? HPI : -HPI), 0, 0.5, 1.4, 1, BN, null); }
      }
      if (hi) { for (let x = X0 + 3; x < X1 - 1; x += 3.2) if (chance(0.6)) beam(MAT.black, x, CHAPEL_H + 0.2, Z0 + 0.6, x + R(-0.4, 0.4), CHAPEL_H + 0.9, (Z0 + Z1) / 2, 0.14); }   // rafters, half gone
      box(MAT.stone, X0 + 0.7, CHAPEL_H + 1.1, (Z0 + Z1) / 2 - 0.09, X0 + 1.3, CHAPEL_H + 2.4, (Z0 + Z1) / 2 + 0.09); box(MAT.stone, X0 + 0.6, CHAPEL_H + 1.9, (Z0 + Z1) / 2 - 0.09, X0 + 1.4, CHAPEL_H + 2.08, (Z0 + Z1) / 2 + 0.09);   // the gable cross
      for (let i = 0; i < 5; i++) put(CONE, MAT.stoneDark, R(X0 + 2.6, X1 - 2.6), 0.25, R(Z0 + 2.6, Z1 - 2.6), 0, R(0, TAU), 0, R(0.5, 0.9), 0.5, R(0.5, 0.9));   // rubble
    }
    // ================================================================ the dugouts: beams across, boards, earth and tin on top, a sandbag course, a gas curtain at the door
    (map.roofRects || []).forEach((r) => {
      const X0 = r.x0 * CELL - 0.3, X1 = (r.x1 + 1) * CELL + 0.3, Z0 = r.z0 * CELL - 0.3, Z1 = (r.z1 + 1) * CELL + 0.3, y = HUT_H;
      const alongX = X1 - X0 >= Z1 - Z0;
      for (let t = (alongX ? X0 : Z0) + 0.5; t < (alongX ? X1 : Z1) - 0.2; t += 1.1) { if (alongX) box(MAT.woodDark, t - 0.09, y - 0.24, Z0, t + 0.09, y - 0.02, Z1); else box(MAT.woodDark, X0, y - 0.24, t - 0.09, X1, y - 0.02, t + 0.09); }
      box(MAT.plankDark, X0, y - 0.02, Z0, X1, y + 0.04, Z1);
      box(MAT.mud2, X0 - 0.2, y + 0.04, Z0 - 0.2, X1 + 0.2, y + 0.42, Z1 + 0.2);
      if (hi) for (let t = X0 + 0.6; t < X1 - 0.6; t += 1.0) boxR(MAT.tin, t, y + 0.46, (Z0 + Z1) / 2, 0.98, 0.03, (Z1 - Z0) * 0.7, 0, BN, (hash(t * 10, 1) % 5 - 2) * 0.02);
      for (let t = X0; t < X1; t += 0.5) for (const zz of [Z0 - 0.1, Z1 + 0.1]) boxR(MAT.sandbag, t + 0.25, y + 0.52, zz, 0.46, 0.2, 0.3, 0, BN);
      for (let t = Z0; t < Z1; t += 0.5) for (const xx of [X0 - 0.1, X1 + 0.1]) boxR(MAT.sandbag, xx, y + 0.52, t + 0.25, 0.3, 0.2, 0.46, 0, BN);
      // posts inside the corners, a shelf of candles' worth of light later from the lamp
      for (const [px, pz] of [[X0 + 0.45, Z0 + 0.45], [X1 - 0.45, Z0 + 0.45], [X0 + 0.45, Z1 - 0.45], [X1 - 0.45, Z1 - 0.45]]) box(MAT.woodDark, px - 0.08, 0, pz - 0.08, px + 0.08, y - 0.2, pz + 0.08);
    });
    for (const [gx, gz] of (map.gaps || [])) { if (inChapelRing(gx, gz)) continue;   // the dugout doorways (and the sap's mouth): a lintel, a gas curtain tied back
      let dx = 0, dz = 0; for (const [ax, az] of D4) if (roofC(gx + ax, gz + az)) { dx = ax; dz = az; }
      if (!dx && !dz) { if (TR.sap && gx * CELL >= TR.sap.x0 && gx * CELL <= TR.sap.x1) { box(MAT.woodDark, gx * CELL - 0.05, GROUND - 0.3, gz * CELL + 0.9, gx * CELL + CELL + 0.05, GROUND - 0.08, gz * CELL + 1.1); signs.push({ text: 'DEAD MULE SAP', x: gx * CELL + CELL, y: GROUND - 0.55, z: (gz + 1) * CELL + 0.03, ry: 0, w: 2.2, h: 0.36, once: 'sap' }); } continue; }
      const x0 = gx * CELL, z0 = gz * CELL;
      if (dx) { box(MAT.woodDark, x0, GROUND - 0.3, z0 - 0.05, x0 + CELL, GROUND - 0.06, z0 + CELL + 0.05); if (hi) boxR(MAT.canvas, x0 + 1, (GROUND - 0.3) / 2, z0 + (dx > 0 ? 0.2 : CELL - 0.2), 0.25, GROUND - 0.3, 0.14, 0, BN, 0, 0.05); }
      else { box(MAT.woodDark, x0 - 0.05, GROUND - 0.3, z0, x0 + CELL + 0.05, GROUND - 0.06, z0 + CELL); if (hi) boxR(MAT.canvas, x0 + (dz > 0 ? 0.2 : CELL - 0.2), (GROUND - 0.3) / 2, z0 + 1, 0.14, GROUND - 0.3, 0.25, 0, BN, 0.05, 0); }
    }
    // ================================================================ things on the floors
    const braziers = [];
    for (const ob of map.objects) {
      const X0 = ob.x0 * CELL, Z0 = ob.z0 * CELL, X1 = (ob.x0 + ob.w) * CELL, Z1 = (ob.z0 + ob.h) * CELL, cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2, t = ob.type, y0 = Math.max(0, E[k_(ob.x0, ob.z0)] || 0);
      put(PLANE, mudOf(ob.x0, ob.z0), cx, y0 + 0.012, cz, -HPI, 0, 0, X1 - X0, Z1 - Z0, 1, BN);
      if (t === 'brazier') { pp('trench_brazier', cx, y0, cz, R(0, TAU)); braziers.push([cx, y0, cz]); if (!HAS('trench_brazier')) { put(CYL, MAT.rustDark, cx, y0 + 0.3, cz, 0, 0, 0, 0.28, 0.6, 0.28); put(CYL, MAT.fire, cx, y0 + 0.62, cz, 0, 0, 0, 0.24, 0.06, 0.24, BN); } }
      else if (t === 'mortar') { pp('trench_mortar', cx, y0, cz, R(-0.4, 0.4)); if (hi) boxR(MAT.sandbag, cx - 0.7, y0 + 0.12, cz, 0.5, 0.24, 1.0, 0, BN); }
      else if (t === 'graves') { for (let i = 0; i < 3; i++) pp('trench_cross', X0 + 0.6 + i * 1.2 + R(-0.1, 0.1), y0, Z0 + 0.9 + (i % 2) * 1.6, R(-0.25, 0.25)); if (hi) pp('trench_cross', X1 - 0.6, y0, Z1 - 0.6, R(-0.25, 0.25)); }
      else if (t === 'crater') { put(DISH, MAT.crater, cx, y0 + 0.02 - 0.5, cz, 0, 0, 0, (X1 - X0) / 2 - 0.05, 1.0, (Z1 - Z0) / 2 - 0.05, B, 'w'); put(TORUS, MAT.mud3, cx, y0 + 0.08, cz, HPI, 0, 0, (X1 - X0) / 2 - 0.1, (Z1 - Z0) / 2 - 0.1, 0.9, BN); put(PLANE, MAT.water, cx, y0 - 0.22, cz, -HPI, 0, 0, (X1 - X0) * 0.55, (Z1 - Z0) * 0.55, 1, BN, null); }
      else if (t === 'cart') {   // a broken limber: wheels, a shaft, the bed tipped
        for (const wx of [X0 + 0.7, X1 - 0.7]) { put(TORUS, MAT.woodDark, wx, y0 + 0.62, cz + 0.5, 0, HPI, 0, 0.6, 0.6, 0.8); for (let i = 0; i < 6; i++) beam(MAT.wood, wx, y0 + 0.62, cz + 0.5, wx, y0 + 0.62 + Math.cos(i / 6 * TAU) * 0.55, cz + 0.5 + Math.sin(i / 6 * TAU) * 0.55, 0.04, BN); }
        boxR(MAT.woodDark, cx, y0 + 0.75, cz + 0.2, X1 - X0 - 1.0, 0.12, 1.0, 0, B, -0.25); beam(MAT.wood, X1 - 0.2, y0 + 0.7, cz, X1 + 1.2, y0 + 0.1, cz - 0.3, 0.07);
      } else if (t === 'altar') { box(MAT.stone, X0 + 0.15, y0, Z0 + 0.15, X1 - 0.15, y0 + 0.95, Z1 - 0.15); box(MAT.canvas, X0 + 0.1, y0 + 0.95, Z0 + 0.1, X1 - 0.1, y0 + 1.0, Z1 - 0.1, BN); box(MAT.stone, cx - 0.05, y0 + 1.0, cz - 0.05, cx + 0.05, y0 + 1.55, cz + 0.05, BN); box(MAT.stone, cx - 0.2, y0 + 1.32, cz - 0.05, cx + 0.2, y0 + 1.42, cz + 0.05, BN); }
      else if (t === 'pump') { put(CYL, MAT.iron, cx, y0 + 0.5, cz, 0, 0, 0, 0.11, 1.0, 0.11); beam(MAT.iron, cx, y0 + 0.95, cz, cx + 0.6, y0 + 1.3, cz, 0.04); put(CYL8, MAT.iron, cx + 0.22, y0 + 0.75, cz, 0, 0, HPI, 0.04, 0.3, 0.04); put(PLANE, MAT.water, cx, y0 + 0.02, cz + 0.4, -HPI, 0, 0, 0.9, 0.9, 1, BN, null); }
      else if (t === 'watertank') { put(CYL, MAT.rustDark, cx, y0 + 1.05, cz, 0, 0, HPI, 0.45, 1.6, 0.45); for (const s of [-0.5, 0.5]) { box(MAT.woodDark, cx + s - 0.06, y0, cz - 0.4, cx + s + 0.06, y0 + 0.65, cz + 0.4); } put(CYL8, MAT.steel, cx - 0.8, y0 + 0.75, cz, 0, 0, HPI, 0.03, 0.3, 0.03, BN); }
    }
    // ================================================================ no-man's land: craters, wire on pickets, dead trees, chevaux de frise, a tank hull, a road behind the line
    { const x0 = bx0, x1 = bx1, z0 = bz0, z1 = bz1, y = GROUND;
      const crater = (x, z, r) => { put(DISH, MAT.crater, x, y + 0.02 - r * 0.38, z, 0, 0, 0, r, r * 0.76, r); put(TORUS, MAT.mud3, x, y + 0.06, z, HPI, 0, 0, r, r, r * 0.9, BN); };
      for (let i = 0; i < 26; i++) crater(R(x0 - 30, x1 + 30), R(z0 - 46, z0 - 3), R(1.2, 3.4));
      for (let i = 0; i < 10; i++) crater(R(x0 - 30, x1 + 30), R(z1 + 3, z1 + 30), R(1.0, 2.4));
      for (let i = 0; i < 8; i++) { crater(R(x0 - 30, x0 - 3), R(z0, z1), R(1.2, 2.6)); crater(R(x1 + 3, x1 + 30), R(z0, z1), R(1.2, 2.6)); }
      // three belts of wire out in front, the posts leaning, gaps blown in them
      if (hi) for (const d of (high ? [5, 8.5, 12] : [6, 11])) { const zz = z0 - d; let last = null;
        for (let x = x0 - 26; x < x1 + 26; x += 2.0) { if (chance(0.12)) { last = null; continue; }
          pp('trench_picket', x, y, zz + R(-0.3, 0.3), R(0, TAU), 1, R(0.85, 1.05));
          if (last != null) for (const wy of (high ? [0.35, 0.75, 1.1] : [0.4, 0.95])) pp('trench_wire', x - 1.0, y + wy + R(-0.05, 0.05), zz, R(-0.04, 0.04), 1);
          last = x; } }
      if (hi) for (let i = 0; i < 7; i++) pp('trench_cheval', R(x0 - 10, x1 + 10), y, z0 - R(14, 20), R(-0.3, 0.3));
      // the dead wood: shattered trunks in front and behind, a line of them along the road
      for (let i = 0; i < 16; i++) pp(chance(0.5) ? 'trench_tree' : 'trench_tree2', R(x0 - 40, x1 + 40), y - 0.05, z0 - R(16, 50), R(0, TAU), R(0.8, 1.4));
      for (let i = 0; i < 10; i++) pp(chance(0.5) ? 'trench_tree' : 'trench_tree2', R(x0 - 40, x1 + 40), y - 0.05, z1 + R(8, 30), R(0, TAU), R(0.8, 1.3));
      for (let i = 0; i < 6; i++) { pp('trench_tree2', x0 - R(6, 28), y - 0.05, R(z0, z1), R(0, TAU), R(0.8, 1.2)); pp('trench_tree', x1 + R(6, 28), y - 0.05, R(z0, z1), R(0, TAU), R(0.8, 1.2)); }
      // a tank hull ditched nose-down in a crater out in front: two track frames, the hull between, a sponson
      { const tx = (x0 + x1) / 2 + 9, tz = z0 - 24, ry = 0.5, rx = 0.14;
        for (const s of [-1.45, 1.45]) (B).add(BOX, MAT.rustDark, M4(tx + Math.cos(ry) * s, y + 1.1, tz - Math.sin(ry) * s, rx, ry, 0, 8.0, 2.4, 0.7), 'w');
        B.add(BOX, MAT.rust, M4(tx, y + 1.0, tz, rx, ry, 0, 6.4, 1.5, 2.2), 'w'); B.add(BOX, MAT.rustDark, M4(tx, y + 1.9, tz, rx, ry, 0, 2.4, 0.5, 1.4), 'w');
        B.add(CYL8, MAT.iron, M4(tx + Math.cos(ry) * 1.2, y + 1.5, tz - Math.sin(ry) * 1.2, 0, ry, HPI, 0.09, 1.8, 0.09), 'w');
        crater(tx + 2.5, tz, 4.2); }
      // behind the support line: a sunken road with a ruined farmhouse end wall and a wagon
      box(MAT.mud2, x0 - 40, y - 0.02, z1 + 9, x1 + 40, y + 0.02, z1 + 13, BN);
      { const hx = (x0 + x1) / 2 - 14, hz = z1 + 22; box(MAT.stone, hx - 4, y, hz - 0.3, hx + 4, y + 4.2, hz + 0.3); box(MAT.stone, hx - 4, y, hz - 5, hx - 3.5, y + 2.6, hz); box(MAT.stone, hx + 3.4, y, hz - 5, hx + 4, y + 1.6, hz);
        for (let i = 0; i < 7; i++) beam(MAT.black, hx - 3.5 + i, y + 4.0, hz - 0.1, hx - 3.5 + i + R(-0.3, 0.3), y + 1.8, hz - 4.6, 0.12); }
    }
    // ================================================================ painted boards: where the trenches meet
    const nm = TR.names || {};
    for (const d of map.doors) { const [[ax, az], [bx2, bz2]] = d.cells, toN = nm[d.zone], fromN = nm[d.from]; if (!toN) continue;
      const alongX = d.axis === 'x';   // the door's cells run along x; the wall beside them is at ax-1 / bx2+1
      const wx = Math.min(ax, bx2) - 1, wz = az, sideFrom = [d.from], fz = zoneAt(wx, wz + 1) === d.from ? 1 : zoneAt(wx, wz - 1) === d.from ? -1 : 0;
      if (!alongX || !fz) continue;
      signs.push({ text: toN + (fz > 0 ? '  ↑' : '  ↓'), x: cc(wx), y: 1.45, z: cc(wz) + fz * (CELL / 2 + 0.03), ry: fz > 0 ? 0 : Math.PI, w: 1.8, h: 0.3 });
      void sideFrom; void fromN;
    }
    (map.roofRects || []).forEach((r) => { if (!r.name) return; const X = (r.x0 + r.x1 + 1) * CELL / 2; signs.push({ text: r.name.toUpperCase(), x: X, y: HUT_H + 0.95, z: r.z0 * CELL - 0.34, ry: 0, w: 2.6, h: 0.36 }); });
    const seenOnce = new Set();
    for (const s of signs) {
      if (s.once) { if (seenOnce.has(s.once)) continue; seenOnce.add(s.once); }
      const c = document.createElement('canvas'); c.width = 512; c.height = Math.max(48, Math.round(512 * s.h / s.w)); const x = c.getContext('2d');
      x.fillStyle = '#4a3c2c'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#5a4a38'; for (let i = 0; i < 9; i++) x.fillRect(0, i * c.height / 9 + 2, c.width, 1);
      x.font = `bold ${Math.round(c.height * 0.62)}px "Special Elite", monospace`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = 'rgba(226,214,186,.9)'; x.fillText(s.text, c.width / 2, c.height / 2 + 2);
      x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(0,0,0,${0.2 + Math.random() * 0.5})`; x.fillRect(Math.random() * c.width, Math.random() * c.height, 1 + Math.random() * 4, 1 + Math.random() * 3); }
      const t = track(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
      const m = track(new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 }));
      const mesh = new THREE.Mesh(PLANE, m); mesh.position.set(s.x, s.y, s.z); mesh.rotation.y = s.ry; mesh.scale.set(s.w, s.h, 1); mesh.renderOrder = 2; root.add(mesh);
      const bk = new THREE.Mesh(BOX, MAT.plankDark); bk.position.set(s.x - Math.sin(s.ry) * 0.02, s.y, s.z - Math.cos(s.ry) * 0.02); bk.rotation.y = s.ry; bk.scale.set(s.w + 0.08, s.h + 0.08, 0.03); root.add(bk);
    }
    // ================================================================ lamps: hurricane lanterns hung on the revetment stakes (and from a roof beam in the dugouts); the braziers' glow
    const bulbs = [];
    { const bulbG = track(new THREE.SphereGeometry(0.06, 10, 8)), bulbMat = track(new THREE.MeshStandardMaterial({ color: 0x332a20, emissive: 0xffd09a, emissiveIntensity: 5, roughness: 0.25 }));
      let shadowBudget = 2;
      map.lightSpots.forEach((s, i) => {
        const zn = s.zone, fx = cc(s.x) + s.wdx * (CELL / 2), fz = cc(s.z) + s.wdz * (CELL / 2), ix = -s.wdx, iz = -s.wdz, fl = Math.max(0, floorAt(cc(s.x), cc(s.z)));
        const inside = roofC(s.x, s.z), ry = Math.atan2(ix, iz);
        let bx, by, bz;
        if (inside) { bx = cc(s.x); bz = cc(s.z); by = fl + HUT_H - 0.62; put(CYL8, MAT.black, bx, by + 0.25, bz, 0, 0, 0, 0.01, 0.5, 0.01, BN); pp('trench_lantern', bx, by - 1.66, bz + 0.02, 0); }
        else { pp('trench_lantern', fx + ix * 0.16, fl + 0.05, fz + iz * 0.16, ry); bx = fx + ix * 0.18; bz = fz + iz * 0.18; by = fl + 1.78; }
        if (!HAS('trench_lantern')) { const bm = new THREE.Mesh(bulbG, bulbMat); bm.position.set(bx, by, bz); root.add(bm); }
        const bm = new THREE.Mesh(bulbG, bulbMat.clone()); track(bm.material); bm.position.set(bx, by, bz); bm.scale.setScalar(0.6); bm.visible = !HAS('trench_lantern'); root.add(bm);
        const firstIn = !map.lightSpots.slice(0, i).some(o => o.zone === zn), always = inside ? firstIn : i % 2 === 0;
        const light = new THREE.SpotLight(0xffb062, inside ? 9.0 : 7.0, inside ? 14 : 20, inside ? 1.3 : 1.15, 0.6, 1.0); light.position.set(bx, by, bz); light.target.position.set(inside ? bx : fx + ix * 3.2, fl, inside ? bz + 0.01 : fz + iz * 3.2); root.add(light); root.add(light.target);
        if (shadowBudget > 0 && always && !inside) { shadowBudget--; light.castShadow = ctx.quality === 'high'; light.shadow.mapSize.set(512, 512); light.shadow.bias = -0.0015; light.shadow.normalBias = 0.02; light.shadow.camera.near = 0.3; light.shadow.camera.far = 22; light.userData.shadowOK = true; }
        bulbs.push({ light, bulbMesh: bm, flicker: !always && rng() < 0.4, power: !always }); stats.bulbs++;
      });
      for (const [cx, cy, cz] of braziers) { const L = new THREE.SpotLight(0xff7a2a, 7.5, 12, 1.35, 0.7, 1.0); L.position.set(cx, cy + 1.9, cz); L.target.position.set(cx, cy, cz + 0.01); root.add(L); root.add(L.target);
        const bm = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 3), MAT.fire); track(bm.geometry); bm.position.copy(L.position); bm.visible = false; root.add(bm); bulbs.push({ light: L, bulbMesh: bm, flicker: true, power: false }); stats.bulbs++; }
    }
    // ================================================================ build the batches
    const mB = B.build(true, true), mN = BN.build(false, true), mP = PB.build(true);
    for (const m of [mB, mN]) if (m) { track(m.geometry); root.add(m); }
    if (mP) { root.add(mP); track(mP.geometry); }
    for (const g of geos) g.dispose();
    stats.tris = (mB ? mB.geometry.attributes.position.count / 3 : 0) + (mN ? mN.geometry.attributes.position.count / 3 : 0) + (mP && mP.geometry.attributes.position ? mP.geometry.attributes.position.count / 3 : 0);
    stats.ms = +(performance.now() - T0).toFixed(1);
    stats.props = PB.byKey; stats.propTris = PB.tris;
    const powerMats = [{ m: MAT.lamp, off: 0.05, on: 2.5 }];
    return {
      root, stats, wallTop: WALL_TOP, lowTop, bulbs, powerMats, rail: null, noRain: false,
      setPower(on) { for (const p of powerMats) p.m.emissiveIntensity = on ? p.on : p.off; },
      setQuality() {},
      dispose() { if (root.parent) root.parent.remove(root); for (const o of own) if (o && o.dispose) o.dispose(); own.length = 0; },
    };
  }
  return { build };
})();

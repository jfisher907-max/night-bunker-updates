// Night Bunker v6.43 Eisenkrone Foundry: FoundryPlan + FoundryDress (loaded by a script tag ahead of the game block)
// ======================= v6.43 EISENKRONE FOUNDRY (a new PlanMaps map: three storeys of verticality) =======================
// An ironworks at night, built to walk up and down: the charging yard is ringed by a gallery on three sides with a grand stair
// in the middle; the casting hall has a crane gallery and a raised moulding floor; the pattern shop has its mezzanine; the
// furnace house climbs from the tapping floor round the furnace to the casting platform and the charging deck at the top,
// where the power is; the ore yard's trestle climbs two flights to the deck's back door. One ring round the works (yard,
// casting hall, furnace house up and over, ore yard, pattern shop) and two loops along the galleries. Levels 0, 3.2, 6.4 m.
const FoundryPlan = (() => {
  'use strict';
  function foundry(seed, opts) {
    const { kit, finish } = PlanMaps;
    const st = kit(60, 60, 7, 7);
    st.rect(-1, -1, 46, 46, '#');
    const YD = st.zone('Charging Yard', [[14, 25, 31, 45]], { floor: 'yard', open: true, lamps: 6 });     // 0 (start)
    const CH = st.zone('Casting Hall', [[0, 0, 12, 45]], { floor: 'sand', lamps: 8 });                   // 1
    const PS = st.zone('Pattern Shop', [[33, 24, 45, 45]], { floor: 'boards', lamps: 5 });               // 2
    const FH = st.zone('Furnace House', [[14, 0, 31, 23]], { floor: 'plate', lamps: 6 });                // 3 (the power, up top)
    const OB = st.zone('Ore Yard', [[33, 0, 45, 22]], { floor: 'ore', open: true, lamps: 4 });           // 4
    // the core shop: the casting hall's north end behind a wall with a wide opening
    st.rect(0, 11, 4, 11, '#'); st.rect(9, 11, 12, 11, '#'); for (let x = 5; x <= 8; x++) st.gaps.push([x, 11]);
    // the yard's street side is a low wall you can see the road over
    for (let x = 13; x <= 32; x++) st.fence.push([st.X(x), st.Z(46)]);
    // ---- heights: the yard gallery (north, west, east) and its three stairs
    st.elev(14, 25, 31, 27, 3.2); st.elev(14, 28, 15, 37, 3.2); st.elev(30, 28, 31, 37, 3.2);
    st.stair(14, 38, 15, 41, 4, 0, 0.8); st.stair(30, 38, 31, 41, 4, 0, 0.8);
    st.stair(22, 28, 23, 31, 4, 0, 0.8);                        // the grand stair up the middle of the yard
    // the casting hall: the crane gallery along its east wall (door D at the top), the moulding floor half a storey up
    st.elev(11, 22, 12, 36, 3.2); st.stair(11, 18, 12, 21, 3, 0, 0.8);
    st.elev(3, 26, 8, 33, 1.6); st.stair(5, 24, 6, 25, 3, 0, 0.8); st.stair(5, 34, 6, 35, 4, 0, 0.8);
    // the furnace house: the casting platform round the furnace (3.2), the charging deck along the north wall (6.4)
    st.elev(16, 6, 29, 16, 3.2); st.elev(18, 2, 27, 5, 3.2);
    st.stair(17, 17, 18, 20, 4, 0, 0.8); st.stair(27, 17, 28, 20, 4, 0, 0.8);
    st.elev(14, 0, 31, 1, 6.4); st.stair(16, 2, 17, 5, 4, 3.2, 0.8); st.stair(28, 2, 29, 5, 4, 3.2, 0.8);
    // the ore yard's trestle: up from the yard to the landing (3.2), on up to the high deck (6.4) and the furnace's back door
    st.elev(33, 0, 36, 1, 6.4); st.stair(37, 0, 40, 1, 2, 3.2, 0.8);
    st.elev(41, 0, 45, 1, 3.2); st.elev(37, 2, 45, 2, 3.2); st.stair(42, 3, 43, 6, 4, 0, 0.8);
    // the pattern shop's mezzanine over its offices
    st.elev(33, 24, 38, 35, 3.2); st.stair(35, 36, 36, 39, 4, 0, 0.8);
    // ---- doors
    st.door('A', 13, 43, 13, 44, YD, CH, 750, 'z');
    st.door('B', 32, 43, 32, 44, YD, PS, 750, 'z');
    st.door('D', 13, 31, 13, 32, YD, CH, 1000, 'z', 3.2); st.doors[st.doors.length - 1].loop = true;
    st.door('E', 32, 31, 32, 32, YD, PS, 1000, 'z', 3.2); st.doors[st.doors.length - 1].loop = true;
    st.door('F', 13, 14, 13, 15, CH, FH, 1000, 'z');
    st.door('G', 40, 23, 41, 23, PS, OB, 1000, 'x');
    st.door('H', 32, 0, 32, 1, OB, FH, 1250, 'z', 6.4); st.doors[st.doors.length - 1].loop = true;
    // ---- barricades
    for (const x of [17, 22, 27]) st.win(x, 46, 0, 1);
    for (const z of [4, 15, 22, 29, 37, 43]) st.win(-1, z, -1, 0);
    st.win(5, 46, 0, 1); st.win(10, 46, 0, 1); st.win(4, -1, 0, -1); st.win(10, -1, 0, -1);
    for (const z of [28, 35, 42]) st.win(46, z, 1, 0);
    st.win(38, 46, 0, 1); st.win(43, 46, 0, 1);
    for (const z of [8, 14, 19]) st.win(46, z, 1, 0);
    // ---- what stands on the floors
    st.obj('furnace', 20, 8, 6, 6, 'C', 16.0);
    st.obj('ladlecar', 18, 34, 2, 3, 'C', 2.4); st.obj('pigs', 26, 34, 2, 2, 'C', 1.2); st.obj('scrap', 28, 42, 2, 1, 'C', 1.3);
    st.obj('ladle', 5, 29, 2, 2, 'C', 3.4); st.obj('flask', 8, 16, 2, 2, 'C', 0.9); st.obj('flask', 8, 40, 2, 2, 'C', 0.9); st.obj('sandpile', 2, 19, 2, 2, 'C', 1.0);
    st.obj('cupola', 1, 2, 3, 3, 'C', 9.0); st.obj('coreoven', 9, 1, 3, 2, 'C', 2.4); st.obj('flask', 6, 6, 2, 1, 'C', 0.9);
    st.obj('patbench', 41, 28, 3, 1, 'C', 1.0); st.obj('patbench', 41, 33, 3, 1, 'C', 1.0); st.obj('lathe', 41, 40, 2, 1, 'C', 1.3); st.obj('patrack', 45, 25, 1, 3, 'C', 2.4);
    st.obj('orepile', 36, 8, 3, 3, 'C', 2.0); st.obj('orepile', 40, 14, 3, 3, 'C', 2.0); st.obj('skip', 37, 18, 2, 1, 'C', 1.8);
    // ---- fittings
    st.wb(0, 18, 0); st.wb(12, 27, 1); st.wb(19, 45, 2); st.wb(31, 26, 3); st.wb(40, 45, 4); st.wb(45, 31, 5); st.wb(14, 9, 6);
    st.perk(16, 45, 'revive'); st.perk(0, 40, 'jugg'); st.perk(45, 38, 'speed'); st.perk(31, 20, 'dtap'); st.perk(34, 45, 'bench');
    st.box(23, 25); st.box(0, 8); st.box(45, 44); st.box(14, 21); st.box(45, 4); st.box(33, 26);
    st.trap('A', 12, 41); st.trap('G', 43, 24);
    const power = { x: st.X(23), z: st.Z(0), zone: FH };
    const start = { x: st.X(23), z: st.Z(42) };
    const M = finish(st, seed, opts, { power, start, fog: 0.5, plan: 'foundry', theme: 'foundry' });
    M.noTrim = [FH];
    // pendants on the casting platform's corners, where no wall is near enough to hang a lamp
    for (const [x, z] of [[16, 6], [29, 16]]) M.lightSpots.push({ x: st.X(x), z: st.Z(z), zone: FH, wdx: 0, wdz: 0 });
    const C = (x, z) => [st.X(x), st.Z(z)];
    M.foundry = { zones: { YD, CH, PS, FH, OB }, furnace: { x0: st.X(20), z0: st.Z(8), w: 6, h: 6 }, stack: 22, halls: { [CH]: 10.5, [FH]: 12.6, [PS]: 8.2 } };
    return M;
  }
  PlanMaps.BUILD.foundry = foundry;
  return { foundry };
})();
// v6.43 FoundryDress: draws Eisenkrone Foundry (the PlanMaps 'foundry' plan). A brick ironworks at night: tall halls with
// steel-framed factory windows and tin roofs on trusses, steel galleries on I-beam columns with pipe railings, steel stairs
// with chequer-plate treads, the blast furnace through the furnace house roof with its bustle main and glowing tuyeres, an
// overhead crane in the casting hall, ore bunkers under the trestle, rails across the yard. Same contract as HallDress:
// { root, stats, wallTop, lowTop, bulbs, powerMats, rail, noRain, setPower, setQuality, dispose }. Lights: one SpotLight per
// map lightSpot (as HallDress), nothing added later; the furnace glows by emissive only.
const FoundryDress = (() => {
  'use strict';
  const TAU = Math.PI * 2, HPI = Math.PI / 2;
  const OPEN_H = 4.2, FENCE = 2.6, WALL_TOP = 12.8;
  function build(group, ctx) {
    const T0 = performance.now();
    const THREE = ctx.THREE, TP = ctx.TexPack, map = ctx.map, GW = ctx.GW, GH = ctx.GH, CELL = ctx.CELL, cc = ctx.cc, cellCh = ctx.cellCh, rng = ctx.rng || Math.random;
    const floorAt = ctx.floorAt, E = map.elev, RS = map.rise, RD = map.rdir, hi = ctx.quality !== 'low', high = ctx.quality === 'high';
    const R = (a, b) => a + rng() * (b - a), chance = p => rng() < p;
    const own = []; const track = o => { own.push(o); return o; };
    const root = new THREE.Group(); root.name = 'foundryDress'; group.add(root);
    const tm = (name, o) => { const m = track(TP.material(name, o)); m.envMapIntensity = 0.35; return m; }, col = h => new THREE.Color(h);
    const std = o => { const m = track(new THREE.MeshStandardMaterial(o)); m.envMapIntensity = 0.35; return m; };
    const MAT = {
      brick: tm('brick'), brickDark: tm('brick', { color: col(0xb09080) }), brickSoot: tm('brick', { color: col(0x7a6a62) }),
      concrete: tm('concrete', { color: col(0xc4c0b6) }), concreteDark: tm('concrete', { color: col(0x96928a) }), coping: tm('concrete', { color: col(0xb4aea2) }),
      plaster: tm('plaster', { color: col(0xb8c0ae) }), paint: tm('plaster', { color: col(0x8a9a86) }), limewash: tm('plaster', { color: col(0xc2c4b4) }),
      cobble: tm('cobble', { color: col(0x8e887e) }), gravel: tm('gravel', { color: col(0x8a8278) }), dirt: tm('dirt', { color: col(0x6a5a4a) }),
      sand: tm('dirt', { color: col(0x4a3e34) }), ore: tm('gravel', { color: col(0x6a4636) }), coke: tm('gravel', { color: col(0x2a2826) }),
      boards: tm('floorPlank', { color: col(0x8a7058) }), plank: tm('planks', { color: col(0x6a5a4a) }), wood: tm('wood'), woodDark: tm('wood', { color: col(0x4a3a2c) }),
      plate: tm('plate', { color: col(0x9a9894) }), plateDark: tm('plate', { color: col(0x77746f) }),
      tin: tm('tin', { color: col(0x7a766c), side: THREE.DoubleSide }), tinDark: tm('tin', { color: col(0x55524c), side: THREE.DoubleSide }),
      rust: tm('rust', { color: col(0xd8c8b8) }), rustDark: (m => { if (m.normalScale) m.normalScale.set(0.4, 0.4); return m; })(tm('rust', { color: col(0x8a7a6e) })),
      iron: tm('gunmetal', { color: col(0x3c3c3a), roughness: 1.3 }), steel: tm('gunmetal', { color: col(0x62645f), roughness: 1.0 }),
      green: tm('gunmetal', { color: col(0x46584a), roughness: 1.5, metalness: 0.3 }), grey: tm('gunmetal', { color: col(0x6a6e6a), roughness: 1.5, metalness: 0.3 }),
      yellow: tm('gunmetal', { color: col(0xa88a3a), roughness: 1.5, metalness: 0.2 }), black: std({ color: 0x0c0b0a, roughness: 0.95 }),
      glass: std({ color: 0x0b0e12, roughness: 0.15, metalness: 0.6 }), glassNight: std({ color: 0x141c26, roughness: 0.12, metalness: 0.5, emissive: 0x2a3a52, emissiveIntensity: 0.35 }),
      glassLit: std({ color: 0x14100a, roughness: 0.2, metalness: 0.4, emissive: 0xffb45a, emissiveIntensity: 0.04 }),
      fire: std({ color: 0x200800, emissive: 0xff6418, emissiveIntensity: 1.6 }), ember: std({ color: 0x180600, emissive: 0xff3a08, emissiveIntensity: 0.55 }),
      furnace: (m => { m.emissive = new THREE.Color(0x3a1406); m.emissiveIntensity = 0.22; return m; })(tm('rust', { color: col(0xc8b4a4) })),
      furnaceHot: (m => { m.emissive = new THREE.Color(0x7a2406); m.emissiveIntensity = 1.0; return m; })(tm('brick', { color: col(0x8a6a5a) })),
      enamel: std({ color: 0x2f4a3c, roughness: 0.35, metalness: 0.2 }), enamelIn: std({ color: 0xe8e2d0, roughness: 0.4 }),
    };
    const geos = []; const G = g => { geos.push(g); return g; };
    const BOX = G(new THREE.BoxGeometry(1, 1, 1)), CYL = G(new THREE.CylinderGeometry(1, 1, 1, 20)), CYL8 = G(new THREE.CylinderGeometry(1, 1, 1, 8)), PLANE = G(new THREE.PlaneGeometry(1, 1)),
      TORUS = G(new THREE.TorusGeometry(1, 0.08, 8, 32)), SPH = G(new THREE.SphereGeometry(1, 12, 8)), CONE = G(new THREE.CylinderGeometry(0.6, 1, 1, 20, 1, true)), CONEC = G(new THREE.ConeGeometry(1, 1, 12));
    const Batch = HallDress.Batch;
    const B = new Batch(THREE), BN = new Batch(THREE);
    const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ'), _s = new THREE.Vector3();
    const M4 = (x, y, z, rx, ry, rz, sx, sy, sz) => { _p.set(x, y, z); _e.set(rx || 0, ry || 0, rz || 0); _q.setFromEuler(_e); _s.set(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz); return _m.compose(_p, _q, _s); };
    const box = (mat, x0, y0, z0, x1, y1, z1, bt, uv) => { if (x1 - x0 < 1e-3 || y1 - y0 < 1e-3 || z1 - z0 < 1e-3) return; (bt || B).add(BOX, mat, M4((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, 0, 0, 0, x1 - x0, y1 - y0, z1 - z0), uv === undefined ? 'w' : uv); };
    const boxR = (mat, x, y, z, sx, sy, sz, ry, bt, rx, rz) => (bt || B).add(BOX, mat, M4(x, y, z, rx || 0, ry || 0, rz || 0, sx, sy, sz), 'w');
    const put = (geo, mat, x, y, z, rx, ry, rz, sx, sy, sz, bt, uv) => (bt || B).add(geo, mat, M4(x, y, z, rx, ry, rz, sx, sy, sz), uv === undefined ? 'w' : uv);
    // a beam between two points (square section s)
    const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
    const beam = (mat, x0, y0, z0, x1, y1, z1, s, bt, geo) => { _a.set(x1 - x0, y1 - y0, z1 - z0); const L = _a.length(); if (L < 1e-3) return; _a.divideScalar(L); _q.setFromUnitVectors(_up, _a); _p.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); _s.set(s, L, s); _m.compose(_p, _q, _s); (bt || B).add(geo || BOX, mat, _m, 'w'); };
    const PB = new PropKit.Batch(), HAS = k => PropKit.has(k);
    const pp = (key, x, y, z, ry, s) => HAS(key) && PB.add(key, M4(x, y, z, 0, ry || 0, 0, s || 1, s || 1, s || 1));
    const ch = (x, z) => cellCh(x, z), inG = (x, z) => x >= 0 && z >= 0 && x < GW && z < GH, k_ = (x, z) => z * GW + x;
    const zoneAt = (x, z) => inG(x, z) && map.zoneOf[z] ? map.zoneOf[z][x] : -1;
    const isDoorC = c => c >= 'A' && c <= 'H' && c !== 'C';
    const walk = c => c === '.' || c === 'C' || c === 'W' || isDoorC(c);
    const objCell = new Map(); for (const ob of map.objects) for (let z = ob.z0; z < ob.z0 + ob.h; z++) for (let x = ob.x0; x < ob.x0 + ob.w; x++) objCell.set(k_(x, z), ob);
    const winAt = new Map(); for (const w of map.windows) winAt.set(k_(w.x, w.z), w);
    const doorAt = new Map(); for (const d of map.doors) for (const [x, z] of d.cells) doorAt.set(k_(x, z), d);
    const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]], D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    const top = (x, z) => inG(x, z) ? E[k_(x, z)] + RS[k_(x, z)] : 0;
    const stats = { tris: 0, ms: 0, bulbs: 0 };
    const F = map.foundry || { zones: {}, halls: {} }, ZN = F.zones || {};
    const openZ = new Set(map.openZones || []), RC = map.roofCell, roofC = (x, z) => inG(x, z) && RC[k_(x, z)] === 1;
    const fence = new Set((map.fence || []).map(([x, z]) => k_(x, z))), isFence = (x, z) => fence.has(k_(x, z));
    const hallH = zn => (F.halls && F.halls[zn]) || (openZ.has(zn) ? 0 : 7.6);
    const lowTop = new Map(), signs = [];
    const indoorCell = (x, z) => roofC(x, z);

    // wall height: the tallest hall it bounds (the furnace house 12.6 m, the casting hall 10.5 m); a wall round only open ground 4.2 m
    const wallHt = (x, z) => { if (isFence(x, z)) return FENCE; let h = 0, any = false; for (const [dx, dz] of D8) { const c = ch(x + dx, z + dz); if (!walk(c)) continue; const zn = zoneAt(x + dx, z + dz); if (zn < 0) continue; any = true; h = Math.max(h, hallH(zn)); } return any ? Math.max(h, OPEN_H) : OPEN_H; };
    const WH = new Float32Array(GW * GH); for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) if (ch(x, z) !== '.' && ch(x, z) !== 'o') WH[k_(x, z)] = wallHt(x, z);

    // ================================================================ floors
    const FLOOR = { yard: MAT.cobble, sand: MAT.sand, boards: MAT.boards, plate: MAT.concrete, ore: MAT.gravel };
    for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) {
      const zn = zoneAt(x, z), c = ch(x, z); if (zn < 0 && !isDoorC(c) && c !== 'W') continue;
      const k = k_(x, z); if (RS[k]) continue;
      const h = E[k], x0 = x * CELL, z0 = z * CELL;
      let mat = FLOOR[(map.floors || [])[zn]] || MAT.concrete;
      if (h >= 3) mat = zn === ZN.PS ? MAT.boards : MAT.plate; else if (h > 0) mat = MAT.plank;
      else if (zn === ZN.CH && (x * 7 + z * 3) % 11 === 0) mat = MAT.dirt;
      put(PLANE, mat, x0 + 1, h + 0.012, z0 + 1, -HPI, 0, 0, CELL, CELL, 1, BN);
    }
    // rails across the yard and the ore yard (the ladle car's and the skip's), sleepers between
    const rails = [];
    { const Y = ZN.YD, O = ZN.OB; const zr = id => { let a = 1e9, b = -1, c = 1e9, d = -1; for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) if (zoneAt(x, z) === id && E[k_(x, z)] === 0 && !RS[k_(x, z)] && ch(x, z) === '.') { a = Math.min(a, x); b = Math.max(b, x); c = Math.min(c, z); d = Math.max(d, z); } return [a, c, b, d]; };
      for (const ob of map.objects) if (ob.type === 'ladlecar' || ob.type === 'skip') { const along = ob.type === 'skip' ? 'x' : 'z', [x0, z0, x1, z1] = zr(ob.type === 'skip' ? O : Y);
        if (along === 'z') rails.push({ x: (ob.x0 + ob.w / 2) * CELL, a: z0 * CELL + 0.2, b: (z1 + 1) * CELL - 0.2, axis: 'z' }); else rails.push({ z: (ob.z0 + ob.h / 2) * CELL, a: x0 * CELL + 0.2, b: (x1 + 1) * CELL - 0.2, axis: 'x' }); } }
    for (const r of rails) { const g = 0.72;
      for (const s of [-g, g]) { if (r.axis === 'z') { box(MAT.steel, r.x + s - 0.035, 0.012, r.a, r.x + s + 0.035, 0.09, r.b, BN); } else box(MAT.steel, r.a, 0.012, r.z + s - 0.035, r.b, 0.09, r.z + s + 0.035, BN); }
      for (let t = r.a + 0.3; t < r.b - 0.2; t += 0.75) { if (r.axis === 'z') box(MAT.woodDark, r.x - 1.0, 0.01, t - 0.11, r.x + 1.0, 0.05, t + 0.11, BN); else box(MAT.woodDark, t - 0.11, 0.01, r.z - 1.0, t + 0.11, 0.05, r.z + 1.0, BN); } }

    // ================================================================ raised floors: steel galleries on columns, pipe railings
    const railCell = new Uint8Array(GW * GH);
    const railing = (x, z, dx, dz, h, mat) => {   // a pipe railing along cell (x, z)'s edge toward (dx, dz): posts, a top and a knee rail, a toe plate
      const ex = x * CELL + 1 + dx, ez = z * CELL + 1 + dz, L = CELL, m = mat || MAT.green;
      for (let i = 0; i < 2; i++) { const t = (i + 0.25) / 2 * L - L / 2 + 0.25; const px = dx ? ex - dx * 0.08 : x * CELL + 1 + t, pz = dz ? ez - dz * 0.08 : z * CELL + 1 + t; put(CYL8, m, px, h + 0.53, pz, 0, 0, 0, 0.03, 1.06, 0.03); }
      for (const ry of [1.06, 0.55]) { if (dx) put(CYL8, m, ex - dx * 0.08, h + ry, z * CELL + 1, HPI, 0, 0, 0.026, L, 0.026); else put(CYL8, m, x * CELL + 1, h + ry, ez - dz * 0.08, 0, 0, HPI, 0.026, L, 0.026); }
      if (dx) box(MAT.steel, ex - dx * 0.08 - 0.005, h, z * CELL, ex - dx * 0.08 + 0.005, h + 0.12, z * CELL + CELL, BN); else box(MAT.steel, x * CELL, h, ez - dz * 0.08 - 0.005, x * CELL + CELL, h + 0.12, ez - dz * 0.08 + 0.005, BN);
    };
    for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) {
      const k = k_(x, z), h = E[k]; if (h <= 0 || RS[k] || !walk(ch(x, z)) || doorAt.has(k)) continue;
      const zn = zoneAt(x, z), isHigh = h >= 3, open = openZ.has(zn); if (isHigh) railCell[k] = 1;
      for (const [dx, dz] of D4) {
        const nx = x + dx, nz = z + dz, nc = ch(nx, nz); if (!walk(nc)) continue;
        const nk = k_(nx, nz), nh = RS[nk] ? Math.min(E[nk], E[nk] + RS[nk]) : E[nk]; if (h - nh < 0.3) continue;
        const ex = x * CELL + 1 + dx, ez = z * CELL + 1 + dz, drop = h - nh;
        const slab = (mat, ya, yb, inset, depth, bt) => { if (dx) { const f = ex - dx * inset; box(mat, dx > 0 ? f - depth : f, ya, z * CELL, dx > 0 ? f : f + depth, yb, z * CELL + CELL, bt); } else { const f = ez - dz * inset; box(mat, x * CELL, ya, dz > 0 ? f - depth : f, x * CELL + CELL, yb, dz > 0 ? f : f + depth, bt); } };
        const at = (t, inset) => dx ? [ex - dx * inset, z * CELL + t] : [x * CELL + t, ez - dz * inset];
        if (RS[nk]) { slab(MAT.steel, h - 0.3, h, 0, 0.12); continue; }   // the stair draws its own side
        // the deck's edge: a steel channel
        slab(MAT.steel, h - 0.32, h + 0.02, 0, 0.14);
        if (drop < 2.5) {   // the moulding floor (1.6 m): a concrete face, a yellow edge line
          slab(MAT.concreteDark, nh, h - 0.32, 0.02, 0.2);
          slab(MAT.yellow, h + 0.013, h + 0.017, 0.14, 0.12, BN);
          continue;
        }
        // under a high deck: what the grid holds solid. Outdoors a brick bunker wall with bricked-up arches and ore chutes;
        // indoors I-beam columns at the edge in front of a corrugated infill, X-braced every other bay
        if (open) {
          slab(MAT.brickDark, nh, h - 0.32, 0.02, 0.3);
          slab(MAT.coping, nh, nh + 0.45, 0, 0.1);
          if ((dx ? z : x) % 2 === 0) { const [px, pz] = at(1, -0.01), ry = Math.atan2(dx, dz);
            put(PLANE, MAT.black, px, nh + 1.25, pz, 0, ry, 0, 1.3, 2.1, 1, BN, null);
            for (let i = 0; i <= 8; i++) { const a = Math.PI * i / 8, ox = Math.cos(a) * 0.8, oy = 2.3 + Math.sin(a) * 0.38; const [qx, qz] = at(1 + ox, -0.03); boxR(MAT.brick, qx, nh + oy, qz, dx ? 0.1 : 0.3, 0.2, dz ? 0.1 : 0.3, 0); }
          } else if (h - nh > 3 && hi) {   // an ore chute: a steel hopper mouth with a gate
            const [px, pz] = at(1, -0.25), ry = Math.atan2(dx, dz);
            boxR(MAT.rust, px, h - 1.0, pz, dx ? 0.5 : 1.0, 0.9, dz ? 0.5 : 1.0, 0, B, dz ? -dz * 0.35 : 0, dx ? dx * 0.35 : 0);
            boxR(MAT.iron, px, h - 1.55, pz, dx ? 0.56 : 0.9, 0.08, dz ? 0.56 : 0.9, 0);
            put(PLANE, MAT.black, at(1, -0.02)[0], h - 1.8, at(1, -0.02)[1], 0, ry, 0, 0.7, 0.4, 1, BN, null);
          }
        } else {
          slab(MAT.tinDark, nh, h - 0.32, 0.22, 0.04);
          const [c0x, c0z] = at(0.12, -0.0), [c1x, c1z] = at(CELL - 0.12, 0);
          for (const [cx, cz] of [[c0x, c0z]]) { box(MAT.green, cx - 0.12, nh, cz - 0.12, cx + 0.12, h - 0.32, cz + 0.12); box(MAT.green, cx - 0.2, nh, cz - 0.2, cx + 0.2, nh + 0.04, cz + 0.2, BN); }
          if (((dx ? z : x) & 1) === 0 && hi) { const y0 = nh + 0.2, y1 = h - 0.45; const [ax, az] = at(0.25, 0.1), [bx, bz] = at(CELL - 0.25, 0.1); beam(MAT.green, ax, y0, az, bx, y1, bz, 0.07); beam(MAT.green, ax, y1, az, bx, y0, bz, 0.07); }
          if (hi) { const [kx, kz] = at(0.12, 0.05), [jx, jz] = at(0.12, 0.7); beam(MAT.green, kx, h - 1.1, kz, jx, h - 0.33, jz, 0.06, BN); }
          void c1x; void c1z;
        }
        if (isHigh) railing(x, z, dx, dz, h);
      }
      // the deck's underside seen from below is never visible (solid in the grid); a thin plate edge reads at the joins
    }
    // ================================================================ stairs: steel stairs with chequer treads, side plates, pipe handrails
    for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) {
      const k = k_(x, z); if (!RS[k]) continue;
      const d = RD[k], h0 = E[k], r = RS[k], steps = 5, x0 = x * CELL, z0 = z * CELL, zn = zoneAt(x, z), outdoors = openZ.has(zn), stepM = outdoors && h0 < 0.1 && zn === ZN.YD ? MAT.concrete : MAT.plateDark;
      for (let i = 0; i < steps; i++) {
        const hy = h0 + r * (i + 1) / steps, a = i / steps * CELL, b = (i + 1) / steps * CELL;
        if (d === 1) box(stepM, x0 + a, 0, z0, x0 + b + 0.02, hy, z0 + CELL); else if (d === 2) box(stepM, x0 + CELL - b - 0.02, 0, z0, x0 + CELL - a, hy, z0 + CELL);
        else if (d === 3) box(stepM, x0, 0, z0 + a, x0 + CELL, hy, z0 + b + 0.02); else box(stepM, x0, 0, z0 + CELL - b - 0.02, x0 + CELL, hy, z0 + CELL - a);
        const nose = d === 1 ? [x0 + b - 0.05, z0, x0 + b + 0.03, z0 + CELL] : d === 2 ? [x0 + CELL - b - 0.03, z0, x0 + CELL - b + 0.05, z0 + CELL] : d === 3 ? [x0, z0 + b - 0.05, x0 + CELL, z0 + b + 0.03] : [x0, z0 + CELL - b - 0.03, x0 + CELL, z0 + CELL - b + 0.05];
        box(stepM === MAT.concrete ? MAT.steel : MAT.yellow, nose[0], hy - 0.02, nose[1], nose[2], hy + 0.008, nose[3], BN);
      }
      const sides = d <= 2 ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
      for (const [sx, sz] of sides) {
        const nx = x + sx, nz = z + sz, nc = ch(nx, nz), nk = k_(nx, nz);
        const sideWall = !walk(nc), sameRun = walk(nc) && RS[nk] && RD[nk] === d;
        if (sameRun) continue;
        // the stringer: a steel side plate along the climb, from the floor to just over the treads
        const along = d <= 2, sl = Math.atan2(r, CELL) * (d === 1 || d === 3 ? 1 : -1);
        const ex = x0 + 1 + sx * 0.97, ez = z0 + 1 + sz * 0.97, mid = h0 + r / 2;
        boxR(MAT.green, ex, mid + 0.12, ez, along ? CELL * 1.02 : 0.05, 0.32, along ? 0.05 : CELL * 1.02, 0, B, along ? 0 : -sl, along ? sl : 0);
        if (sideWall) continue;
        if (Math.max(E[nk], 0) >= h0 + r - 0.3) continue;
        const hx = x0 + 1 + sx * 0.9, hz = z0 + 1 + sz * 0.9;
        put(CYL8, MAT.green, hx, mid + 1.0, hz, along ? 0 : HPI + sl, 0, along ? HPI + sl : 0, 0.028, CELL * 1.04, 0.028);
        put(CYL8, MAT.green, hx, mid + 0.52, hz, along ? 0 : HPI + sl, 0, along ? HPI + sl : 0, 0.024, CELL * 1.04, 0.024, BN);
        for (const t of [-0.5, 0.5]) { const hh = h0 + r * (0.5 + (d === 1 || d === 3 ? t : -t) / CELL); put(CYL8, MAT.green, hx + (along ? t : 0), hh + 0.52, hz + (along ? 0 : t), 0, 0, 0, 0.03, 1.04, 0.03, BN); }
      }
    }
    // ================================================================ walls: brick, a painted dado inside, factory windows high up
    const winGrid = (gx, gz, dx, dz, y0, y1, w, lit, inside) => {   // a steel-framed factory window: small panes in a grid, a concrete sill and head (inside: the night beyond)
      const ry = Math.atan2(dx, dz), hgt = y1 - y0, my = (y0 + y1) / 2;
      put(PLANE, inside ? MAT.glassNight : lit ? MAT.glassLit : MAT.glass, gx, my, gz, 0, ry, 0, w, hgt, 1, BN, null);
      const ax = dx ? 0 : 1, az = dx ? 1 : 0;
      boxR(MAT.coping, gx + dx * 0.05, y1 + 0.1, gz + dz * 0.05, dx ? 0.14 : w + 0.3, 0.2, dx ? w + 0.3 : 0.14, 0);
      boxR(MAT.coping, gx + dx * 0.06, y0 - 0.06, gz + dz * 0.06, dx ? 0.18 : w + 0.2, 0.1, dx ? w + 0.2 : 0.18, 0);
      if (!hi) return;
      const nc = Math.max(2, Math.round(w / 0.45)), nr = Math.max(2, Math.round(hgt / 0.45));
      for (let i = 1; i < nc; i++) { const o = -w / 2 + w * i / nc; boxR(MAT.iron, gx + ax * o + dx * 0.02, my, gz + az * o + dz * 0.02, dx ? 0.03 : 0.035, hgt, dx ? 0.035 : 0.03, 0, BN); }
      for (let j = 1; j < nr; j++) { const y = y0 + hgt * j / nr; boxR(MAT.iron, gx + dx * 0.02, y, gz + dz * 0.02, dx ? 0.03 : w, 0.035, dx ? w : 0.03, 0, BN); }
      if (chance(0.25)) { const o = R(-w / 2 + 0.3, w / 2 - 0.3), y = R(y0 + 0.3, y1 - 0.3); boxR(MAT.black, gx + ax * o + dx * 0.025, y, gz + az * o + dz * 0.025, dx ? 0.01 : 0.42, 0.42, dx ? 0.42 : 0.01, 0, BN); }   // a broken pane
    };
    for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) {
      const c = ch(x, z), k = k_(x, z);
      const isW = c === 'W', isD = doorAt.has(k);
      if (c !== '#' && !isW && !isD) continue; if (objCell.has(k)) continue;
      const x0 = x * CELL, z0 = z * CELL, Ht = WH[k], fnc = isFence(x, z);
      if (Ht < 6) lowTop.set(k, Ht);
      const wm = fnc ? MAT.brickDark : MAT.brick;
      if (isW || isD) {
        const w = winAt.get(k), y0 = isW ? floorAt(cc(x) - w.nx * 1.6, cc(z) - w.nz * 1.6) : E[k], open = isW ? 3.2 : 3.05;
        if (y0 > 0) box(wm, x0, 0, z0, x0 + CELL, y0, z0 + CELL);
        if (Ht > y0 + open) box(wm, x0, y0 + open, z0, x0 + CELL, Ht, z0 + CELL);
        box(MAT.steel, x0 - 0.02, y0 + open, z0 - 0.02, x0 + CELL + 0.02, y0 + open + 0.3, z0 + CELL + 0.02);   // a steel lintel
      } else box(wm, x0, 0, z0, x0 + CELL, Ht, z0 + CELL);
      box(MAT.coping, x0 - 0.05, Ht, z0 - 0.05, x0 + CELL + 0.05, Ht + 0.16, z0 + CELL + 0.05);
      if (fnc && hi && !isW) { const runX = ch(x + 1, z) !== 'o' || ch(x - 1, z) !== 'o';   // a works railing on the street wall
        for (let i = 0; i < 3; i++) { const t = (i + 0.5) / 3 * CELL, px = runX ? x0 + t : x0 + 1, pz = runX ? z0 + 1 : z0 + t; put(CYL8, MAT.iron, px, Ht + 0.5, pz, 0, 0, 0, 0.025, 1.0, 0.025, BN); }
        if (runX) box(MAT.iron, x0, Ht + 0.95, z0 + 0.97, x0 + CELL, Ht + 1.01, z0 + 1.03, BN); else box(MAT.iron, x0 + 0.97, Ht + 0.95, z0, x0 + 1.03, Ht + 1.01, z0 + CELL, BN); }
      if (isW || isD) continue;
      // faces toward the walkable cells: inside a hall a painted dado and a brick pier every 4th cell; on the yards a plinth and courses
      for (const [dx, dz] of D4) {
        const nx = x + dx, nz = z + dz; if (!walk(ch(nx, nz)) || zoneAt(nx, nz) < 0) continue;
        const fx = x0 + 1 + dx * 1.0, fz = z0 + 1 + dz * 1.0, fh = Math.max(top(nx, nz), 0), roofed = roofC(nx, nz), zn = zoneAt(nx, nz);
        const slab = (mat, ya, yb, out, bt) => { if (dx) box(mat, dx > 0 ? fx : fx - out, ya, z0, dx > 0 ? fx + out : fx, yb, z0 + CELL, bt); else box(mat, x0, ya, dz > 0 ? fz : fz - out, x0 + CELL, yb, dz > 0 ? fz + out : fz, bt); };
        const along = dx ? z : x;
        if (roofed) {
          slab(MAT.paint, fh, fh + 1.5, 0.025, BN); slab(MAT.steel, fh + 1.5, fh + 1.56, 0.035, BN); slab(MAT.limewash, fh + 1.56, fh + 3.0, 0.02, BN);
          if (along % 4 === 0) slab(MAT.brickDark, 0, Math.min(Ht, hallH(zn)) - 0.4, 0.18);   // a pier
          const hh = hallH(zn), wy0 = Math.max(fh + 3.0, hh * 0.45), wy1 = hh - 1.1;
          if (along % 4 === 2 && wy1 - wy0 > 1.4 && Ht >= wy1 + 0.3) { const back = ch(x - dx, z - dz); if (back === 'o' || back === '#' || walk(back)) winGrid(fx + dx * 0.012, fz + dz * 0.012, dx, dz, wy0, wy1, 2.6, false, true); }
        } else if (!fnc) {
          slab(MAT.concreteDark, fh, fh + 0.55, 0.06); if (Ht > 6) { slab(MAT.coping, 4.0, 4.2, 0.07); slab(MAT.coping, Ht - 1.6, Ht - 1.45, 0.07); }
          if (along % 4 === 2 && Ht > 7.5) winGrid(fx + dx * 0.012, fz + dz * 0.012, dx, dz, Math.max(fh + 3.2, 5.0), Ht - 2.0, 2.6, ((x + z * 2) % 3) === 0);
          if (along % 4 === 0 && Ht > 6) slab(MAT.brickDark, 0, Ht, 0.16);
        } else slab(MAT.concrete, 0, 0.45, 0.05);
      }
      // the outer face of the works: plinth, courses, high windows
      for (const [dx, dz] of D4) {
        if (ch(x + dx, z + dz) !== 'o') continue;
        const fx = x0 + 1 + dx, fz = z0 + 1 + dz, along = dx ? z : x;
        const slab = (mat, ya, yb, out) => { if (dx) box(mat, dx > 0 ? fx : fx - out, ya, z0, dx > 0 ? fx + out : fx, yb, z0 + CELL); else box(mat, x0, ya, dz > 0 ? fz : fz - out, x0 + CELL, yb, dz > 0 ? fz + out : fz); };
        slab(MAT.concreteDark, 0, 0.7, 0.08); if (!fnc && Ht > 6) slab(MAT.coping, 4.0, 4.2, 0.07);
        if (!fnc && Ht > 7.5 && along % 4 === 2) winGrid(fx + dx * 0.012, fz + dz * 0.012, dx, dz, 5.0, Ht - 2.0, 2.6, ((x + 2 * z) % 5) === 0);
        if (!fnc && along % 4 === 0) slab(MAT.brickDark, 0, Ht, 0.18);
      }
    }
    // ================================================================ roofs: steel trusses and a tin roof over each hall, a monitor lantern on the tallest
    (map.roofRects || []).forEach((r) => {
      const X0 = r.x0 * CELL, X1 = (r.x1 + 1) * CELL, Z0 = r.z0 * CELL, Z1 = (r.z1 + 1) * CELL, alongX = X1 - X0 > Z1 - Z0, hh = hallH(r.zone);
      const span0 = alongX ? Z0 : X0, span1 = alongX ? Z1 : X1, L0 = alongX ? X0 : Z0, L1 = alongX ? X1 : Z1, half = (span1 - span0) / 2, mid = (span0 + span1) / 2, rise = Math.min(3.2, half * 0.32);
      const P = (l, s, y) => alongX ? [l, y, s] : [s, y, l];
      // trusses every 4 m: bottom chord, two rafters, a king post, diagonals
      for (let t = L0 + 2; t < L1 - 0.5; t += 4) {
        const [ax, ay, az] = P(t, span0 + 0.2, hh - 0.6), [bx, by, bz] = P(t, span1 - 0.2, hh - 0.6), [kx, ky, kz] = P(t, mid, hh - 0.6 + rise);
        beam(MAT.iron, ax, ay, az, bx, by, bz, 0.14); beam(MAT.iron, ax, ay, az, kx, ky, kz, 0.16); beam(MAT.iron, bx, by, bz, kx, ky, kz, 0.16); beam(MAT.iron, kx, ay, kz, kx, ky, kz, 0.08);
        if (hi) for (const f of [0.25, 0.75]) { const [px, py, pz] = P(t, span0 + (span1 - span0) * f, hh - 0.6), [qx, qy, qz] = P(t, f < 0.5 ? span0 + (mid - span0) * 0.5 : mid + (span1 - mid) * 0.5, hh - 0.6 + rise * 0.5); beam(MAT.iron, px, py, pz, qx, qy, qz, 0.06, BN); beam(MAT.iron, px, py, pz, kx, ay + rise * 0.0, kz, 0.05, BN); }
      }
      // purlins and the tin skin on both slopes
      const slope = Math.atan2(rise, half), len = Math.hypot(half, rise) + 0.4;
      for (const s of [-1, 1]) {
        const cs = mid + s * half / 2, cy = hh - 0.45 + rise / 2, ll = L1 - L0 + 0.6, lm = (L0 + L1) / 2;
        if (alongX) boxR(MAT.tin, lm, cy, cs, ll, 0.05, len, 0, B, s * slope); else boxR(MAT.tin, cs, cy, lm, len, 0.05, ll, 0, B, 0, -s * slope);
        if (hi) for (let f = 0.2; f < 0.95; f += 0.25) { const ss = mid + s * half * (1 - f), yy = hh - 0.52 + rise * f; if (alongX) box(MAT.iron, L0, yy - 0.07, ss - 0.05, L1, yy, ss + 0.05, BN); else box(MAT.iron, ss - 0.05, yy - 0.07, L0, ss + 0.05, yy, L1, BN); }
      }
      // a monitor lantern along the ridge of the tall halls: glazed sides, its own small roof
      if (hh >= 10 && hi) { const lw = Math.min(3.2, half * 0.5), ly = hh - 0.4 + rise, lh = 1.2, ll = L1 - L0 - 4, lm = (L0 + L1) / 2;
        for (const s of [-1, 1]) { const [px, py, pz] = P(lm, mid + s * lw / 2, ly + lh / 2); put(PLANE, MAT.glassLit, px, py, pz, 0, alongX ? (s > 0 ? 0 : Math.PI) : (s > 0 ? HPI : -HPI), 0, ll, lh, 1, BN, null); put(PLANE, MAT.glass, px, py, pz, 0, alongX ? (s > 0 ? Math.PI : 0) : (s > 0 ? -HPI : HPI), 0, ll, lh, 1, BN, null); }
        const [rx, ry2, rz] = P(lm, mid, ly + lh + 0.1); boxR(MAT.tinDark, rx, ry2, rz, alongX ? ll + 0.6 : lw + 0.8, 0.08, alongX ? lw + 0.8 : ll + 0.6, 0); }
    });
    // ================================================================ the casting hall's travelling crane: rail girders on brackets along both long walls, a bridge, the crab, a hook
    { const ch1 = (map.roofRects || []).find(r => r.zone === ZN.CH && r.z1 - r.z0 > 10);
      if (ch1) { const X0 = ch1.x0 * CELL, X1 = (ch1.x1 + 1) * CELL, Z0 = ch1.z0 * CELL, Z1 = (ch1.z1 + 1) * CELL, y = hallH(ZN.CH) - 2.2;
        for (const x of [X0 + 0.35, X1 - 0.35]) { box(MAT.iron, x - 0.18, y - 0.6, Z0, x + 0.18, y, Z1); box(MAT.steel, x - 0.05, y, Z0, x + 0.05, y + 0.1, Z1, BN);
          for (let z = Z0 + 2; z < Z1; z += 4) beam(MAT.iron, x, y - 0.6, z, x + (x < (X0 + X1) / 2 ? -0.32 : 0.32), y - 1.6, z, 0.12, BN); }
        const bz = Z0 + (Z1 - Z0) * 0.62;
        for (const s of [-0.7, 0.7]) box(MAT.yellow, X0 + 0.3, y + 0.1, bz + s - 0.25, X1 - 0.3, y + 1.05, bz + s + 0.25);
        box(MAT.iron, X0 + 0.2, y + 0.1, bz - 1.2, X0 + 0.9, y + 1.0, bz + 1.2); box(MAT.iron, X1 - 0.9, y + 0.1, bz - 1.2, X1 - 0.2, y + 1.0, bz + 1.2);
        const cx = X0 + (X1 - X0) * 0.4; box(MAT.grey, cx - 1.0, y + 1.05, bz - 1.0, cx + 1.0, y + 1.9, bz + 1.0); put(CYL, MAT.iron, cx, y + 1.45, bz, HPI, 0, 0, 0.35, 1.8, 0.35);
        const hy = 4.8; for (const s of [-0.12, 0.12]) put(CYL8, MAT.black, cx + s, (y + hy) / 2 + 0.3, bz, 0, 0, 0, 0.015, y - hy + 0.6, 0.015, BN);
        box(MAT.yellow, cx - 0.3, hy - 0.2, bz - 0.2, cx + 0.3, hy + 0.35, bz + 0.2); put(TORUS, MAT.iron, cx, hy - 0.45, bz, 0, HPI, 0, 0.22, 0.22, 2.0);
      } }
    // ================================================================ things on the floors
    const fireMats = [];
    for (const ob of map.objects) {
      const X0 = ob.x0 * CELL, Z0 = ob.z0 * CELL, X1 = (ob.x0 + ob.w) * CELL, Z1 = (ob.z0 + ob.h) * CELL, cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2, along = (X1 - X0) >= (Z1 - Z0);
      const t = ob.type, y0 = Math.max(0, E[k_(ob.x0, ob.z0)] || 0);
      if (t === 'furnace') {
        // the blast furnace: a brick hearth on the tapping floor, the bosh and the riveted steel stack through the roof,
        // a ring of tuyeres glowing at the platform, the bustle main round them, the downcomer, the charging bell at the top
        const rr = (X1 - X0) / 2 - 0.3, stackTop = F.stack || 22;
        put(CYL, MAT.furnaceHot, cx, 1.8, cz, 0, 0, 0, rr, 3.6, rr);
        for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; box(MAT.iron, cx + Math.cos(a) * rr - 0.2, 0, cz + Math.sin(a) * rr - 0.2, cx + Math.cos(a) * rr + 0.2, 3.4, cz + Math.sin(a) * rr + 0.2); }
        put(CONE, MAT.furnace, cx, 3.6 + 1.1, cz, 0, 0, 0, rr * 0.98, 2.2, rr * 0.98);
        put(CYL, MAT.furnace, cx, (5.8 + stackTop) / 2, cz, 0, 0, 0, rr * 0.62, stackTop - 5.8, rr * 0.62);
        if (hi) for (let y = 7; y < stackTop; y += 2.2) put(TORUS, MAT.iron, cx, y, cz, HPI, 0, 0, rr * 0.63, rr * 0.63, 1.2);
        put(TORUS, MAT.rustDark, cx, 5.2, cz, HPI, 0, 0, rr + 0.5, rr + 0.5, 6.0);   // the bustle main
        for (let i = 0; i < 10; i++) { const a = (i + 0.5) / 10 * TAU, ux = Math.cos(a), uz = Math.sin(a);
          beam(MAT.iron, cx + ux * (rr + 0.5), 5.2, cz + uz * (rr + 0.5), cx + ux * (rr - 0.05), 4.1, cz + uz * (rr - 0.05), 0.16, B, CYL8);
          put(CYL8, MAT.iron, cx + ux * (rr + 0.05), 4.05, cz + uz * (rr + 0.05), HPI, -a + HPI, 0, 0.26, 0.14, 0.26); put(CYL8, MAT.fire, cx + ux * (rr + 0.13), 4.05, cz + uz * (rr + 0.13), HPI, -a + HPI, 0, 0.13, 0.02, 0.13, BN); }
        put(TORUS, MAT.ember, cx, 3.62, cz, HPI, 0, 0, rr + 0.02, rr + 0.02, 1.4, BN);   // the hearth jacket's seam, red hot
        // the tap hole and the runner: a glowing trough out across the platform's south edge
        put(PLANE, MAT.fire, cx, 3.25, Z1 + 0.9, -HPI, 0, 0, 0.36, 1.8, 1, BN, null); box(MAT.concreteDark, cx - 0.4, 3.2, Z1, cx + 0.4, 3.28, Z1 + 1.8, BN);
        fireMats.push(MAT.fire);
        // the top: the charging platform's bell and the gas uptakes
        put(CYL, MAT.iron, cx, stackTop + 0.5, cz, 0, 0, 0, rr * 0.7, 1.0, rr * 0.7);
        for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4, ux = Math.cos(a), uz = Math.sin(a); put(CYL, MAT.rust, cx + ux * rr * 0.45, stackTop + 3.0, cz + uz * rr * 0.45, 0, 0, 0, 0.35, 5, 0.35); }
        box(MAT.rust, cx - rr * 0.5, stackTop + 5.4, cz - 0.3, cx + rr * 0.5, stackTop + 6.0, cz + 0.3);
        // the downcomer to the dust catcher outside the north wall
        beam(MAT.rust, cx, stackTop + 5.7, cz, cx + 8, stackTop + 1, map.bounds.minZ * CELL - 3, 0.9, B, CYL);
        put(CYL, MAT.rustDark, cx + 8, (stackTop + 1) / 2, map.bounds.minZ * CELL - 3, 0, 0, 0, 2.2, stackTop + 1, 2.2);
      } else if (t === 'ladlecar') {   // a slag ladle on its rail car
        box(MAT.iron, X0 + 0.4, 0.35, Z0 + 0.3, X1 - 0.4, 0.75, Z1 - 0.3);
        for (const wz of [Z0 + 0.8, Z1 - 0.8]) for (const sx of [-0.72, 0.72]) put(CYL, MAT.iron, cx + sx, 0.4, wz, 0, 0, HPI, 0.38, 0.12, 0.38);
        put(CONE, MAT.rustDark, cx, 1.5, cz, Math.PI, 0, 0, 1.25, 1.5, 1.25); put(CYL, MAT.coke, cx, 2.23, cz, 0, 0, 0, 1.2, 0.04, 1.2, BN);
        put(TORUS, MAT.iron, cx, 2.25, cz, HPI, 0, 0, 1.25, 1.25, 1.6);
        for (const s of [-1, 1]) box(MAT.iron, cx + s * 1.3 - 0.06, 0.75, cz - 0.15, cx + s * 1.3 + 0.06, 2.0, cz + 0.15);
      } else if (t === 'pigs') {   // pig iron stacked in crossed courses on a pallet
        box(MAT.woodDark, X0 + 0.2, 0, Z0 + 0.2, X1 - 0.2, 0.14, Z1 - 0.2);
        for (let l = 0; l < 6; l++) for (let i = 0; i < 7; i++) { const o = -1.5 + i * 0.5 + R(-0.03, 0.03), y = 0.2 + l * 0.17; if (l % 2) box(MAT.rust, cx + o - 0.08, y, Z0 + 0.35, cx + o + 0.08, y + 0.15, Z1 - 0.35); else box(MAT.rust, X0 + 0.35, y, cz + o - 0.08, X1 - 0.35, y + 0.15, cz + o + 0.08); }
      } else if (t === 'scrap') {
        for (let i = 0; i < 14; i++) boxR(chance(0.5) ? MAT.rust : MAT.iron, R(X0 + 0.4, X1 - 0.4), R(0.1, 0.9), R(Z0 + 0.3, Z1 - 0.3), R(0.2, 1.4), R(0.05, 0.3), R(0.1, 0.6), R(0, TAU), B, R(-0.5, 0.5), R(-0.5, 0.5));
        box(MAT.rustDark, X0 + 0.2, 0, Z0 + 0.15, X1 - 0.2, 0.45, Z1 - 0.15);
      } else if (t === 'ladle') {   // the pouring ladle on its stand on the moulding floor
        for (const s of [-1, 1]) box(MAT.iron, cx + s * 1.25 - 0.12, y0, cz - 0.15, cx + s * 1.25 + 0.12, y0 + 2.1, cz + 0.15);
        put(CYL, MAT.rustDark, cx, y0 + 1.5, cz, 0, 0, 0.12, 1.0, 1.4, 1.0); put(CYL, MAT.coke, cx, y0 + 2.2, cz, 0, 0, 0.12, 0.92, 0.04, 0.92, BN);
        put(CYL8, MAT.iron, cx, y0 + 2.0, cz, 0, 0, HPI, 0.08, 2.6, 0.08); put(PLANE, MAT.ember, cx, y0 + 0.02, cz + 1.2, -HPI, 0, 0, 0.8, 0.6, 1, BN, null);
      } else if (t === 'flask') {   // moulding flasks in the sand: boxes of iron frames, a few runners and risers
        const n = Math.max(1, Math.round((X1 - X0) * (Z1 - Z0) / 2.4));
        for (let i = 0; i < n; i++) { const fx = X0 + 0.3 + (i % 2) * ((X1 - X0) / 2), fz = Z0 + 0.3 + ((i / 2) | 0) * 1.0, w = (X1 - X0) / 2 - 0.4, d = 0.9;
          box(MAT.iron, fx, y0, fz, fx + w, y0 + 0.62, fz + d); box(MAT.sand, fx + 0.06, y0 + 0.62, fz + 0.06, fx + w - 0.06, y0 + 0.66, fz + d - 0.06, BN); put(CYL8, MAT.coke, fx + w * 0.3, y0 + 0.7, fz + d / 2, 0, 0, 0, 0.07, 0.1, 0.07, BN); }
      } else if (t === 'sandpile') {
        put(CONEC, MAT.sand, cx, y0 + 0.5, cz, 0, R(0, TAU), 0, (X1 - X0) / 2 - 0.1, 1.0, (Z1 - Z0) / 2 - 0.1); pp('shovel', X1 - 0.3, y0, cz, R(0, TAU));
      } else if (t === 'cupola') {   // the cupola: a riveted iron cylinder on legs, its spout and the charging door, up through the roof
        for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + TAU / 8; box(MAT.iron, cx + Math.cos(a) * 1.9 - 0.12, 0, cz + Math.sin(a) * 1.9 - 0.12, cx + Math.cos(a) * 1.9 + 0.12, 1.4, cz + Math.sin(a) * 1.9 + 0.12); }
        put(CYL, MAT.rust, cx, 1.4 + 4.5, cz, 0, 0, 0, 1.75, 9, 1.75); put(CYL, MAT.iron, cx, 1.6, cz, 0, 0, 0, 1.95, 0.35, 1.95);
        if (hi) for (let y = 2.2; y < 10; y += 1.4) put(TORUS, MAT.iron, cx, y, cz, HPI, 0, 0, 1.77, 1.77, 1.0);
        box(MAT.iron, cx - 0.3, 1.4, Z1 - 0.25, cx + 0.3, 1.7, Z1 + 0.6); put(PLANE, MAT.ember, cx, 1.72, Z1 + 0.2, -HPI, 0, 0, 0.4, 0.6, 1, BN, null);
        put(CYL, MAT.rustDark, cx, 14, cz, 0, 0, 0, 0.9, 8, 0.9);
      } else if (t === 'coreoven') {
        box(MAT.brickSoot, X0 + 0.1, 0, Z0 + 0.1, X1 - 0.1, 2.3, Z1 - 0.1); box(MAT.iron, X0 + 0.5, 0.3, Z1 - 0.12, X1 - 0.5, 1.9, Z1 - 0.06);
        for (let i = 0; i < 3; i++) box(MAT.steel, X0 + 0.7 + i * 1.6, 1.0, Z1 - 0.18, X0 + 1.2 + i * 1.6, 1.08, Z1 - 0.04, BN);
        put(CYL8, MAT.iron, X1 - 0.6, 6, Z0 + 0.6, 0, 0, 0, 0.18, 8, 0.18);
      } else if (t === 'patbench') {   // a pattern-maker's bench: a heavy top, a vice, wooden patterns half carved
        box(MAT.woodDark, X0 + 0.1, 0.84, Z0 + 0.2, X1 - 0.1, 0.94, Z1 - 0.2); for (const px of [X0 + 0.3, X1 - 0.3]) box(MAT.woodDark, px - 0.07, 0, Z0 + 0.3, px + 0.07, 0.84, Z1 - 0.3);
        box(MAT.woodDark, X0 + 0.3, 0.2, Z0 + 0.3, X1 - 0.3, 0.26, Z1 - 0.3); box(MAT.iron, X0 + 0.3, 0.94, Z0 + 0.15, X0 + 0.55, 1.1, Z0 + 0.4);
        for (let i = 0; i < 3; i++) { const px = R(X0 + 0.9, X1 - 0.9), pz = R(Z0 + 0.5, Z1 - 0.5); if (chance(0.5)) put(CYL, MAT.wood, px, 1.05, pz, HPI, R(0, TAU), 0, R(0.15, 0.3), R(0.3, 0.6), R(0.15, 0.3)); else box(MAT.wood, px - 0.25, 0.94, pz - 0.18, px + 0.25, 1.14, pz + 0.18); }
      } else if (t === 'lathe') {
        box(MAT.green, X0 + 0.2, 0, Z0 + 0.35, X0 + 0.7, 0.9, Z1 - 0.35); box(MAT.green, X1 - 0.6, 0, Z0 + 0.35, X1 - 0.2, 0.9, Z1 - 0.35); box(MAT.steel, X0 + 0.2, 0.9, Z0 + 0.4, X1 - 0.2, 1.0, Z1 - 0.4);
        box(MAT.green, X0 + 0.25, 1.0, Z0 + 0.3, X0 + 0.9, 1.35, Z1 - 0.3); put(CYL, MAT.steel, X0 + 1.0, 1.2, cz, 0, 0, HPI, 0.14, 0.2, 0.14);
      } else if (t === 'patrack') {   // racks of finished patterns, painted red and black
        for (const y of [0.1, 0.9, 1.7]) { box(MAT.wood, X0 + 0.15, y, Z0 + 0.1, X1 - 0.15, y + 0.05, Z1 - 0.1); for (let i = 0; i < 4; i++) { const pz = Z0 + 0.6 + i * ((Z1 - Z0 - 1.2) / 3); box(chance(0.5) ? MAT.brick : MAT.black, X0 + 0.25, y + 0.05, pz - 0.25, X1 - 0.25, y + R(0.25, 0.6), pz + 0.25); } }
        for (const pz of [Z0 + 0.12, Z1 - 0.12]) box(MAT.wood, X0 + 0.15, 0, pz - 0.04, X1 - 0.15, 2.3, pz + 0.04);
      } else if (t === 'orepile') {
        put(CONEC, chance(0.5) ? MAT.ore : MAT.coke, cx, 0.95, cz, 0, R(0, TAU), 0, (X1 - X0) / 2 + 0.1, 1.9, (Z1 - Z0) / 2 + 0.1);
        if (chance(0.6)) pp('shovel', X0 + 0.2, 0, Z1 - 0.2, R(0, TAU));
      } else if (t === 'skip') {   // an ore skip on the rails
        box(MAT.iron, X0 + 0.25, 0.3, Z0 + 0.25, X1 - 0.25, 0.55, Z1 - 0.25); for (const wx of [X0 + 0.8, X1 - 0.8]) for (const s of [-0.72, 0.72]) put(CYL, MAT.iron, wx, 0.3, cz + s, HPI, 0, 0, 0.28, 0.1, 0.28);
        put(CONE, MAT.rust, cx, 1.15, cz, Math.PI, 0, 0, 1.4, 1.2, 0.85); put(CYL, MAT.ore, cx, 1.72, cz, 0, 0, 0, 1.3, 0.05, 0.8, BN);
      }
    }
    // ================================================================ round the furnace house: hot work. Ingot moulds by the runner, a gas main along the wall
    { const FH = ZN.FH; const r = (map.zoneRects || [])[FH];
      if (r && hi) { const X0 = r[0] * CELL, Z0 = r[1] * CELL, X1 = (r[2] + 1) * CELL;
        // a hot-blast main along the north wall above the charging deck, valves on the drops
        put(CYL, MAT.rustDark, (X0 + X1) / 2, 10.4, Z0 + 0.8, 0, 0, HPI, 0.55, X1 - X0, 0.55);
        for (let x = X0 + 4; x < X1 - 2; x += 6) { put(CYL, MAT.rustDark, x, 9.0, Z0 + 0.8, 0, 0, 0, 0.3, 2.8, 0.3); put(TORUS, MAT.iron, x, 8.6, Z0 + 1.2, 0, 0, 0, 0.3, 0.3, 1.5); } } }
    // ================================================================ beyond the walls: the street outside the yard, chimneys and a gasholder against the sky
    { const B0 = map.bounds, x0 = B0.minX * CELL, x1 = (B0.maxX + 1) * CELL, z0 = B0.minZ * CELL, z1 = (B0.maxZ + 1) * CELL;
      box(MAT.cobble, x0 - 10, -0.03, z1, x1 + 10, 0.012, z1 + 14, BN);
      const chim = (x, z, h, r) => { put(CONE, MAT.brickSoot, x, h / 2, z, 0, 0, 0, r, h, r); box(MAT.brickSoot, x - r - 0.6, 0, z - r - 0.6, x + r + 0.6, 3, z + r + 0.6); put(TORUS, MAT.iron, x, h - 1.0, z, HPI, 0, 0, r * 0.63, r * 0.63, 2.0); };
      chim(x1 + 9, z0 + 10, 34, 2.2); chim(x0 - 12, z0 + 24, 28, 1.8); chim(x1 + 22, z1 - 12, 30, 2.0);
      if (hi) { const gx = x0 - 26, gz = z0 + 4; put(CYL, MAT.rustDark, gx, 7, gz, 0, 0, 0, 12, 14, 12); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; box(MAT.iron, gx + Math.cos(a) * 12.4 - 0.2, 0, gz + Math.sin(a) * 12.4 - 0.2, gx + Math.cos(a) * 12.4 + 0.2, 18, gz + Math.sin(a) * 12.4 + 0.2); } put(TORUS, MAT.iron, gx, 18, gz, HPI, 0, 0, 12.4, 12.4, 2); } }
    // ================================================================ painted names high on the halls' walls
    signs.push(...((map.roofRects || []).map((r) => { const n = r.name; if (!n || r.x1 - r.x0 < 5) return null; const hh = hallH(r.zone); return { text: n.toUpperCase(), x: (r.x0 + r.x1 + 1) * CELL / 2, y: Math.min(hh - 2.2, 6.4), z: r.z0 * CELL + 0.04, ry: 0, w: 4.4, h: 0.6 }; }).filter(Boolean)));
    signs.push({ text: 'EISENKRONE  HÜTTENWERK', x: (map.bounds.minX + map.bounds.maxX + 1) * CELL / 2, y: 10.4, z: ((map.foundry && map.zoneRects[ZN.FH][3]) + 1) * CELL + 2.04, ry: 0, w: 9, h: 0.8 });
    for (const s of signs) {
      const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * s.h / s.w); const x = c.getContext('2d');
      x.clearRect(0, 0, c.width, c.height); x.font = `${Math.round(c.height * 0.7)}px "Special Elite", monospace`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = 'rgba(214,204,180,.82)'; x.fillText(s.text, c.width / 2, c.height / 2 + 2);
      x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 240; i++) { x.fillStyle = `rgba(0,0,0,${0.25 + Math.random() * 0.6})`; x.fillRect(Math.random() * c.width, Math.random() * c.height, 1 + Math.random() * 5, 1 + Math.random() * 3); }
      const t = track(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
      const m = track(new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      const mesh = new THREE.Mesh(PLANE, m); mesh.position.set(s.x, s.y, s.z); mesh.rotation.y = s.ry; mesh.scale.set(s.w, s.h, 1); mesh.renderOrder = 2; root.add(mesh);
    }
    // ================================================================ lamps: enamel reflectors on drop rods in the halls, goosenecks on the yard walls
    const bulbs = [];
    { const shadeG = track(new THREE.CylinderGeometry(0.12, 0.46, 0.24, 20, 1, true)), bulbG = track(new THREE.SphereGeometry(0.075, 10, 8));
      const bulbMat = track(new THREE.MeshStandardMaterial({ color: 0x332a20, emissive: 0xffd9a0, emissiveIntensity: 6, roughness: 0.25 }));
      let shadowBudget = 2;
      map.lightSpots.forEach((s, i) => {
        const zn = s.zone, fx = cc(s.x) + s.wdx * (CELL / 2), fz = cc(s.z) + s.wdz * (CELL / 2), ix = -s.wdx, iz = -s.wdz, fl = Math.max(0, floorAt(cc(s.x), cc(s.z)));
        let bx, by, bz, aim; const inside = roofC(s.x, s.z), hh = hallH(zn);
        if (inside) {
          bx = fx + ix * 1.6; bz = fz + iz * 1.6; by = Math.min(fl + 3.4, hh - 1.2);
          put(CYL8, MAT.black, bx, (by + hh - 0.6) / 2 + 0.15, bz, 0, 0, 0, 0.012, Math.max(0.2, hh - 0.6 - by), 0.012, BN);
          put(shadeG, MAT.enamel, bx, by + 0.12, bz, 0, 0, 0, 1, 1, 1, B, null); put(shadeG, MAT.enamelIn, bx, by + 0.115, bz, 0, 0, 0, 0.97, 0.97, 0.97, BN, null);
          aim = [bx, fl, bz];
        } else {
          bx = fx + ix * 0.8; bz = fz + iz * 0.8; by = fl + 4.0;
          beam(MAT.iron, fx + ix * 0.05, by - 0.5, fz + iz * 0.05, fx + ix * 0.05, by + 0.3, fz + iz * 0.05, 0.05);
          beam(MAT.iron, fx + ix * 0.05, by + 0.3, fz + iz * 0.05, bx, by + 0.3, bz, 0.045);
          put(shadeG, MAT.enamel, bx, by + 0.12, bz, 0, 0, 0, 0.8, 0.8, 0.8, B, null); put(shadeG, MAT.enamelIn, bx, by + 0.115, bz, 0, 0, 0, 0.78, 0.78, 0.78, BN, null);
          aim = [fx + ix * 6, fl, fz + iz * 6];
        }
        const bm = new THREE.Mesh(bulbG, bulbMat.clone()); track(bm.material); bm.position.set(bx, by + 0.02, bz); root.add(bm);
        const firstIn = !map.lightSpots.slice(0, i).some(o => o.zone === zn), always = inside ? firstIn : i % 2 === 0;
        const light = new THREE.SpotLight(0xffb066, inside ? 14.0 : 8.0, inside ? 28 : 30, inside ? 1.32 : 1.1, 0.55, 1.0); light.position.set(bx, by, bz); light.target.position.set(aim[0], aim[1], aim[2]); root.add(light); root.add(light.target);
        if (shadowBudget > 0 && always && !inside) { shadowBudget--; light.castShadow = ctx.quality === 'high'; light.shadow.mapSize.set(512, 512); light.shadow.bias = -0.0015; light.shadow.normalBias = 0.02; light.shadow.camera.near = 0.3; light.shadow.camera.far = 30; light.userData.shadowOK = true; }
        bulbs.push({ light, bulbMesh: bm, flicker: !always && rng() < 0.3, power: !always }); stats.bulbs++;
      });
    }
    // the furnace's own glow: two orange lights low over the casting platform (lamps like the rest, built once, never added later)
    for (const ob of map.objects) if (ob.type === 'furnace') { const cx = (ob.x0 + ob.w / 2) * CELL, cz = (ob.z0 + ob.h / 2) * CELL, rr = ob.w * CELL / 2;
      // a work flood on the platform's south edge thrown up the stack, and the tuyeres' glow down on the east side of the platform
      for (const [px, py, pz, tx, ty, tz, c, I, ang] of [[cx + 1.5, 3.9, cz + rr + 3.4, cx, 13, cz, 0xffc890, 16.0, 0.75], [cx + rr + 0.9, 4.6, cz - 0.5, cx + rr + 7, 3.2, cz - 1.0, 0xff7a2a, 9.0, 1.3]]) { const L = new THREE.SpotLight(c, I, 24, ang, 0.6, 1.0); L.position.set(px, py, pz); L.target.position.set(tx, ty, tz); root.add(L); root.add(L.target);
        const bm = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 3), MAT.fire); track(bm.geometry); bm.position.copy(L.position); bm.visible = false; root.add(bm); bulbs.push({ light: L, bulbMesh: bm, flicker: true, power: false }); stats.bulbs++; } }
    for (const ob of map.objects) if (ob.type === 'furnace') { const cx = (ob.x0 + ob.w / 2) * CELL, cz = (ob.z0 + ob.h / 2) * CELL, rr = ob.w * CELL / 2, px = cx + 1.5, pz = cz + rr + 3.6;
      put(CYL8, MAT.iron, px, 3.55, pz, 0, 0, 0, 0.04, 0.7, 0.04); put(CYL, MAT.grey, px, 3.95, pz - 0.05, -0.9, 0, 0, 0.22, 0.32, 0.22); put(CYL, MAT.fire, px, 4.06, pz - 0.2, -0.9, 0, 0, 0.18, 0.02, 0.18, BN); }
    // ================================================================ build the batches
    const mB = B.build(true, true), mN = BN.build(false, true), mP = PB.build(true);
    for (const m of [mB, mN]) if (m) { track(m.geometry); root.add(m); }
    if (mP) { root.add(mP); track(mP.geometry); }
    for (const g of geos) g.dispose();
    stats.tris = (mB ? mB.geometry.attributes.position.count / 3 : 0) + (mN ? mN.geometry.attributes.position.count / 3 : 0);
    stats.ms = +(performance.now() - T0).toFixed(1);
    const powerMats = [{ m: MAT.glassLit, off: 0.04, on: 0.5 }, { m: MAT.fire, off: 1.6, on: 2.6 }, { m: MAT.ember, off: 0.55, on: 1.2 }, { m: MAT.furnace, off: 0.16, on: 0.26 }, { m: MAT.furnaceHot, off: 0.7, on: 1.2 }];
    return {
      root, stats, wallTop: WALL_TOP, lowTop, bulbs, powerMats, rail: railCell, noRain: true,
      setPower(on) { for (const p of powerMats) p.m.emissiveIntensity = on ? p.on : p.off; },
      setQuality() {},
      dispose() { if (root.parent) root.parent.remove(root); for (const o of own) if (o && o.dispose) o.dispose(); own.length = 0; },
    };
  }
  return { build };
})();

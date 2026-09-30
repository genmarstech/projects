import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * The car in section 02, modelled in code rather than loaded.
 *
 * ── WHY THERE IS NO .GLB ────────────────────────────────────────────────────
 *
 * The design builds the whole car out of primitives — extruded planforms for
 * the floor and sidepods, a lathe for each tyre, a tube for the halo — and
 * that is worth keeping rather than "improving" into an asset. It costs no
 * download, it recolours instantly for the livery picker (the materials are
 * the model), and it is the only reason the four hotspots can be anchored to
 * points on the car and stay attached while the camera moves.
 *
 * ── THREE IS A DEPENDENCY HERE, NOT A CDN IMPORT ────────────────────────────
 *
 * The design did `await import('https://esm.sh/three@0.160.0')` at runtime.
 * That is right for a canvas that has to run from one HTML file and wrong for
 * a deployed site: it puts a third party in the critical path of the page's
 * centrepiece, it cannot be pinned by a lockfile, and it needs a CSP that
 * permits arbitrary remote script. `three` is in package.json instead and
 * Vite bundles it.
 */

/** Camera choreography: [scroll, azimuth, elevation, distance, carX]. */
const KEYFRAMES: [number, number, number, number, number][] = [
  [0, 0.05, 0.1, 8, -11],
  [0.2, 0.05, 0.13, 7.4, 0],
  [0.3, 0.75, 0.18, 6.4, 0],
  [0.44, 0.2, 0.95, 6.8, 0],
  [0.57, -0.75, 0.32, 6.6, 0],
  [0.7, -1.25, 0.2, 6.2, 0],
  [0.84, -0.1, 0.12, 7.4, 0],
  [1, -0.05, 0.1, 7.8, 13],
];

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Interpolate the keyframe track at scroll position `s`. */
function cameraAt(s: number): [number, number, number, number] {
  let i = 0;
  while (i < KEYFRAMES.length - 2 && s > KEYFRAMES[i + 1]![0]) i++;
  const a = KEYFRAMES[i]!;
  const b = KEYFRAMES[i + 1]!;
  const t = smoothstep(Math.min(1, Math.max(0, (s - a[0]) / (b[0] - a[0]))));
  return [
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
    a[4] + (b[4] - a[4]) * t,
  ];
}

export interface CarScene {
  /** 0–1 through the pinned section. Written every frame by the scroll loop. */
  progress: number;
  /** Suppress the speed streaks and the camera travel. */
  still: boolean;
  /**
   * Where each anchor currently sits, in host-relative pixels — or null
   * before the first frame. The DOM hotspots read this; nothing re-renders.
   */
  hotspots: [number, number][] | null;
  dispose(): void;
}

export interface CarOptions {
  /** Points on the car to project each frame, in model space. */
  anchors: [number, number, number][];
  /** Body and accent colour, read every frame so a change eases in. */
  getLivery: () => { a: string; b: string };
}

export function createCarScene(host: HTMLElement, opts: CarOptions): CarScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const gloss = new THREE.MeshPhysicalMaterial({
    color: 0x0b0b0c, metalness: 0.35, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08,
  });
  const red = new THREE.MeshPhysicalMaterial({
    color: 0xe10600, metalness: 0.2, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1,
  });
  const carbon = new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.4, roughness: 0.55 });
  const titanium = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 1, roughness: 0.3 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.85 });

  const car = new THREE.Group();
  const body = new THREE.Group();
  car.add(body);
  scene.add(car);

  const add = (
    g: THREE.BufferGeometry,
    m: THREE.Material,
    p?: THREE.Vector3 | null,
    r?: [number, number, number] | null,
    s?: [number, number, number] | null,
    parent: THREE.Object3D = body,
  ) => {
    const o = new THREE.Mesh(g, m);
    if (p) o.position.copy(p);
    if (r) o.rotation.set(...r);
    if (s) o.scale.set(...s);
    parent.add(o);
    return o;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  /** A strut between two points — suspension arms, the roll hoop stay. */
  const rod = (
    a: THREE.Vector3, b: THREE.Vector3, r = 0.018,
    m: THREE.Material = carbon, parent: THREE.Object3D = body,
  ) => {
    const d = b.clone().sub(a);
    const o = add(
      new THREE.CylinderGeometry(r, r, d.length(), 8), m,
      a.clone().add(b).multiplyScalar(0.5), null, null, parent,
    );
    o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    return o;
  };

  /** A top-view planform (x, halfWidth), mirrored and extruded upward. */
  const plan = (pts: [number, number][], depth: number, bevel: number, mat: THREE.Material, y: number) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0]![0], -pts[0]![1]);
    s.splineThru(pts.slice(1).map((p) => new THREE.Vector2(p[0], -p[1])));
    s.lineTo(pts[pts.length - 1]![0], pts[pts.length - 1]![1]);
    s.splineThru(pts.slice(0, -1).reverse().map((p) => new THREE.Vector2(p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(s, {
      depth, bevelEnabled: bevel > 0, bevelThickness: bevel,
      bevelSize: bevel * 0.8, bevelSegments: 6, curveSegments: 32,
    });
    return add(g, mat, V(0, y, 0), [-Math.PI / 2, 0, 0]);
  };

  /** A side profile (x, y) extruded across the car's width. */
  const side = (pts: [number, number][], depth: number, bevel: number, mat: THREE.Material) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0]![0], pts[0]![1]);
    s.splineThru(pts.slice(1).map((p) => new THREE.Vector2(p[0], p[1])));
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth, bevelEnabled: bevel > 0, bevelThickness: bevel,
      bevelSize: bevel * 0.8, bevelSegments: 6, curveSegments: 40,
    });
    g.translate(0, 0, -depth / 2);
    return add(g, mat);
  };

  // ── floor and plank ───────────────────────────────────────────────────────
  plan([[1.25, 0.3], [1.0, 0.9], [0.2, 0.98], [-1.5, 0.96], [-2.15, 0.55]], 0.025, 0.012, carbon, 0.1);
  add(box(3.2, 0.03, 0.3), new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8 }), V(-0.4, 0.085, 0));

  // ── sidepods, coke-bottled toward the rear ────────────────────────────────
  plan([[0.78, 0.46], [0.62, 0.86], [-0.1, 0.9], [-0.9, 0.66], [-1.7, 0.3], [-2.0, 0.2]], 0.26, 0.1, gloss, 0.2);
  plan([[0.6, 0.8], [0.3, 0.88], [-0.3, 0.86], [-0.95, 0.62]], 0.005, 0, red, 0.57);

  // ── tub and cockpit ───────────────────────────────────────────────────────
  add(new RoundedBoxGeometry(1.55, 0.44, 0.7, 5, 0.14), gloss, V(0.55, 0.42, 0));
  add(new RoundedBoxGeometry(0.6, 0.12, 0.44, 4, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 }), V(0.42, 0.6, 0));

  // ── nose ──────────────────────────────────────────────────────────────────
  add(new THREE.CylinderGeometry(0.07, 0.27, 1.7, 40), gloss, V(2.05, 0.3, 0),
    [0, 0, -Math.PI / 2 - 0.07], [0.62, 1, 1]);
  add(box(1.2, 0.012, 0.08), red, V(2.0, 0.43, 0), [0, 0, -0.1]);

  // ── engine cover, airbox, shark fin ───────────────────────────────────────
  side([[0.25, 0.58], [0.12, 1.0], [-0.15, 1.08], [-0.7, 0.96], [-1.5, 0.7], [-2.15, 0.5], [-2.15, 0.36], [0.25, 0.36]], 0.4, 0.06, gloss);
  add(new RoundedBoxGeometry(0.16, 0.16, 0.22, 3, 0.05), new THREE.MeshStandardMaterial({ color: 0x030303 }), V(0.14, 0.95, 0));
  side([[-0.2, 1.06], [-1.95, 0.98], [-1.95, 0.62], [-1.1, 0.76]], 0.012, 0, red);

  // ── halo ──────────────────────────────────────────────────────────────────
  const halo: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    halo.push(V(0.42 + Math.sin((i / 24) * Math.PI) * 0.42, 0.9 + Math.sin((i / 24) * Math.PI) * 0.02, -0.3 + (i / 24) * 0.6));
  }
  halo.unshift(V(0.02, 0.62, -0.32));
  halo.push(V(0.02, 0.62, 0.32));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(halo), 80, 0.032, 12), titanium);
  rod(V(0.84, 0.91, 0), V(1.12, 0.6, 0), 0.03, titanium);

  // ── the driver's helmet, just visible in the cockpit ──────────────────────
  add(new THREE.SphereGeometry(0.15, 32, 24),
    new THREE.MeshPhysicalMaterial({ color: 0xedeae4, roughness: 0.25, clearcoat: 1 }), V(0.36, 0.76, 0));
  add(new THREE.SphereGeometry(0.152, 32, 12, -0.9, 1.8, 1.2, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x080808, metalness: 0.8, roughness: 0.1 }),
    V(0.36, 0.76, 0), [0, Math.PI / 2, 0]);

  // ── front wing ────────────────────────────────────────────────────────────
  add(box(0.44, 0.03, 2.1), carbon, V(2.78, 0.1, 0));
  add(box(0.3, 0.024, 1.96), gloss, V(2.66, 0.17, 0), [0, 0, 0.28]);
  add(box(0.24, 0.022, 1.9), red, V(2.56, 0.24, 0), [0, 0, 0.5]);
  ([-1, 1] as const).forEach((s) => {
    add(box(0.62, 0.26, 0.02), gloss, V(2.68, 0.2, s * 1.06));
    rod(V(2.6, 0.12, s * 0.12), V(2.35, 0.26, s * 0.08), 0.016);
  });

  // ── rear wing ─────────────────────────────────────────────────────────────
  add(box(0.42, 0.035, 1.16), gloss, V(-2.34, 1.0, 0), [0, 0, 0.14]);
  add(box(0.26, 0.028, 1.16), red, V(-2.46, 1.13, 0), [0, 0, 0.48]);
  add(box(0.32, 0.03, 0.9), carbon, V(-2.28, 0.46, 0), [0, 0, 0.1]);
  ([-1, 1] as const).forEach((s) => {
    add(box(0.78, 0.74, 0.022), gloss, V(-2.38, 0.8, s * 0.59));
    add(box(0.78, 0.03, 0.024), red, V(-2.38, 1.17, s * 0.59));
  });
  add(box(0.07, 0.5, 0.04), carbon, V(-2.22, 0.72, 0));
  add(box(0.12, 0.08, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xe10600, emissive: 0xe10600, emissiveIntensity: 2 }),
    V(-2.2, 0.36, 0));

  // ── wheels ────────────────────────────────────────────────────────────────
  const wheels: { spin: THREE.Group; r: number }[] = [];
  const makeWheel = (x: number, z: number, r: number, w: number) => {
    const g = new THREE.Group();
    g.position.set(x, r, z);
    car.add(g);
    const spin = new THREE.Group();
    g.add(spin);

    const pts: THREE.Vector2[] = [];
    const r0 = r * 0.64;
    const rc = r * 0.22;
    pts.push(new THREE.Vector2(r0, -w));
    for (let i = 0; i <= 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - rc + Math.cos(a) * rc, -w + rc + Math.sin(a) * rc));
    }
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - rc + Math.cos(a) * rc, w - rc + Math.sin(a) * rc));
    }
    pts.push(new THREE.Vector2(r0, w));
    add(new THREE.LatheGeometry(pts, 64), rubber, null, [Math.PI / 2, 0, 0], null, spin);

    ([-1, 1] as const).forEach((s) => {
      add(new THREE.RingGeometry(r * 0.8, r * 0.84, 64), red, V(0, 0, s * (w + 0.002)), [0, s < 0 ? Math.PI : 0, 0], null, spin);
      add(new THREE.CircleGeometry(r0 * 1.02, 48),
        new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.6, roughness: 0.35 }),
        V(0, 0, s * (w - 0.02)), [0, s < 0 ? Math.PI : 0, 0], null, spin);
      for (let i = 0; i < 6; i++) {
        add(box(r0 * 1.7, 0.018, 0.014),
          new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 1, roughness: 0.25 }),
          V(0, 0, s * (w - 0.01)), [0, 0, (i / 6) * Math.PI], null, spin);
      }
    });
    add(new THREE.CylinderGeometry(0.04, 0.04, w * 2 + 0.04, 6), red, null, [Math.PI / 2, 0, 0], null, spin);
    wheels.push({ spin, r });
    return g;
  };

  ([[1.92, 0.36, 0.15], [-1.76, 0.39, 0.21]] as const).forEach(([x, r, w]) =>
    ([-1, 1] as const).forEach((s) => {
      makeWheel(x, s * (0.78 + w), r, w);
      const zw = s * (0.78 + w - w * 1.1);
      const zb = s * 0.3;
      const xb = x > 0 ? 1.45 : -1.25;
      const reach = x > 0 ? 0.5 : -0.4;
      rod(V(x, r + 0.08, zw), V(xb, r + 0.12, zb));
      rod(V(x, r + 0.08, zw), V(xb + reach, r + 0.12, zb));
      rod(V(x, r - 0.08, zw), V(xb, r - 0.06, zb));
      rod(V(x, r - 0.08, zw), V(xb + reach, r - 0.06, zb));
    }),
  );

  // ── ground: a scrolling grid, faded out at the edges ──────────────────────
  const gridCv = document.createElement("canvas");
  gridCv.width = gridCv.height = 256;
  const gx = gridCv.getContext("2d")!;
  gx.fillStyle = "#0c0c0c"; gx.fillRect(0, 0, 256, 256);
  gx.fillStyle = "#262626"; gx.fillRect(0, 0, 256, 3);
  gx.fillStyle = "#181818"; gx.fillRect(0, 0, 2, 256);
  const gridTex = new THREE.CanvasTexture(gridCv);
  gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping;
  gridTex.repeat.set(24, 24);
  gridTex.colorSpace = THREE.SRGBColorSpace;
  gridTex.anisotropy = 8;

  const fadeCv = document.createElement("canvas");
  fadeCv.width = fadeCv.height = 256;
  const fx = fadeCv.getContext("2d")!;
  const fade = fx.createRadialGradient(128, 128, 0, 128, 128, 128);
  fade.addColorStop(0, "#fff"); fade.addColorStop(0.55, "#555"); fade.addColorStop(1, "#000");
  fx.fillStyle = fade; fx.fillRect(0, 0, 256, 256);

  add(new THREE.PlaneGeometry(48, 48), new THREE.MeshStandardMaterial({
    map: gridTex, alphaMap: new THREE.CanvasTexture(fadeCv), transparent: true,
    roughness: 0.35, metalness: 0.6, depthWrite: false,
  }), null, [-Math.PI / 2, 0, 0], null, scene);

  // Contact shadow — a gradient sprite, not a shadow map. One draw, no cost.
  const shadowCv = document.createElement("canvas");
  shadowCv.width = 256; shadowCv.height = 128;
  const sx = shadowCv.getContext("2d")!;
  const sg = sx.createRadialGradient(128, 64, 0, 128, 64, 128);
  sg.addColorStop(0, "rgba(0,0,0,.85)"); sg.addColorStop(1, "rgba(0,0,0,0)");
  sx.fillStyle = sg; sx.fillRect(0, 0, 256, 128);
  add(new THREE.PlaneGeometry(6.6, 3),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCv), transparent: true, depthWrite: false }),
    V(0, 0.006, 0), [-Math.PI / 2, 0, 0], null, car);

  // ── light ─────────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 6, 4); scene.add(key);
  const back = new THREE.DirectionalLight(0xffffff, 1.6); back.position.set(-5, 4, -4); scene.add(back);
  const rimA = new THREE.PointLight(0xe10600, 50, 18); rimA.position.set(-3, 1, 3); scene.add(rimA);
  const rimB = new THREE.PointLight(0xff3020, 40, 18); rimB.position.set(4, 0.8, -3); scene.add(rimB);

  // ── speed streaks ─────────────────────────────────────────────────────────
  const streakMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const streakRed = streakMat.clone();
  streakRed.color.set(0xe10600);
  const streakGeo = new THREE.PlaneGeometry(1, 1);
  const streaks: THREE.Mesh[] = [];
  for (let i = 0; i < 70; i++) {
    const m = new THREE.Mesh(streakGeo, i % 5 === 0 ? streakRed : streakMat);
    const z = (Math.random() < 0.5 ? -1 : 1) * (1.3 + Math.random() * 3);
    const y = 0.05 + Math.random() * 1.8;
    m.position.set(-9 + Math.random() * 18, y, i % 3 === 0 ? (Math.random() - 0.5) * 1.6 : z);
    if (Math.abs(m.position.z) < 1) m.position.y = 1.35 + Math.random() * 0.8;
    m.userData = { len: 0.6 + Math.random() * 1.6, sp: 0.7 + Math.random() * 0.6, th: 0.006 + Math.random() * 0.01 };
    m.rotation.x = Math.random() < 0.5 ? 0 : -Math.PI / 2;
    scene.add(m);
    streaks.push(m);
  }

  const anchors = opts.anchors.map(([x, y, z]) => V(x, y, z));
  const liveryNow = [gloss.color, red.color];
  const liveryTarget = [new THREE.Color(), new THREE.Color()];

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const api: CarScene = {
    progress: 0, still: false, hotspots: null,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      pmrem.dispose();
      host.removeChild(renderer.domElement);
    },
  };

  let raf = 0;
  let lastS: number | null = null;
  let pitch = 0;
  let speed = 0;
  const tmp = new THREE.Vector3();

  const loop = () => {
    raf = requestAnimationFrame(loop);
    const b = host.getBoundingClientRect();
    // Offscreen costs nothing. The section is 420vh, so most of the time the
    // canvas is nowhere near the viewport.
    if (b.bottom < 0 || b.top > innerHeight) return;

    const s = api.progress;
    const [az, el, dist0, carX] = cameraAt(s);
    const dv = lastS == null ? 0 : s - lastS;
    lastS = s;

    // Portrait pulls the camera back — the car is 6 units long against a
    // viewport that is taller than it is wide.
    const dist = dist0 * (cam.aspect < 1 ? (1.9 / Math.max(0.5, cam.aspect)) * 0.55 : 1);
    car.position.x = carX;

    const travel = s * 140 + carX;
    wheels.forEach((w) => (w.spin.rotation.z = -travel / w.r));
    gridTex.offset.x = travel / 2;

    pitch += (Math.max(-0.04, Math.min(0.04, -dv * 6)) - pitch) * 0.1;
    speed += ((api.still ? 0 : Math.min(1, Math.abs(dv) * 90)) - speed) * 0.12;
    streakMat.opacity = speed * 0.55;
    streakRed.opacity = speed * 0.8;
    streaks.forEach((m) => {
      const u = m.userData as { len: number; sp: number; th: number };
      m.position.x -= (dv >= 0 ? 1 : -1) * (0.05 + speed * 0.9) * u.sp;
      if (m.position.x < -10) m.position.x += 20;
      if (m.position.x > 10) m.position.x -= 20;
      m.scale.set(u.len * (0.3 + speed * 3.5), u.th, 1);
      m.visible = speed > 0.02;
    });

    const L = opts.getLivery();
    liveryTarget[0]!.set(L.a);
    liveryTarget[1]!.set(L.b);
    liveryNow[0]!.lerp(liveryTarget[0]!, 0.08);
    liveryNow[1]!.lerp(liveryTarget[1]!, 0.08);

    body.rotation.z = pitch;
    body.position.y = Math.sin(travel * 1.3) * 0.004;

    const target = V(carX * 0.35, 0.45, 0);
    cam.position.set(
      target.x + Math.sin(az) * dist * Math.cos(el),
      0.45 + Math.sin(el) * dist,
      Math.cos(az) * dist * Math.cos(el),
    );
    cam.lookAt(target);
    renderer.render(scene, cam);

    car.updateMatrixWorld();
    api.hotspots = anchors.map((a) => {
      tmp.copy(a).applyMatrix4(body.matrixWorld).project(cam);
      return [((tmp.x + 1) / 2) * b.width, ((1 - tmp.y) / 2) * b.height] as [number, number];
    });
  };
  loop();

  return api;
}

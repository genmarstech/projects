import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The wheel in section 03, built from a lathed profile and dragged by hand.
 *
 * The sidewall stripe is a real ring mesh rather than a texture, which is why
 * switching compound recolours instantly and in 3D — `setCompoundColor` sets
 * one material and both sidewalls follow. A texture swap would mean five
 * canvases, or one atlas, for a colour change.
 *
 * Drag state lives here, not in React. A pointer-move that set React state
 * would re-render the whole section sixty times a second to move a camera
 * that React does not own.
 */

export interface TyreScene {
  /** Free rotation of the wheel about its own axis, advanced by the caller. */
  spin: number;
  /** Stop the idle drift. Dragging still works. */
  still: boolean;
  setCompoundColor(hex: string): void;
  dispose(): void;
}

export function createTyreScene(host: HTMLElement, initialColor: string): TyreScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  cam.position.set(0, 0, 8.2);

  const outer = new THREE.Group();
  const wheel = new THREE.Group();
  outer.add(wheel);
  scene.add(outer);

  // ── the tyre itself: a profile lathed around Y ────────────────────────────
  const pts: THREE.Vector2[] = [];
  const R0 = 0.98;
  const R1 = 1.62;
  const W = 0.62;
  const rc = 0.22;
  pts.push(new THREE.Vector2(R0, -W));
  for (let i = 0; i <= 12; i++) {
    const a = -Math.PI / 2 + (i / 12) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R1 - rc + Math.cos(a) * rc, -W + rc + Math.sin(a) * rc));
  }
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R1 - rc + Math.cos(a) * rc, W - rc + Math.sin(a) * rc));
  }
  pts.push(new THREE.Vector2(R0, W));
  const rubber = new THREE.MeshPhysicalMaterial({
    color: 0x0c0c0c, roughness: 0.82, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.7,
  });
  wheel.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 160), rubber));

  // ── compound stripe and lettering, both sidewalls ─────────────────────────
  const stripes: THREE.MeshStandardMaterial[] = [];
  ([-1, 1] as const).forEach((s) => {
    const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(initialColor), roughness: 0.45 });
    stripes.push(m);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.37, 160), m);
    ring.rotation.x = (-Math.PI / 2) * s;
    ring.position.y = W * s + 0.002 * s;
    wheel.add(ring);

    const inner = new THREE.Mesh(
      new THREE.RingGeometry(1.12, 1.14, 160),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6 }),
    );
    inner.rotation.x = (-Math.PI / 2) * s;
    inner.position.y = W * s + 0.002 * s;
    wheel.add(inner);

    for (let i = 0; i < 2; i++) {
      const blk = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.01, 0.07),
        new THREE.MeshStandardMaterial({ color: 0xdedede, roughness: 0.5 }),
      );
      const a = i * Math.PI + 0.6;
      blk.position.set(Math.cos(a) * 1.22, W * s + 0.004 * s, Math.sin(a) * 1.22);
      blk.rotation.y = -a + Math.PI / 2;
      wheel.add(blk);
    }
  });

  // ── rim ───────────────────────────────────────────────────────────────────
  const metal = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 1, roughness: 0.28 });
  wheel.add(new THREE.Mesh(
    new THREE.CylinderGeometry(R0, R0, W * 2 - 0.04, 96, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.4, side: THREE.DoubleSide }),
  ));
  const lip = new THREE.Mesh(new THREE.TorusGeometry(R0, 0.03, 16, 120), metal);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = W - 0.03;
  wheel.add(lip);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.5, 48), metal);
  hub.position.y = 0.3;
  wheel.add(hub);

  const nut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.16, 6),
    new THREE.MeshStandardMaterial({ color: 0xe10600, metalness: 0.6, roughness: 0.3 }),
  );
  nut.position.y = 0.6;
  wheel.add(nut);

  for (let i = 0; i < 10; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.05, 0.09), metal);
    const a = (i / 10) * Math.PI * 2;
    spoke.position.set(Math.cos(a) * 0.6, 0.42, Math.sin(a) * 0.6);
    spoke.rotation.y = -a;
    spoke.rotation.x = 0.15;
    wheel.add(spoke);
  }

  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(0.96, 96),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.5, roughness: 0.35, transparent: true, opacity: 0.35 }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.5;
  wheel.add(disc);

  // Lathe builds around Y; the wheel has to face the camera, so tip the axis.
  wheel.rotation.x = Math.PI / 2;

  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const redLight = new THREE.PointLight(0xe10600, 60, 20);
  redLight.position.set(-4, -1.5, 2);
  scene.add(redLight);
  const rimLight = new THREE.PointLight(0xff4a3a, 40, 20);
  rimLight.position.set(3, -2, -3);
  scene.add(rimLight);

  // ── drag ──────────────────────────────────────────────────────────────────
  let tx = -0.55;
  let ty = 0.25;
  let rx = -0.55;
  let ry = 0.25;
  let drag: { x: number; y: number; tx: number; ty: number } | null = null;

  const down = (e: PointerEvent) => {
    drag = { x: e.clientX, y: e.clientY, tx, ty };
    host.style.cursor = "grabbing";
  };
  const move = (e: PointerEvent) => {
    if (!drag) return;
    tx = drag.tx + (e.clientX - drag.x) * 0.008;
    ty = Math.max(-1, Math.min(1, drag.ty + (e.clientY - drag.y) * 0.006));
  };
  const up = () => {
    drag = null;
    host.style.cursor = "grab";
  };
  host.addEventListener("pointerdown", down);
  addEventListener("pointermove", move);
  addEventListener("pointerup", up);

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    // Portrait needs more distance or the wheel overflows its own box.
    cam.position.z = w / h < 1 ? 11 : 8.2;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const api: TyreScene = {
    spin: 0,
    still: false,
    setCompoundColor(hex: string) {
      stripes.forEach((m) => m.color.set(hex));
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      renderer.dispose();
      pmrem.dispose();
      host.removeChild(renderer.domElement);
    },
  };

  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const b = host.getBoundingClientRect();
    if (b.bottom < 0 || b.top > innerHeight) return;
    // A slow drift so the wheel is never dead on arrival — unless the viewer
    // asked for stillness, in which case only their own drag moves it.
    if (!drag && !api.still) tx += Math.sin(performance.now() / 3000) * 0.0008;
    rx += (tx - rx) * 0.08;
    ry += (ty - ry) * 0.08;
    outer.rotation.y = rx;
    outer.rotation.x = ry;
    wheel.rotation.y = -api.spin;
    renderer.render(scene, cam);
  };
  loop();

  return api;
}

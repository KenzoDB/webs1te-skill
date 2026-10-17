// One WebGL context shared by every <DistortImage>. The GL canvas is never in
// the DOM: each frame it renders the animating item into a corner of its
// drawing buffer and the result is copied into that item's own 2D canvas,
// which lives inside the item's container (so parent clip-path / transforms /
// stacking keep working). Only items that are animating are rendered.

import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { DISTORT_FRAG, FULLSCREEN_VERT } from "./shaders";

export type DistortHandle = {
  setHover: (on: boolean, e?: PointerEvent) => void;
  dispose: () => void;
};

type Item = {
  wrap: HTMLElement;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  onFail: () => void;
  texKey: string | null;
  target: number;
  hover: number;
  mouse: THREE.Vector2;
  prev: THREE.Vector2;
  vel: THREE.Vector2;
  fresh: boolean;
  shown: boolean;
};

type GL = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  material: THREE.ShaderMaterial;
  geometry: THREE.PlaneGeometry;
  uniforms: {
    uTex: { value: THREE.Texture | null };
    uImg: { value: THREE.Vector2 };
    uRes: { value: THREE.Vector2 };
    uMouse: { value: THREE.Vector2 };
    uVel: { value: THREE.Vector2 };
    uHover: { value: number };
    uTime: { value: number };
  };
  w: number;
  h: number;
};

const items = new Set<Item>();
const active = new Set<Item>();
const textures = new Map<string, { tex: THREE.Texture; refs: number }>();
const pointer = { x: 0, y: 0, known: false };
let gl: GL | null = null;
let failed = false;
let ticking = false;
let last = 0;
let time = 0;

export function canUseDistort(): boolean {
  if (failed || typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
  return typeof WebGLRenderingContext !== "undefined";
}

const onPointerMove = (e: PointerEvent) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.known = true;
};
const onPointerOut = (e: PointerEvent) => {
  if (!e.relatedTarget) pointer.known = false;
};

function ensureGL(): GL | null {
  if (gl) return gl;
  if (failed) return null;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
  } catch {
    failed = true;
    return null;
  }
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setSize(1, 1, false);
  const uniforms: GL["uniforms"] = {
    uTex: { value: null },
    uImg: { value: new THREE.Vector2(1, 1) },
    uRes: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uVel: { value: new THREE.Vector2() },
    uHover: { value: 0 },
    uTime: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: DISTORT_FRAG,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  gl = { renderer, scene, camera: new THREE.Camera(), material, geometry, uniforms, w: 1, h: 1 };
  return gl;
}

function teardown() {
  stopTicker();
  window.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerout", onPointerOut);
  textures.forEach(({ tex }) => tex.dispose());
  textures.clear();
  if (gl) {
    gl.material.dispose();
    gl.geometry.dispose();
    gl.renderer.dispose();
    gl.renderer.forceContextLoss();
    gl = null;
  }
}

function acquireTexture(item: Item): THREE.Texture | null {
  const key = item.img.currentSrc || item.img.src;
  if (item.texKey === key) return textures.get(key)?.tex ?? null;
  if (!item.img.complete || !item.img.naturalWidth) return null;
  releaseTexture(item);
  let entry = textures.get(key);
  if (!entry) {
    const tex = new THREE.Texture(item.img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    entry = { tex, refs: 0 };
    textures.set(key, entry);
  }
  entry.refs++;
  item.texKey = key;
  return entry.tex;
}

function releaseTexture(item: Item) {
  const key = item.texKey;
  if (!key) return;
  item.texKey = null;
  const entry = textures.get(key);
  if (!entry) return;
  entry.refs--;
  if (entry.refs <= 0) {
    entry.tex.dispose();
    textures.delete(key);
  }
}

function startTicker() {
  if (ticking) return;
  ticking = true;
  last = performance.now();
  gsap.ticker.add(frame);
}
function stopTicker() {
  if (!ticking) return;
  ticking = false;
  gsap.ticker.remove(frame);
}

function hide(item: Item) {
  item.canvas.style.opacity = "0";
  item.canvas.width = 0;
  item.canvas.height = 0;
  item.shown = false;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clampLen = (v: THREE.Vector2, max: number) => {
  const l = v.length();
  if (l > max) v.multiplyScalar(max / l);
  return v;
};
const tmp = new THREE.Vector2();

function frame() {
  const now = performance.now();
  const dt = Math.min(Math.max((now - last) / 1000, 1 / 240), 1 / 20);
  last = now;
  time += dt;

  const g = gl;
  if (!g) {
    stopTicker();
    return;
  }

  for (const item of active) {
    // Read layout every frame: Lenis scroll and GSAP transforms on parents move us.
    const rect = item.wrap.getBoundingClientRect();
    if (!item.wrap.isConnected || rect.width < 1 || rect.height < 1) {
      item.target = 0;
      item.hover = 0;
    }
    const mx = (pointer.x - rect.left) / rect.width;
    const my = 1 - (pointer.y - rect.top) / rect.height;
    const inside = pointer.known && mx >= 0 && mx <= 1 && my >= 0 && my <= 1;
    if (!inside) item.target = 0;

    const cx = inside ? mx : item.prev.x;
    const cy = inside ? my : item.prev.y;
    if (item.fresh) {
      item.mouse.set(clamp01(mx), clamp01(my));
      item.prev.copy(item.mouse);
      item.vel.set(0, 0);
      item.fresh = false;
    }

    const kH = item.target > item.hover ? 5 : 3.2;
    item.hover += (item.target - item.hover) * (1 - Math.exp(-dt * kH));

    tmp.set((cx - item.prev.x) / dt, (cy - item.prev.y) / dt).multiplyScalar(0.08);
    clampLen(tmp, 1);
    item.prev.set(cx, cy);
    item.vel.lerp(tmp, 1 - Math.exp(-dt * 6));
    item.mouse.lerp(tmp.set(cx, cy), 1 - Math.exp(-dt * 9));

    if (item.target === 0 && item.hover < 0.003) {
      item.hover = 0;
      active.delete(item);
      hide(item);
      continue;
    }

    render(g, item);
  }

  if (active.size === 0) stopTicker();
}

function render(g: GL, item: Item) {
  const tex = acquireTexture(item);
  if (!tex) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(item.wrap.clientWidth * dpr));
  const h = Math.max(1, Math.round(item.wrap.clientHeight * dpr));
  if (item.canvas.width !== w || item.canvas.height !== h) {
    item.canvas.width = w;
    item.canvas.height = h;
  }
  if (!item.ctx) item.ctx = item.canvas.getContext("2d", { alpha: false });
  if (!item.ctx) return;

  if (g.w < w || g.h < h) {
    g.w = Math.max(g.w, w);
    g.h = Math.max(g.h, h);
    g.renderer.setSize(g.w, g.h, false);
  }

  const u = g.uniforms;
  u.uTex.value = tex;
  u.uImg.value.set(item.img.naturalWidth, item.img.naturalHeight);
  u.uRes.value.set(w, h);
  u.uMouse.value.copy(item.mouse);
  u.uVel.value.copy(item.vel);
  u.uHover.value = item.hover;
  u.uTime.value = time;

  g.renderer.setViewport(0, 0, w, h);
  g.renderer.setScissor(0, 0, w, h);
  g.renderer.setScissorTest(true);
  g.renderer.render(g.scene, g.camera);

  // WebGL origin is bottom-left; copy synchronously (no preserveDrawingBuffer needed).
  const src = g.renderer.domElement;
  item.ctx.drawImage(src, 0, src.height - h, w, h, 0, 0, w, h);
  if (!item.shown) {
    item.shown = true;
    item.canvas.style.opacity = "1";
  }
}

export function registerDistort(
  wrap: HTMLElement,
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  onFail: () => void,
): DistortHandle {
  if (items.size === 0) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
  }
  const item: Item = {
    wrap,
    img,
    canvas,
    ctx: null,
    onFail,
    texKey: null,
    target: 0,
    hover: 0,
    mouse: new THREE.Vector2(0.5, 0.5),
    prev: new THREE.Vector2(0.5, 0.5),
    vel: new THREE.Vector2(),
    fresh: true,
    shown: false,
  };
  items.add(item);
  canvas.width = 0;
  canvas.height = 0;

  return {
    setHover(on, e) {
      if (!items.has(item)) return;
      if (e) onPointerMove(e);
      if (!on) {
        item.target = 0;
        return;
      }
      if (!ensureGL()) {
        item.onFail();
        return;
      }
      if (!active.has(item)) {
        item.fresh = true;
        active.add(item);
      }
      item.target = 1;
      startTicker();
    },
    dispose() {
      if (!items.has(item)) return;
      items.delete(item);
      active.delete(item);
      releaseTexture(item);
      item.ctx = null;
      if (items.size === 0) teardown();
    },
  };
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { FULLSCREEN_VERT, HERO_FRAG } from "./shaders";

const TRANSITION = 1.8; // s
const INCOMING_PREROLL = 3; // s of Ken Burns "age" given to an incoming image
const ORIGINS: [number, number][] = [
  [0.0, 0.0],
  [1.0, 0.35],
  [0.25, 1.0],
  [1.0, 0.0],
  [0.0, 0.6],
];
const PANS: [number, number][] = [
  [1, 0.35],
  [-1, 0.25],
  [0.5, -1],
  [-0.6, -0.5],
];

// Very slow Ken Burns: eases in from 1.0 (matches the <img> fallback exactly) then creeps.
const kbScale = (age: number) => Math.min(1 + 0.04 * (1 - Math.exp(-age / 2.2)) + 0.0045 * age, 1.16);
const kbPan = (i: number, age: number, out: THREE.Vector2) => {
  const [x, y] = PANS[i % PANS.length];
  const a = Math.min(age * 0.0016, 0.03);
  return out.set(x * a, y * a);
};

export default function HeroGL({
  images,
  interval = 6000,
  className,
  onChange,
}: {
  images: { src: string; alt: string }[];
  interval?: number;
  className?: string;
  onChange?: (index: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const first = images[0];
  const srcKey = images.map((i) => i.src).join("\n");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !srcKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const srcs = srcKey.split("\n");

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL → keep the <img>
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
      opacity: "0",
      transition: "opacity 600ms ease",
      pointerEvents: "none",
    } satisfies Partial<CSSStyleDeclaration>);
    root.appendChild(canvas);

    const blank = new THREE.Texture();
    const uniforms = {
      uTexA: { value: blank as THREE.Texture },
      uTexB: { value: blank as THREE.Texture },
      uImgA: { value: new THREE.Vector2(1, 1) },
      uImgB: { value: new THREE.Vector2(1, 1) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uScaleA: { value: 1 },
      uScaleB: { value: 1 },
      uPanA: { value: new THREE.Vector2() },
      uPanB: { value: new THREE.Vector2() },
      uMouse: { value: new THREE.Vector2() },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSeed: { value: 0 },
      uOrigin: { value: new THREE.Vector2() },
      uGrain: { value: 0.022 },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: HERO_FRAG,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(mesh);
    const camera = new THREE.Camera();

    // --- textures (preload all, first one prioritised)
    const textures: (THREE.Texture | null)[] = srcs.map(() => null);
    let disposed = false;
    const loader = new THREE.TextureLoader();
    const load = (i: number) =>
      loader
        .loadAsync(srcs[i])
        .then((tex) => {
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;
          tex.needsUpdate = true;
          renderer.initTexture(tex);
          textures[i] = tex;
          if (i === 0) onFirstReady();
        })
        .catch(() => {
          /* missing image: skipped in the sequence */
        });
    const imgSize = (tex: THREE.Texture, out: THREE.Vector2) => {
      const img = tex.image as { width?: number; height?: number } | undefined;
      return out.set(img?.width || 1, img?.height || 1);
    };

    // --- state
    const ease = gsap.parseEase("expo.inOut");
    const mouseTarget = new THREE.Vector2();
    let clock = 0;
    let last = 0;
    let current = 0;
    let next = -1;
    let ageStartA = 0;
    let ageStartB = 0;
    let shownAt = 0;
    let transStart = -1;
    let ready = false;
    let inView = true;
    let docVisible = document.visibilityState !== "hidden";
    let running = false;
    const intervalS = Math.max(interval, TRANSITION * 1000 + 800) / 1000;

    const resize = () => {
      const w = Math.max(1, root.clientWidth);
      const h = Math.max(1, root.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
      if (ready && !running) renderer.render(scene, camera);
    };

    const startTransition = (to: number) => {
      const tex = textures[to];
      if (!tex) return;
      next = to;
      transStart = clock;
      ageStartB = clock - INCOMING_PREROLL;
      uniforms.uTexB.value = tex;
      imgSize(tex, uniforms.uImgB.value);
      const o = ORIGINS[Math.floor(Math.random() * ORIGINS.length)];
      uniforms.uOrigin.value.set(o[0], o[1]);
      uniforms.uSeed.value = Math.random() * 100;
      onChangeRef.current?.(to);
    };

    const nextLoaded = () => {
      for (let k = 1; k < srcs.length; k++) {
        const i = (current + k) % srcs.length;
        if (textures[i]) return i;
      }
      return -1;
    };

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      clock += dt;

      const m = uniforms.uMouse.value;
      m.lerp(mouseTarget, 1 - Math.exp(-dt * 2.5));

      if (transStart < 0 && srcs.length > 1 && clock - shownAt >= intervalS) {
        const i = nextLoaded();
        if (i >= 0) startTransition(i);
      }
      if (transStart >= 0) {
        const t = (clock - transStart) / TRANSITION;
        if (t >= 1) {
          current = next;
          uniforms.uTexA.value = uniforms.uTexB.value;
          uniforms.uImgA.value.copy(uniforms.uImgB.value);
          ageStartA = ageStartB;
          shownAt = transStart;
          transStart = -1;
          uniforms.uProgress.value = 0;
        } else {
          uniforms.uProgress.value = Math.min(Math.max(ease(t), 0.0001), 0.9999);
        }
      }

      uniforms.uScaleA.value = kbScale(clock - ageStartA);
      kbPan(current, clock - ageStartA, uniforms.uPanA.value);
      if (transStart >= 0) {
        uniforms.uScaleB.value = kbScale(clock - ageStartB);
        kbPan(next, clock - ageStartB, uniforms.uPanB.value);
      }
      uniforms.uTime.value = clock;
      renderer.render(scene, camera);
    };

    const syncRunning = () => {
      const should = ready && inView && docVisible;
      if (should === running) return;
      running = should;
      if (running) {
        last = performance.now();
        gsap.ticker.add(tick);
      } else {
        gsap.ticker.remove(tick);
      }
    };

    function onFirstReady() {
      const tex = textures[0]!;
      uniforms.uTexA.value = tex;
      imgSize(tex, uniforms.uImgA.value);
      ready = true;
      resize();
      renderer.render(scene, camera);
      canvas.style.opacity = "1";
      syncRunning();
    }

    load(0).then(() => {
      for (let i = 1; i < srcs.length; i++) load(i);
    });

    // --- observers / listeners
    const ro = new ResizeObserver(resize);
    ro.observe(root);
    resize();

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        syncRunning();
      },
      { threshold: 0 },
    );
    io.observe(root);

    const onVisibility = () => {
      docVisible = document.visibilityState !== "hidden";
      syncRunning();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mouseTarget.set((e.clientX / window.innerWidth - 0.5) * 2, -(e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      running = false;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      textures.forEach((t) => t?.dispose());
      blank.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [srcKey, interval]);

  return (
    <div ref={rootRef} className={`absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {first && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={first.src}
          alt={first.alt}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

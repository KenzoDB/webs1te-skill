"use client";

import { useEffect, useRef } from "react";
import { canUseDistort, registerDistort } from "./distortRenderer";

export default function DistortImage({
  src,
  alt,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img || !canUseDistort()) return; // CSS hover scale fallback

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
      opacity: "0",
      pointerEvents: "none",
    } satisfies Partial<CSSStyleDeclaration>);
    wrap.appendChild(canvas);
    // GL handles the hover zoom: neutralise the CSS fallback scale.
    img.style.scale = "1";

    let failed = false;
    const restore = () => {
      failed = true;
      canvas.remove();
      img.style.scale = "";
    };
    const handle = registerDistort(wrap, img, canvas, restore);

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch" || failed) return;
      handle.setHover(true, e);
    };
    const onLeave = (e: PointerEvent) => handle.setHover(false, e);
    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerleave", onLeave);
      handle.dispose();
      canvas.remove();
      img.style.scale = "";
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={`group relative h-full w-full overflow-hidden ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.04]"
      />
    </div>
  );
}

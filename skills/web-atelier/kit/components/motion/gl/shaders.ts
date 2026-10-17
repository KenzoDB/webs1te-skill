// GLSL for the Folio WebGL components. Plain ShaderMaterial (three injects
// precision, texture2D→texture shims and linearToOutputTexel for WebGL2).

export const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const NOISE = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}
`;

const COVER = /* glsl */ `
// object-fit: cover (centered) with zoom + offset clamped to available headroom
vec2 coverUv(vec2 uv, vec2 res, vec2 img, float scale, vec2 offset) {
  float rs = res.x / res.y;
  float ri = img.x / img.y;
  vec2 ratio = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  vec2 visible = ratio / scale;
  vec2 room = max((1.0 - visible) * 0.5, vec2(0.0));
  return (uv - 0.5) * visible + 0.5 + clamp(offset, -room, room);
}
`;

export const HERO_FRAG = /* glsl */ `
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform vec2 uImgA;
uniform vec2 uImgB;
uniform vec2 uRes;
uniform float uScaleA;
uniform float uScaleB;
uniform vec2 uPanA;
uniform vec2 uPanB;
uniform vec2 uMouse;
uniform float uProgress;
uniform float uTime;
uniform float uSeed;
uniform vec2 uOrigin;
uniform float uGrain;
varying vec2 vUv;

${NOISE}
${COVER}

void main() {
  vec2 uv = vUv;
  vec2 par = -uMouse * 0.016;
  vec4 col;

  if (uProgress <= 0.0) {
    col = texture2D(uTexA, coverUv(uv, uRes, uImgA, uScaleA, uPanA + par));
  } else if (uProgress >= 1.0) {
    col = texture2D(uTexB, coverUv(uv, uRes, uImgB, uScaleB, uPanB + par));
  } else {
    vec2 asp = vec2(uRes.x / uRes.y, 1.0);
    vec2 p = uv * asp * 1.7 + uSeed;
    // domain-warped fbm: fibrous, paper-like bleed
    vec2 q = vec2(fbm(p + vec2(0.0, uTime * 0.04)), fbm(p + vec2(5.2, 1.3) - uTime * 0.03));
    float n = fbm(p + 2.4 * q);
    // soft directional origin so the ink reads as soaking in from one side
    float g = length((uv - uOrigin) * asp) / length(asp);
    float field = clamp(mix(n * 1.25 - 0.12, g, 0.42), 0.0, 1.0);

    float soft = 0.16;
    float pr = mix(-soft, 1.0 + soft, uProgress);
    float mask = 1.0 - smoothstep(pr - soft, pr + soft, field);
    float edge = clamp(mask * (1.0 - mask) * 4.0, 0.0, 1.0);

    vec2 disp = (q - 0.5) * 2.0;
    vec2 uvA = uv + disp * (0.045 * uProgress + 0.012 * edge);
    vec2 uvB = uv - disp * (0.045 * (1.0 - uProgress) + 0.012 * edge);

    vec4 a = texture2D(uTexA, coverUv(uvA, uRes, uImgA, uScaleA, uPanA + par));
    vec4 b = texture2D(uTexB, coverUv(uvB, uRes, uImgB, uScaleB, uPanB + par));
    col = mix(a, b, mask);
    // damp, slightly darker wet front
    col.rgb *= 1.0 - edge * 0.07;
  }

  gl_FragColor = vec4(col.rgb, 1.0);
  #include <colorspace_fragment>

  // very subtle paper grain (in output space)
  float gr = hash12(gl_FragCoord.xy + floor(uTime * 12.0) * 17.31) - 0.5;
  gl_FragColor.rgb += gr * uGrain;
}
`;

export const DISTORT_FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uImg;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uHover;
uniform float uTime;
varying vec2 vUv;

${COVER}

void main() {
  vec2 uv = vUv;
  float h = uHover * uHover * (3.0 - 2.0 * uHover);
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = (uv - uMouse) * asp;
  float d = length(p);
  float fall = smoothstep(0.5, 0.0, d);
  float speed = clamp(length(uVel), 0.0, 1.0);

  vec2 suv = uv;
  // loupe: pull samples toward the cursor (magnifies around it)
  suv -= (uv - uMouse) * fall * 0.07 * h;
  // ripple, stronger with pointer speed
  float rip = sin(d * 26.0 - uTime * 3.2) * fall * (0.0025 + 0.01 * speed) * h;
  suv += (p / max(d, 1e-4)) / asp * rip;
  // drag along the pointer velocity
  suv -= uVel * fall * 0.018 * h;

  float scale = 1.0 + 0.05 * h;
  vec2 shift = (uVel * 0.005 + (p / asp) * 0.006 * fall) * h;

  float r = texture2D(uTex, coverUv(suv + shift, uRes, uImg, scale, vec2(0.0))).r;
  vec4 c = texture2D(uTex, coverUv(suv, uRes, uImg, scale, vec2(0.0)));
  float b = texture2D(uTex, coverUv(suv - shift, uRes, uImg, scale, vec2(0.0))).b;

  gl_FragColor = vec4(r, c.g, b, 1.0);
  #include <colorspace_fragment>
}
`;

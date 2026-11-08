/*
 * WebGL2 renderer for the background (progressive enhancement).
 *
 * The SSR'd SVG layers in #bg stay the source of truth and the no-JS fallback.
 * When WebGL2 is available, the shapes are read from that DOM once, turned into
 * a list of stroke pieces and drawn into a single canvas with one instanced draw
 * call per frame. Rotations happen in the vertex shader. The fragment shader
 * computes analytic coverage (a 1px box filter across and along each stroke),
 * so circles are exact and dashes have anti-aliased butt ends.
 *
 * Every piece is a small quad that covers a circle arc, a whole small circle, or
 * a straight segment (lines and rect edges), plus a 1 device-pixel margin for AA.
 * All strokes share one colour, so pieces are blended with MAX: overlapping quads
 * (rect corners, arcs split into several pieces) don't darken each other.
 */

// instance kinds
const ARC = 0; // a piece of a circle: geom = cx cy r, seg = θa θb capA capB
const SEGMENT = 1; // straight stroke: geom = x1 y1 x2 y2, seg = extA extB
const DISC = 2; // a whole undashed circle drawn with one bounding quad: geom = cx cy r

const MAX_CHANNELS = 32; // distinct rotations (uniform array size)
const MAX_ARC_LENGTH = 120; // split long arcs into pieces of at most this many units…
const MAX_ARC_ANGLE = 0.2; // …and at most this many radians
const DISC_MAX_RADIUS = 40; // undashed circles up to this radius use a single quad
const FLOATS = 14; // per instance

const VERT = `#version 300 es
layout(location = 0) in vec2 a_corner;
layout(location = 1) in vec4 a_geom;
layout(location = 2) in vec4 a_seg;
layout(location = 3) in vec4 a_info; // kind, layer channel, spinner channel (-1 = none), half width
layout(location = 4) in vec2 a_pivot; // spinner centre

uniform vec2 u_rot[${MAX_CHANNELS}]; // cos, sin per rotation channel
uniform vec2 u_centre; // layer rotation centre (units)
uniform float u_scale; // device px per unit
uniform vec2 u_offset; // device px position of the viewBox origin
uniform vec2 u_res; // canvas size in device px

out vec2 v_p;
flat out vec4 v_geom;
flat out vec4 v_seg;
flat out vec2 v_kind_hw;

vec2 rotate(vec2 p, vec2 cs) {
  // positive angles turn clockwise on screen (y points down), like CSS rotate()
  return vec2(p.x * cs.x - p.y * cs.y, p.x * cs.y + p.y * cs.x);
}

void main() {
  int kind = int(a_info.x);
  float hw = a_info.w;
  float pad = 1.0 / u_scale; // one device pixel, in units
  vec2 p;
  if (kind == ${ARC}) {
    float r = a_geom.z;
    float ext = 1.5 * pad / max(r - hw, pad);
    float ta = a_seg.x - a_seg.z * ext;
    float tb = a_seg.y + a_seg.w * ext;
    // trapezoid around the arc: inner chord inside the inner edge, outer chord tangent to the outer edge
    float rad = a_corner.y < 0.5 ? max(r - hw - pad, 0.0) : (r + hw + pad) / cos(0.5 * (tb - ta));
    float th = mix(ta, tb, a_corner.x);
    p = a_geom.xy + rad * vec2(cos(th), sin(th));
  } else if (kind == ${SEGMENT}) {
    vec2 d = a_geom.zw - a_geom.xy;
    float len = max(length(d), 1e-6);
    vec2 t = d / len;
    vec2 n = vec2(-t.y, t.x);
    float along = mix(-a_seg.x - pad, len + a_seg.y + pad, a_corner.x);
    float across = (a_corner.y * 2.0 - 1.0) * (hw + pad);
    p = a_geom.xy + t * along + n * across;
  } else {
    p = a_geom.xy + (a_corner * 2.0 - 1.0) * (a_geom.z + hw + pad);
  }
  v_p = p;
  v_geom = a_geom;
  v_seg = a_seg;
  v_kind_hw = vec2(a_info.x, hw);

  int spin = int(a_info.z);
  if (spin >= 0) p = a_pivot + rotate(p - a_pivot, u_rot[spin]);
  p = u_centre + rotate(p - u_centre, u_rot[int(a_info.y)]);
  vec2 clip = (u_offset + p * u_scale) / u_res * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_p;
flat in vec4 v_geom;
flat in vec4 v_seg;
flat in vec2 v_kind_hw;
uniform float u_scale;
uniform vec4 u_color; // premultiplied
out vec4 o;

// coverage of the band [lo, hi] by a 1px wide box filter centred at x (all in device px)
float band(float x, float lo, float hi) {
  return clamp(min(x + 0.5, hi) - max(x - 0.5, lo), 0.0, 1.0);
}

void main() {
  int kind = int(v_kind_hw.x);
  float hw = v_kind_hw.y * u_scale;
  float cov;
  if (kind == ${SEGMENT}) {
    vec2 d = v_geom.zw - v_geom.xy;
    float len = max(length(d), 1e-6);
    vec2 t = d / len;
    vec2 q = (v_p - v_geom.xy) * u_scale;
    cov = band(dot(q, vec2(-t.y, t.x)), -hw, hw)
        * band(dot(q, t), -v_seg.x * u_scale, (len + v_seg.y) * u_scale);
  } else {
    vec2 q = v_p - v_geom.xy;
    float dist = length(q);
    cov = band((dist - v_geom.z) * u_scale, -hw, hw);
    if (kind == ${ARC} && v_seg.z + v_seg.w > 0.0) {
      // butt ends of a dash are radial lines; measure along the arc through this pixel
      float mid = 0.5 * (v_seg.x + v_seg.y);
      vec2 m = vec2(cos(mid), sin(mid));
      float x = atan(m.x * q.y - m.y * q.x, dot(m, q)) * dist * u_scale;
      float span = 0.5 * (v_seg.y - v_seg.x) * dist * u_scale;
      cov *= band(x, v_seg.z > 0.0 ? -span : -1e9, v_seg.w > 0.0 ? span : 1e9);
    }
  }
  if (cov <= 0.0) discard;
  o = u_color * cov;
}`;

type Channel = { period: number; dir: number };
type Scene = ReturnType<typeof extract>;

class Unsupported extends Error {}

const now = () => performance.timeOrigin + performance.now();

const parseDashes = (value: string, percentBase: number) => {
  if (!value || value === "none") return null;
  let dashes = value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((p) =>
      p.endsWith("%") ? (parseFloat(p) * percentBase) / 100 : parseFloat(p),
    );
  if (dashes.some((d) => !(d >= 0)) || dashes.reduce((a, b) => a + b, 0) <= 0)
    return null;
  if (dashes.length % 2) dashes = [...dashes, ...dashes];
  return dashes;
};

/** Dash intervals [start, end] along a path of the given length (stroke-dashoffset 0). */
const dashIntervals = (length: number, dashes: number[] | null) => {
  if (!dashes) return [[0, length]];
  const out: number[][] = [];
  for (let s = 0, i = 0; s < length; i = (i + 1) % dashes.length) {
    const end = Math.min(s + dashes[i], length);
    if (i % 2 === 0 && end > s) out.push([s, end]);
    s += dashes[i];
  }
  return out;
};

/** Reads the SSR'd SVG layers and builds the instance data. */
function extract(bg: HTMLElement) {
  const channels: Channel[] = [{ period: Infinity, dir: 1 }];
  const channel = (el: HTMLElement) => {
    const period = parseFloat(el.style.getPropertyValue("--period"));
    const dir = el.classList.contains("reverse") ? -1 : 1;
    let i = channels.findIndex((c) => c.period === period && c.dir === dir);
    if (i < 0) i = channels.push({ period, dir }) - 1;
    if (i >= MAX_CHANNELS) throw new Unsupported("too many rotation speeds");
    return i;
  };

  const data: number[] = [];
  let viewBox = 0;

  const shapes = (
    svg: SVGSVGElement,
    layer: number,
    spin = -1,
    pivot = [0, 0],
  ) => {
    const vb = svg.viewBox.baseVal;
    if (vb.width !== vb.height || (viewBox && vb.width !== viewBox))
      throw new Unsupported("mismatched viewBox");
    viewBox = vb.width;
    const percentBase = Math.hypot(vb.width, vb.height) / Math.SQRT2;
    for (const el of svg.querySelectorAll<SVGGraphicsElement>("*")) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.stroke === "none") continue;
      const hw = parseFloat(style.strokeWidth) / 2;
      const dashes = parseDashes(style.strokeDasharray, percentBase);
      const m = el.transform.baseVal.consolidate()?.matrix ?? new DOMMatrix();
      if (Math.abs(m.a * m.d - m.b * m.c - 1) > 1e-3)
        throw new Unsupported("scaled transform");
      const tx = (x: number, y: number) => [
        m.a * x + m.c * y + m.e,
        m.b * x + m.d * y + m.f,
      ];
      const push = (kind: number, geom: number[], seg: number[]) =>
        data.push(...geom, ...seg, kind, layer, spin, hw, ...pivot);
      const segment = (a: number[], b: number[], ext: number) => {
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const at = (s: number) => [
          a[0] + ((b[0] - a[0]) * s) / len,
          a[1] + ((b[1] - a[1]) * s) / len,
        ];
        for (const [s0, s1] of dashIntervals(len, dashes))
          push(SEGMENT, [...at(s0), ...at(s1)], [ext, ext, 0, 0]);
      };

      if (el instanceof SVGCircleElement) {
        const c = tx(el.cx.baseVal.value, el.cy.baseVal.value);
        const r = el.r.baseVal.value;
        if (!dashes && r <= DISC_MAX_RADIUS) {
          push(DISC, [...c, r, 0], [0, 0, 0, 0]);
          continue;
        }
        // SVG circles start at 3 o'clock and run clockwise (towards +y). The
        // transform's rotation would only move where dashes start, so add it.
        const start = Math.atan2(m.b, m.a);
        // only the real ends of a dash are clipped; joins between pieces aren't
        const cap = dashes ? 1 : 0;
        for (const [s0, s1] of dashIntervals(2 * Math.PI * r, dashes)) {
          const n = Math.ceil(
            Math.max((s1 - s0) / MAX_ARC_LENGTH, (s1 - s0) / r / MAX_ARC_ANGLE),
          );
          const angle = (k: number) => start + (s0 + ((s1 - s0) * k) / n) / r;
          for (let k = 0; k < n; k++)
            push(
              ARC,
              [...c, r, 0],
              [
                angle(k),
                angle(k + 1),
                k === 0 ? cap : 0,
                k === n - 1 ? cap : 0,
              ],
            );
        }
      } else if (el instanceof SVGLineElement) {
        const ext = style.strokeLinecap === "butt" ? 0 : hw;
        segment(
          tx(el.x1.baseVal.value, el.y1.baseVal.value),
          tx(el.x2.baseVal.value, el.y2.baseVal.value),
          ext,
        );
      } else if (el instanceof SVGRectElement) {
        if (dashes || el.rx.baseVal.value || el.ry.baseVal.value)
          throw new Unsupported("dashed or rounded rect");
        const [x, y, w, h] = [el.x, el.y, el.width, el.height].map(
          (v) => v.baseVal.value,
        );
        const p = [tx(x, y), tx(x + w, y), tx(x + w, y + h), tx(x, y + h)];
        // extending each side by half the stroke width reproduces the 90° miter joins
        for (let i = 0; i < 4; i++) segment(p[i], p[(i + 1) % 4], hw);
      } else {
        throw new Unsupported(`unsupported element <${el.tagName}>`);
      }
    }
  };

  for (const child of bg.children) {
    if (child instanceof SVGSVGElement) shapes(child, 0);
    if (!(child instanceof HTMLElement && child.classList.contains("layer")))
      continue;
    const layer = channel(child);
    for (const sub of child.children) {
      if (sub instanceof SVGSVGElement) shapes(sub, layer);
      if (!(sub instanceof HTMLElement && sub.classList.contains("spinner")))
        continue;
      const svg = sub.querySelector("svg")!;
      const origin = (sub.style.transformOrigin || "50% 50%")
        .split(" ")
        .slice(0, 2); // Firefox appends z
      if (!origin.every((o) => o.endsWith("%")))
        throw new Unsupported("transform-origin must be in %");
      const size = svg.viewBox.baseVal.width;
      shapes(
        svg,
        layer,
        channel(sub),
        origin.map((o) => (parseFloat(o) / 100) * size),
      );
    }
  }
  return { instances: new Float32Array(data), channels, viewBox };
}

/** The stroke colour of #bg, premultiplied. */
function strokeColor(bg: HTMLElement) {
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.fillStyle = getComputedStyle(bg).stroke;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r * a, g * a, b * a, a * 255].map((v) => v / 255 / 255);
}

function compile(gl: WebGL2RenderingContext) {
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
    return s;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program) ?? "link error");
  return program;
}

/** Uploads the scene and sets up GL state. Returns a function that draws one frame at time t (seconds). */
function createRenderer(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  bg: HTMLElement,
  scene: Scene,
) {
  const program = compile(gl);
  const u = Object.fromEntries(
    ["u_rot", "u_centre", "u_scale", "u_offset", "u_res", "u_color"].map(
      (n) => [n, gl.getUniformLocation(program, n)],
    ),
  );
  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, scene.instances, gl.STATIC_DRAW);
  [4, 4, 4, 2].reduce((offset, size, i) => {
    gl.enableVertexAttribArray(i + 1);
    gl.vertexAttribPointer(
      i + 1,
      size,
      gl.FLOAT,
      false,
      FLOATS * 4,
      offset * 4,
    );
    gl.vertexAttribDivisor(i + 1, 1);
    return offset + size;
  }, 0);
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.MAX);
  gl.clearColor(0, 0, 0, 0);

  const count = scene.instances.length / FLOATS;
  const centre = scene.viewBox / 2;
  const rotations = new Float32Array(MAX_CHANNELS * 2);

  return (t: number, color: number[]) => {
    const dpr = devicePixelRatio || 1;
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const c = canvas.getBoundingClientRect();
    const b = bg.getBoundingClientRect();
    const px = w / (c.width || 1); // device px per CSS px
    scene.channels.forEach(({ period, dir }, i) => {
      // reduce in double precision so angles stay exact after a long time
      const a = isFinite(period) ? 2 * Math.PI * ((t / period) % 1) * dir : 0;
      rotations[i * 2] = Math.cos(a);
      rotations[i * 2 + 1] = Math.sin(a);
    });
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2fv(u.u_rot, rotations);
    gl.uniform2f(u.u_centre, centre, centre);
    gl.uniform1f(u.u_scale, (b.width / scene.viewBox) * px);
    // browsers snap the SVG layers' origin to whole device pixels; do the same so lines land identically
    gl.uniform2f(
      u.u_offset,
      Math.round((b.left - c.left) * px),
      Math.round((b.top - c.top) * px),
    );
    gl.uniform2f(u.u_res, w, h);
    gl.uniform4fv(u.u_color, color);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
  };
}

export function start() {
  const root = document.documentElement;
  const canvas = document.getElementById("bg-gl") as HTMLCanvasElement | null;
  const bg = document.getElementById("bg");
  if (!canvas || !bg) return;

  let scene: Scene;
  let gl: WebGL2RenderingContext | null;
  try {
    scene = extract(bg);
    gl = canvas.getContext("webgl2", {
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Unsupported("no WebGL2");
  } catch (e) {
    // the CSS layers simply stay
    if (e instanceof Unsupported)
      console.info("[bg] using the CSS background:", e.message);
    else console.error(e);
    return;
  }
  const context = gl;
  let draw = createRenderer(context, canvas, bg, scene);

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  // shared with the CSS layers' animation-delay, see the clock script in Background.astro
  const startTime = +(root.dataset.bgStart ?? "") || now();
  let color = strokeColor(bg);
  let frozen: number | null = null; // fixed time in seconds (testing hook)
  let dirty = true; // size or colour changed
  let lost = false;
  let frame = 0;

  const tick = () => {
    frame = 0;
    if (lost) return;
    const moving = !reducedMotion.matches;
    const animate = moving && frozen === null;
    if (animate || dirty)
      draw(frozen ?? (moving ? (now() - startTime) / 1000 : 0), color);
    dirty = false;
    if (animate) frame = requestAnimationFrame(tick);
  };
  const invalidate = () => {
    dirty = true;
    frame ||= requestAnimationFrame(tick);
  };

  addEventListener("resize", invalidate);
  new ResizeObserver(invalidate).observe(bg);
  reducedMotion.addEventListener("change", invalidate);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    color = strokeColor(bg);
    invalidate();
  });
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    lost = true;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    lost = false;
    draw = createRenderer(context, canvas, bg, scene);
    invalidate();
  });

  // testing hook: freeze the background at a time in seconds (null resumes)
  (window as any).__bgFreeze = (t: number | null) => {
    frozen = t;
    invalidate();
  };

  // Draw the first frame, then hide the CSS layers in the same task: the next
  // rendered frame shows the canvas instead of the layers, in the same pose.
  tick();
  root.classList.add("bg-gl");
}

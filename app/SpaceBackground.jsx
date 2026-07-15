"use client";

import { useEffect, useRef } from "react";

/**
 * Deep-space star-trail background (long-exposure / circumpolar style).
 * Trails arc around a celestial pole; slow rotation; theme-aware intensity.
 */
export default function SpaceBackground({ mousePos, theme = "dark" }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const themeRef = useRef(theme);

  useEffect(() => {
    mouseRef.current = mousePos || { x: 0, y: 0 };
  }, [mousePos]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let reducedMotion = false;

    const rand = (a, b) => a + Math.random() * (b - a);

    /**
     * Each trail is a star fixed on a circle around the pole.
     * @type {{
     *  r: number, theta: number, arc: number, speed: number,
     *  width: number, bright: number, hue: number, sat: number, light: number
     * }[]}
     */
    let trails = [];
    /** sparse distant pinpoints (no trail) */
    let sparks = [];
    let pole = { x: 0, y: 0 };
    let t = 0;

    const rebuild = () => {
      // Pole slightly upper-center — like a tilted celestial pole photo
      pole = {
        x: w * 0.52,
        y: h * 0.28,
      };
      const maxR = Math.hypot(Math.max(pole.x, w - pole.x), Math.max(pole.y, h - pole.y)) * 1.05;
      const count = Math.min(420, Math.floor((w * h) / 4200));

      trails = Array.from({ length: count }, () => {
        // denser slightly away from pole, thinner near center
        const u = Math.random();
        const r = Math.pow(u, 0.72) * maxR * (0.08 + 0.92 * Math.random());
        // longer arcs farther out (classic star-trail look)
        const arc = rand(0.35, 1.15) * (0.55 + (r / maxR) * 0.9);
        // warm white / cool blue mix like the reference
        const cool = Math.random() < 0.55;
        return {
          r,
          theta: Math.random() * Math.PI * 2,
          arc,
          speed: rand(0.012, 0.038) * (0.7 + (r / maxR) * 0.5), // rad/s visual
          width: rand(0.55, 1.65) * (0.85 + (r / maxR) * 0.4),
          bright: rand(0.35, 1),
          hue: cool ? rand(200, 225) : rand(25, 45),
          sat: cool ? rand(35, 70) : rand(45, 85),
          light: cool ? rand(72, 92) : rand(68, 88),
        };
      });

      sparks = Array.from({ length: Math.floor(count * 0.25) }, () => ({
        r: rand(maxR * 0.1, maxR),
        theta: Math.random() * Math.PI * 2,
        size: rand(0.4, 1.2),
        a: rand(0.15, 0.55),
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuild();
    };

    const drawTrail = (tr, cx, cy, dark, globalA) => {
      // a0 = bright head (current angle); a1 = faded tail
      const a0 = tr.theta;
      const a1 = tr.theta - tr.arc;
      const headX = cx + Math.cos(a0) * tr.r;
      const headY = cy + Math.sin(a0) * tr.r;
      const tailX = cx + Math.cos(a1) * tr.r;
      const tailY = cy + Math.sin(a1) * tr.r;
      const a = tr.bright * globalA;

      const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
      if (dark) {
        grad.addColorStop(0, `hsla(${tr.hue}, ${tr.sat}%, ${tr.light}%, 0)`);
        grad.addColorStop(0.4, `hsla(${tr.hue}, ${tr.sat}%, ${tr.light}%, ${a * 0.22})`);
        grad.addColorStop(0.8, `hsla(${tr.hue}, ${tr.sat + 5}%, ${Math.min(96, tr.light + 6)}%, ${a * 0.72})`);
        grad.addColorStop(1, `hsla(${tr.hue}, 15%, 98%, ${Math.min(1, a)})`);
      } else {
        grad.addColorStop(0, `hsla(${tr.hue + 10}, 40%, 40%, 0)`);
        grad.addColorStop(0.5, `hsla(${tr.hue}, 45%, 42%, ${a * 0.18})`);
        grad.addColorStop(1, `hsla(${tr.hue}, 50%, 35%, ${a * 0.5})`);
      }

      ctx.strokeStyle = grad;
      ctx.lineWidth = tr.width;
      ctx.lineCap = "round";
      ctx.beginPath();
      // canvas arc: counterclockwise from a1 → a0 when a0 > a1 in math... 
      // angles increase CCW; trail goes backward so draw from a1 to a0
      ctx.arc(cx, cy, tr.r, a1, a0, false);
      ctx.stroke();

      if (dark && tr.bright > 0.55) {
        const glow = ctx.createRadialGradient(headX, headY, 0, headX, headY, tr.width * 5);
        glow.addColorStop(0, `hsla(${tr.hue}, 40%, 96%, ${a * 0.5})`);
        glow.addColorStop(1, `hsla(${tr.hue}, 40%, 80%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(headX, headY, tr.width * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw = () => {
      if (!running) return;
      const dt = 0.016;
      t += dt;
      const dark = themeRef.current !== "light";

      // subtle pole drift with mouse (parallax)
      const mx = mouseRef.current.x || w / 2;
      const my = mouseRef.current.y || h / 2;
      const px = (mx / w - 0.5) * 2;
      const py = (my / h - 0.5) * 2;
      const cx = pole.x + px * 22;
      const cy = pole.y + py * 16;

      ctx.clearRect(0, 0, w, h);

      // Deep night sky wash (navy → black, like the reference)
      const sky = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.95);
      if (dark) {
        sky.addColorStop(0, "rgba(12, 24, 72, 0.55)");
        sky.addColorStop(0.35, "rgba(4, 10, 36, 0.5)");
        sky.addColorStop(0.7, "rgba(2, 4, 16, 0.35)");
        sky.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        sky.addColorStop(0, "rgba(165, 180, 252, 0.22)");
        sky.addColorStop(0.5, "rgba(199, 210, 254, 0.12)");
        sky.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Soft vignette toward edges
      const vig = ctx.createRadialGradient(w * 0.5, h * 0.45, Math.min(w, h) * 0.2, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
      if (dark) {
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, "rgba(0,0,0,0.55)");
      } else {
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, "rgba(30, 27, 75, 0.06)");
      }
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      const globalA = dark ? 0.95 : 0.5;

      // Draw trails
      ctx.save();
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      for (const tr of trails) {
        if (!reducedMotion) {
          tr.theta += tr.speed * dt;
        }
        drawTrail(tr, cx, cy, dark, globalA);
      }
      ctx.restore();

      // Tiny stationary-ish sparkle stars (very short trails / points)
      for (const s of sparks) {
        const ang = s.theta + (reducedMotion ? 0 : t * 0.008);
        const x = cx + Math.cos(ang) * s.r;
        const y = cy + Math.sin(ang) * s.r;
        ctx.fillStyle = dark
          ? `rgba(220, 230, 255, ${s.a * globalA})`
          : `rgba(67, 56, 202, ${s.a * 0.45})`;
        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pole glow (subtle)
      if (dark) {
        const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
        pg.addColorStop(0, "rgba(180, 200, 255, 0.08)");
        pg.addColorStop(0.5, "rgba(80, 120, 220, 0.04)");
        pg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(cx, cy, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="space-nebula pointer-events-none fixed inset-0 z-0 overflow-hidden"
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
      />
    </>
  );
}

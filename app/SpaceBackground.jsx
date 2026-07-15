"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas starfield + nebula + occasional shooting stars.
 * Parallax follows mouse; intensity adapts to light/dark theme.
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

    const rand = (a, b) => a + Math.random() * (b - a);

    /** @type {{x:number,y:number,z:number,r:number,base:number,phase:number,twinkle:number,hue:number}[]} */
    let stars = [];
    /** @type {{x:number,y:number,vx:number,vy:number,life:number,max:number,len:number}[]} */
    let meteors = [];
    let t = 0;
    let nextMeteor = 2;

    const rebuildStars = () => {
      const count = Math.min(280, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(), // depth 0..1 (near = 1)
        r: rand(0.4, 1.8),
        base: rand(0.35, 0.95),
        phase: Math.random() * Math.PI * 2,
        twinkle: rand(0.6, 2.2),
        hue: Math.random() < 0.12 ? rand(200, 260) : rand(0, 40),
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
      rebuildStars();
    };

    const spawnMeteor = () => {
      const fromLeft = Math.random() > 0.35;
      const x = fromLeft ? rand(-40, w * 0.4) : rand(w * 0.3, w + 40);
      const y = rand(-30, h * 0.35);
      const speed = rand(8, 16);
      const angle = fromLeft ? rand(0.25, 0.55) : rand(Math.PI - 0.55, Math.PI - 0.25);
      meteors.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        max: rand(28, 55),
        len: rand(60, 140),
      });
    };

    const draw = () => {
      if (!running) return;
      t += 0.016;
      const dark = themeRef.current !== "light";
      const mx = mouseRef.current.x || w / 2;
      const my = mouseRef.current.y || h / 2;
      const px = (mx / w - 0.5) * 2; // -1..1
      const py = (my / h - 0.5) * 2;

      ctx.clearRect(0, 0, w, h);

      // Deep space gradient wash
      const g = ctx.createRadialGradient(
        w * (0.5 + px * 0.08),
        h * (0.35 + py * 0.06),
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.85
      );
      if (dark) {
        g.addColorStop(0, "rgba(40, 20, 80, 0.45)");
        g.addColorStop(0.35, "rgba(10, 8, 30, 0.35)");
        g.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        g.addColorStop(0, "rgba(165, 180, 252, 0.28)");
        g.addColorStop(0.4, "rgba(196, 181, 253, 0.14)");
        g.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Secondary nebula blob
      const g2 = ctx.createRadialGradient(
        w * (0.78 - px * 0.05),
        h * (0.72 - py * 0.04),
        0,
        w * 0.78,
        h * 0.72,
        Math.max(w, h) * 0.45
      );
      if (dark) {
        g2.addColorStop(0, "rgba(80, 40, 140, 0.22)");
        g2.addColorStop(0.5, "rgba(20, 60, 120, 0.08)");
        g2.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        g2.addColorStop(0, "rgba(129, 140, 248, 0.16)");
        g2.addColorStop(0.55, "rgba(244, 114, 182, 0.06)");
        g2.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Stars
      const starAlpha = dark ? 1 : 0.55;
      for (const s of stars) {
        const depth = 0.25 + s.z * 0.75;
        const ox = px * 18 * depth;
        const oy = py * 14 * depth;
        const tw =
          s.base *
          (0.55 + 0.45 * Math.sin(t * s.twinkle + s.phase)) *
          starAlpha;
        const x = s.x + ox;
        const y = s.y + oy;
        const r = s.r * (0.7 + depth * 0.5);

        // soft glow for brighter stars
        if (s.base > 0.7 && dark) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
          glow.addColorStop(0, `hsla(${s.hue}, 80%, 80%, ${tw * 0.35})`);
          glow.addColorStop(1, "hsla(0, 0%, 100%, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, r * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = dark
          ? `hsla(${s.hue}, 70%, 92%, ${tw})`
          : `hsla(${s.hue + 200}, 40%, 35%, ${tw * 0.7})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Meteors
      nextMeteor -= 0.016;
      if (nextMeteor <= 0 && meteors.length < 2) {
        spawnMeteor();
        nextMeteor = rand(4, 12);
      }

      meteors = meteors.filter((m) => {
        m.life += 1;
        m.x += m.vx;
        m.y += m.vy;
        const fade = 1 - m.life / m.max;
        if (fade <= 0) return false;

        const tailX = m.x - m.vx * (m.len / 12);
        const tailY = m.y - m.vy * (m.len / 12);
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        if (dark) {
          grad.addColorStop(0, "rgba(180, 160, 255, 0)");
          grad.addColorStop(0.6, `rgba(200, 180, 255, ${0.35 * fade})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${0.9 * fade})`);
        } else {
          grad.addColorStop(0, "rgba(99, 102, 241, 0)");
          grad.addColorStop(0.6, `rgba(129, 140, 248, ${0.25 * fade})`);
          grad.addColorStop(1, `rgba(67, 56, 202, ${0.55 * fade})`);
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = dark ? 1.6 : 1.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.fillStyle = dark
          ? `rgba(255,255,255,${fade})`
          : `rgba(79,70,229,${0.7 * fade})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      raf = requestAnimationFrame(draw);
    };

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
      {/* CSS nebula base layer */}
      <div
        aria-hidden
        className="space-nebula pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="nebula nebula-a" />
        <div className="nebula nebula-b" />
        <div className="nebula nebula-c" />
        <div className="space-grid" />
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
      />
    </>
  );
}

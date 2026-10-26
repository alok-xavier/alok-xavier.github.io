import React, {useEffect, useRef} from 'react';
import {useInView, useReducedMotion} from '@site/src/lib/hooks';
import styles from './styles.module.css';

/**
 * Night road in the rain. The pointer is the headlight: drops inside the
 * beam light up amber. Without a pointer the beam drifts on its own.
 */
export default function RainRide() {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const light = useRef({x: 0.5, y: 0.55, user: false});
  const inView = useInView(wrap);
  const reduced = useReducedMotion();

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(); // resizing clears the canvas, so paint a frame straight away
    }

    const drops = Array.from({length: 220}, () => ({
      x: Math.random(),
      y: Math.random(),
      l: 8 + Math.random() * 14,
      v: 0.5 + Math.random() * 0.6,
    }));

    function draw() {
      if (!w || !h) return;
      if (!light.current.user) {
        light.current.x = 0.5 + Math.sin(t / 140) * 0.28;
        light.current.y = 0.58 + Math.sin(t / 90) * 0.06;
      }
      const lx = light.current.x * w;
      const ly = light.current.y * h;

      ctx.fillStyle = '#12162b';
      ctx.fillRect(0, 0, w, h);

      // Road in perspective
      const horizon = h * 0.38;
      ctx.fillStyle = '#1b2040';
      ctx.beginPath();
      ctx.moveTo(w * 0.47, horizon);
      ctx.lineTo(w * 0.53, horizon);
      ctx.lineTo(w * 1.05, h);
      ctx.lineTo(-w * 0.05, h);
      ctx.closePath();
      ctx.fill();

      // Moving centre-line dashes
      ctx.strokeStyle = 'rgba(245,181,68,.55)';
      for (let i = 0; i < 8; i++) {
        const p = ((i / 8 + (reduced ? 0 : t * 0.006)) % 1) ** 2;
        const y0 = horizon + p * (h - horizon);
        const len = 4 + p * 26;
        ctx.lineWidth = 1 + p * 4;
        ctx.beginPath();
        ctx.moveTo(w / 2, y0);
        ctx.lineTo(w / 2, Math.min(h, y0 + len));
        ctx.stroke();
      }

      // Headlight beam
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(w, h) * 0.45);
      g.addColorStop(0, 'rgba(255,231,176,.28)');
      g.addColorStop(1, 'rgba(255,231,176,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Rain
      ctx.lineCap = 'round';
      for (const d of drops) {
        if (!reduced) {
          d.y += (d.v * 9) / h;
          d.x -= (d.v * 2.2) / w;
          if (d.y > 1) {
            d.y = -0.05;
            d.x = Math.random() * 1.1;
          }
          if (d.x < -0.05) d.x = 1.05;
        }
        const x = d.x * w;
        const y = d.y * h;
        const dist = Math.hypot(x - lx, y - ly) / (Math.max(w, h) * 0.32);
        const glow = Math.max(0, 1 - dist);
        ctx.strokeStyle = glow > 0.02 ? `rgba(255,${200 + glow * 40},${120 + glow * 80},${0.18 + glow * 0.75})` : 'rgba(150,160,200,.16)';
        ctx.lineWidth = 1 + glow;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - d.l * 0.25, y + d.l);
        ctx.stroke();
      }

    }

    function frame() {
      t += 1;
      draw();
      if (!reduced && inView) raf = requestAnimationFrame(frame);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    frame();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView, reduced]);

  function move(e) {
    const r = canvas.current.getBoundingClientRect();
    light.current = {x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, user: true};
  }

  return (
    <div className={styles.toy} ref={wrap}>
      <div className={styles.stage}>
        <canvas
          ref={canvas}
          className={styles.rainCanvas}
          onPointerMove={move}
          onPointerLeave={() => (light.current.user = false)}
          aria-label="Animated night road in the rain; your pointer is the headlight"
          role="img"
        />
      </div>
      <div className={styles.controls}>
        <span className={styles.stat}>Move your pointer to steer the headlight.</span>
      </div>
    </div>
  );
}

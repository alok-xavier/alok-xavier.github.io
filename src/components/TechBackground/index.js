import React, {useEffect, useRef} from 'react';
import {useReducedMotion} from '@site/src/lib/hooks';
import styles from './styles.module.css';

/**
 * A fixed canvas behind the page: tool names and commands drift around like
 * services in a cluster. Nearby ones link up, packets of "traffic" travel
 * the links, and the pointer pushes them away and lights up its own links.
 */

const CATS = {
  container: '#2f5db0',
  cloud: '#c98a1b',
  iac: '#7b5cc4',
  observe: '#2f8a52',
  ci: '#c63a32',
  ai: '#c2477f',
  shell: '#555b72',
};

const TOKENS = [
  ['kubernetes', 'container'],
  ['kubectl get pods', 'container'],
  ['docker', 'container'],
  ['docker build .', 'container'],
  ['helm', 'container'],
  ['eks', 'container'],
  ['aws', 'cloud'],
  ['aws s3 ls', 'cloud'],
  ['ec2', 'cloud'],
  ['lambda', 'cloud'],
  ['cloudfront', 'cloud'],
  ['gcp', 'cloud'],
  ['terraform', 'iac'],
  ['terraform plan', 'iac'],
  ['ansible', 'iac'],
  ['prometheus', 'observe'],
  ['grafana', 'observe'],
  ['cloudwatch', 'observe'],
  ['dynatrace', 'observe'],
  ['splunk', 'observe'],
  ['argo cd', 'ci'],
  ['jenkins', 'ci'],
  ['git push', 'ci'],
  ['github actions', 'ci'],
  ['gemini', 'ai'],
  ['python', 'ai'],
  ['scikit-learn', 'ai'],
  ['bash', 'shell'],
  ['linux', 'shell'],
  ['ssh', 'shell'],
];

const LINK = 165; // px: tokens closer than this connect
const REACH = 230; // px: pointer links to tokens inside this radius
const PUSH = 120; // px: pointer pushes tokens inside this radius

export default function TechBackground() {
  const canvas = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let lastScroll = window.scrollY;
    const pointer = {x: -9999, y: -9999};
    const packets = [];

    const count = window.innerWidth < 700 ? 14 : TOKENS.length;
    const nodes = TOKENS.slice(0, count).map(([label, cat]) => {
      const z = 0.55 + Math.random() * 0.45;
      return {
        label,
        color: CATS[cat],
        z,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        width: 0,
      };
    });

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes.forEach((n) => {
        ctx.font = `600 ${Math.round(12 + n.z * 3)}px "Archivo Variable", Archivo, sans-serif`;
        n.width = ctx.measureText(n.label).width + 22;
        n.x = Math.min(n.x, w);
        n.y = Math.min(n.y, h);
      });
      if (reduced) draw();
    }

    function pill(n) {
      const fs = Math.round(12 + n.z * 3);
      const ph = fs + 12;
      const x = n.x - n.width / 2;
      const y = n.y - ph / 2;
      const near = Math.hypot(n.x - pointer.x, n.y - pointer.y) < REACH;
      ctx.globalAlpha = near ? 0.9 : 0.1 + n.z * 0.16;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.strokeStyle = n.color;
      ctx.lineWidth = near ? 1.6 : 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, n.width, ph, ph / 2);
      else ctx.rect(x, y, n.width, ph);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(x + 10, n.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#161b33';
      ctx.font = `600 ${fs}px "Archivo Variable", Archivo, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, x + 17, n.y + 1);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';

      // links between nearby services
      const edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            edges.push([a, b]);
            ctx.globalAlpha = (1 - d / LINK) * 0.14;
            ctx.strokeStyle = '#555b72';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // pointer acts like a new service joining the mesh
      nodes.forEach((n) => {
        const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
        if (d < REACH) {
          ctx.globalAlpha = (1 - d / REACH) * 0.8;
          ctx.strokeStyle = '#f5b544';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      });

      // traffic
      if (!reduced && edges.length && packets.length < 14 && Math.random() < 0.08) {
        const [a, b] = edges[Math.floor(Math.random() * edges.length)];
        packets.push(Math.random() < 0.5 ? {a, b, t: 0} : {a: b, b: a, t: 0});
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += 0.018;
        if (p.t >= 1) {
          packets.splice(i, 1);
          continue;
        }
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.globalAlpha = Math.sin(p.t * Math.PI) * 0.7;
        ctx.fillStyle = '#f5b544';
        ctx.beginPath();
        ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      nodes.forEach(pill);
      ctx.globalAlpha = 1;
    }

    function step() {
      const scroll = window.scrollY;
      const ds = scroll - lastScroll;
      lastScroll = scroll;
      nodes.forEach((n) => {
        // pointer pushes
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < PUSH && d > 0.01) {
          const f = (1 - d / PUSH) * 0.6;
          n.vx += (dx / d) * f;
          n.vy += (dy / d) * f;
        }
        // gentle drift, friction, speed cap
        n.vx = (n.vx + (Math.random() - 0.5) * 0.02) * 0.97;
        n.vy = (n.vy + (Math.random() - 0.5) * 0.02) * 0.97;
        const sp = Math.hypot(n.vx, n.vy);
        const min = 0.12 * n.z;
        if (sp < min) {
          n.vx += (n.vx / (sp || 1)) * 0.02 + (Math.random() - 0.5) * 0.02;
          n.vy += (n.vy / (sp || 1)) * 0.02;
        }
        n.x += n.vx * n.z;
        n.y += n.vy * n.z - ds * (1 - n.z) * 0.35; // depth parallax on scroll
        // wrap around the viewport
        const m = 80;
        if (n.x < -m) n.x = w + m;
        if (n.x > w + m) n.x = -m;
        if (n.y < -m) n.y = h + m;
        if (n.y > h + m) n.y = -m;
      });
      draw();
      raf = requestAnimationFrame(step);
    }

    function onMove(e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
    function onLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, {passive: true});
    document.addEventListener('pointerleave', onLeave);
    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(step);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  return <canvas ref={canvas} className={styles.bg} aria-hidden="true" />;
}

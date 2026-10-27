import React, {useRef} from 'react';
import {useGsap} from '@site/src/lib/motion';
import {PATHS, VIEWBOX} from './paths';
import styles from './styles.module.css';

/**
 * Alok's signature as pen strokes that draw themselves.
 * trigger="load": draws after `delay` seconds (a number, or a function read at mount).
 * trigger="view": draws when scrolled into view.
 */
export default function Signature({trigger = 'view', delay = 0, duration = 1.6, color = 'currentColor', strokeWidth = 11, className = '', label = 'Alok Xavier’s signature'}) {
  const svg = useRef(null);

  useGsap(
    svg,
    (gsap, ScrollTrigger, reduced) => {
      const paths = Array.from(svg.current.querySelectorAll('path'));
      const lengths = paths.map((p) => p.getTotalLength());
      paths.forEach((p, i) => {
        p.style.strokeDasharray = `${lengths[i]} ${lengths[i]}`;
        p.style.strokeDashoffset = reduced ? '0' : String(lengths[i]);
      });
      gsap.set(svg.current, {visibility: 'visible'});
      if (reduced) return;
      const total = lengths.reduce((a, b) => a + b, 0);
      const tl = gsap.timeline({paused: true, delay: typeof delay === 'function' ? delay() : delay});
      paths.forEach((p, i) => {
        tl.to(p, {strokeDashoffset: 0, duration: Math.max(0.04, (lengths[i] / total) * duration), ease: 'none'});
      });
      if (trigger === 'view') {
        ScrollTrigger.create({trigger: svg.current, start: 'top 85%', once: true, onEnter: () => tl.play()});
      } else {
        tl.play();
      }
    },
    [trigger, delay, duration],
  );

  return (
    <svg
      ref={svg}
      viewBox={VIEWBOX}
      className={`${styles.sig} ${className}`}
      role="img"
      aria-label={label}
      style={{visibility: 'hidden'}} /* shown once the stroke animation is set up, so it never flashes fully drawn */
    >
      {PATHS.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

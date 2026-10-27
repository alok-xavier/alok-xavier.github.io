import React, {Suspense, useEffect, useRef, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {AnimatePresence, motion} from 'framer-motion';
import {hasWebGL, useInView, useReducedMotion} from '@site/src/lib/hooks';
import styles from './styles.module.css';

const F1Scene = React.lazy(() => import('./F1Scene'));

// Kept here as well so the legend renders on the server without loading three.js
const LEGEND = [
  {id: 'frontWing', name: 'Front wing'},
  {id: 'nose', name: 'Nose'},
  {id: 'halo', name: 'Halo'},
  {id: 'sidepods', name: 'Sidepods'},
  {id: 'engine', name: 'Engine cover'},
  {id: 'rearWing', name: 'Rear wing'},
  {id: 'floor', name: 'Floor'},
  {id: 'wheels', name: 'Wheels'},
];

const NOTES = {
  frontWing: 'First thing to meet the air. It shapes the flow for the rest of the car.',
  nose: 'A crash structure. It crumples on purpose to soak up impact energy.',
  halo: 'Titanium hoop over the cockpit that protects the driver’s head.',
  sidepods: 'House the radiators that keep the power unit cool.',
  engine: 'Wraps the 1.6-litre V6 turbo-hybrid power unit and its air intake.',
  rearWing: 'Pushes the rear into the track. Its flaps open on straights to cut drag.',
  floor: 'Air sucked under the floor makes a big share of the downforce.',
  wheels: '18-inch wheels. Tyre compounds trade grip for how long they last.',
};

export default function F1Car() {
  const wrap = useRef(null);
  const labelRefs = useRef({});
  const inView = useInView(wrap, '100px');
  const reduced = useReducedMotion();
  const [exploded, setExploded] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [webgl, setWebgl] = useState(true);
  const fireAt = useRef(-1e9);
  const [firing, setFiring] = useState(false);

  useEffect(() => setWebgl(hasWebGL()), []);

  function fireUp() {
    fireAt.current = performance.now();
    setExploded(false);
    setFiring(true);
    setTimeout(() => setFiring(false), 3200);
  }

  const active = hovered;

  return (
    <div className={styles.f1} ref={wrap}>
      <div className={styles.f1Stage}>
        {webgl ? (
          <BrowserOnly fallback={<div className={styles.f1Loading}>Loading the car…</div>}>
            {() => (
              <Suspense fallback={<div className={styles.f1Loading}>Loading the car…</div>}>
                <F1Scene
                  exploded={exploded}
                  autoRotate={!reduced && !hovered && !firing}
                  fireAt={fireAt}
                  hovered={hovered}
                  setHovered={setHovered}
                  labelRefs={labelRefs}
                  running={inView}
                />
              </Suspense>
            )}
          </BrowserOnly>
        ) : (
          <div className={styles.f1Loading}>3D needs WebGL, which this browser has turned off.</div>
        )}
        <div className={styles.f1Labels} aria-hidden="true">
          {LEGEND.map((p) => (
            <span
              key={p.id}
              ref={(el) => (labelRefs.current[p.id] = el)}
              className={`${styles.f1Label} ${active === p.id ? styles.f1LabelOn : ''}`}>
              {p.name}
            </span>
          ))}
        </div>
        <p className={styles.f1Hint}>Drag to spin. Hover a part.</p>
        <p className={styles.f1Livery}>Livery: AX racing red</p>
      </div>

      <div className={styles.f1Side}>
        <div className={styles.f1Buttons}>
          <button type="button" className={styles.ctrlPrimary} onClick={fireUp} disabled={firing}>
            {firing ? 'Flat out…' : 'Fire it up'}
          </button>
          <button type="button" className={styles.ctrl} onClick={() => setExploded((e) => !e)} aria-pressed={exploded}>
            {exploded ? 'Put it back together' : 'Explode the car'}
          </button>
        </div>
        <ul className={styles.legend}>
          {LEGEND.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={`${styles.legendBtn} ${active === p.id ? styles.legendOn : ''}`}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(p.id)}
                onBlur={() => setHovered(null)}>
                {p.name}
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.partNote} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              key={active || 'none'}
              initial={{opacity: 0, y: 4}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0}}
              transition={{duration: 0.18}}>
              {active ? (
                <>
                  <strong>{LEGEND.find((p) => p.id === active).name}.</strong> {NOTES[active]}
                </>
              ) : (
                'Pick a part to see what it does.'
              )}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {useInView, useReducedMotion} from '@site/src/lib/hooks';
import styles from './styles.module.css';

/**
 * A miniature of SentinelIQ's live floor: 15 machines streaming vibration.
 * PUMP-07 develops bearing wear, crosses its threshold and raises an alert.
 * Select any machine to see what the system would say about it.
 */

const MACHINES = [
  'PRESS-01', 'PRESS-02', 'PRESS-03', 'PUMP-04', 'PUMP-05',
  'PUMP-06', 'PUMP-07', 'PUMP-08', 'CNC-09', 'CNC-10',
  'CNC-11', 'CNC-12', 'CONV-13', 'CONV-14', 'CONV-15',
];
const FAULTY = 'PUMP-07';
const POINTS = 28;
const THRESHOLD = 0.72;
const ALERT_AFTER = 26; // ticks (~7s)

function seedSeries() {
  return MACHINES.map(() => Array.from({length: POINTS}, () => 0.25 + Math.random() * 0.15));
}

export default function PlantFloor() {
  const wrap = useRef(null);
  const inView = useInView(wrap);
  const reduced = useReducedMotion();
  const [series, setSeries] = useState(seedSeries);
  const [tickCount, setTick] = useState(0);
  const [selected, setSelected] = useState(null);

  const alerted = reduced || tickCount >= ALERT_AFTER;

  useEffect(() => {
    if (!inView || reduced) return undefined;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setSeries((prev) =>
        prev.map((s, i) => {
          const isFaulty = MACHINES[i] === FAULTY;
          const last = s[s.length - 1];
          const drift = isFaulty ? 0.022 : 0;
          const base = isFaulty ? Math.min(0.92, last + drift) : 0.32;
          const v = base + (Math.random() - 0.5) * (isFaulty ? 0.12 : 0.1);
          return [...s.slice(1), Math.max(0.05, Math.min(0.98, isFaulty ? v : base + (v - base)))];
        }),
      );
    }, 260);
    return () => clearInterval(id);
  }, [inView, reduced]);

  useEffect(() => {
    if (reduced) {
      setSeries((prev) =>
        prev.map((s, i) => (MACHINES[i] === FAULTY ? s.map((_, k) => 0.3 + (k / POINTS) * 0.55) : s)),
      );
    }
  }, [reduced]);

  function replay() {
    setSeries(seedSeries());
    setTick(0);
    setSelected(null);
  }

  const sel = selected;
  const selIsFaulty = sel === FAULTY && alerted;

  return (
    <div className={styles.demo} ref={wrap}>
      <div className={styles.demoBar}>
        <span className={styles.liveDot} aria-hidden="true" />
        Live floor
        <span className={styles.demoNote}>Illustration of the demo scenario</span>
      </div>

      <div className={styles.floor} role="list">
        {MACHINES.map((id, i) => {
          const s = series[i];
          const isAlert = id === FAULTY && alerted;
          const pts = s.map((v, k) => `${(k / (POINTS - 1)) * 100},${100 - v * 100}`).join(' ');
          return (
            <button
              key={id}
              type="button"
              role="listitem"
              className={`${styles.machine} ${isAlert ? styles.machineAlert : ''} ${sel === id ? styles.machineSel : ''}`}
              onClick={() => setSelected(id)}
              aria-label={`${id}: ${isAlert ? 'alert, bearing wear predicted' : 'healthy'}`}>
              <span className={styles.machineId}>{id}</span>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.spark} aria-hidden="true">
                <line x1="0" x2="100" y1={100 - THRESHOLD * 100} y2={100 - THRESHOLD * 100} className={styles.threshold} />
                <polyline points={pts} className={styles.sparkLine} vectorEffect="non-scaling-stroke" />
              </svg>
            </button>
          );
        })}
      </div>

      <div className={styles.readout} aria-live="polite">
        <AnimatePresence mode="wait">
          {!sel && (
            <motion.p key="hint" className={styles.readoutHint} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
              {alerted ? 'PUMP-07 has crossed its threshold. Select it to see the diagnosis.' : 'Watch the floor. Select any machine to inspect it.'}
            </motion.p>
          )}
          {sel && !selIsFaulty && (
            <motion.div key={`ok-${sel}`} initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}}>
              <p className={styles.readoutTitle}>{sel} is healthy</p>
              <p className={styles.readoutText}>Vibration is inside its normal band. No action needed.</p>
            </motion.div>
          )}
          {selIsFaulty && (
            <motion.div key="diag" initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}}>
              <p className={styles.readoutTitle}>
                PUMP-07: bearing wear predicted <span className={styles.tagWarn}>A0</span>
              </p>
              <ul className={styles.diag}>
                <li>
                  <strong>Fact</strong>
                  <span>
                    Vibration has trended up past the tuned threshold <span className={styles.cite}>[S1]</span>
                  </span>
                </li>
                <li>
                  <strong>Evidence</strong>
                  <span>
                    A past bearing job on this pump matches the pattern <span className={styles.cite}>[M1]</span>
                  </span>
                </li>
                <li>
                  <strong>Next step</strong>
                  <span>Draft a work order. It goes to ERP only after a planner approves it.</span>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
        <button type="button" className={styles.replay} onClick={replay}>
          Replay
        </button>
      </div>
    </div>
  );
}

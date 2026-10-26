import React, {useCallback, useEffect, useRef, useState} from 'react';
import {safeStore} from '@site/src/lib/hooks';
import styles from './styles.module.css';

/**
 * F1-style start: five red lights come on one per second, then all go out
 * after a random hold. React as fast as you can.
 */
export default function StartLights() {
  const [phase, setPhase] = useState('idle'); // idle | arming | hold | go | result | jump
  const [lit, setLit] = useState(0);
  const [time, setTime] = useState(null);
  const [best, setBest] = useState(null);
  const timers = useRef([]);
  const goAt = useRef(0);

  useEffect(() => {
    const b = Number(safeStore.get('ax-f1-best'));
    if (b) setBest(b);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const start = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTime(null);
    setLit(0);
    setPhase('arming');
    for (let i = 1; i <= 5; i++) {
      timers.current.push(setTimeout(() => setLit(i), i * 900));
    }
    const hold = 900 * 5 + 300 + Math.random() * 2400;
    timers.current.push(setTimeout(() => setPhase('hold'), 900 * 5));
    timers.current.push(
      setTimeout(() => {
        setLit(0);
        goAt.current = performance.now();
        setPhase('go');
      }, hold),
    );
  }, []);

  const react = useCallback(() => {
    if (phase === 'idle' || phase === 'result' || phase === 'jump') {
      start();
      return;
    }
    if (phase === 'arming' || phase === 'hold') {
      timers.current.forEach(clearTimeout);
      setLit(0);
      setPhase('jump');
      return;
    }
    if (phase === 'go') {
      const ms = Math.round(performance.now() - goAt.current);
      setTime(ms);
      setPhase('result');
      if (!best || ms < best) {
        setBest(ms);
        safeStore.set('ax-f1-best', String(ms));
      }
    }
  }, [phase, start, best]);

  let message = 'Press start, then hit the panel the moment the lights go out.';
  if (phase === 'arming' || phase === 'hold') message = 'Wait for it…';
  if (phase === 'go') message = 'Go!';
  if (phase === 'jump') message = 'Jump start. That’s a penalty. Try again.';
  if (phase === 'result') {
    message =
      time < 200 ? `${time} ms. Pole-position reflexes.` : time < 300 ? `${time} ms. Solid launch.` : `${time} ms. Bogged down off the line.`;
  }

  return (
    <div className={styles.toy}>
      <button
        type="button"
        className={`${styles.stage} ${styles.f1Stage}`}
        onPointerDown={(e) => {
          e.preventDefault();
          react();
        }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            react();
          }
        }}
        aria-label="Start lights. Activate to start, then activate again when the lights go out.">
        <div className={styles.gantry}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={styles.lightPod}>
              <span className={`${styles.bulb} ${lit >= n ? styles.bulbOn : ''}`} />
              <span className={`${styles.bulb} ${lit >= n ? styles.bulbOn : ''}`} />
            </div>
          ))}
        </div>
        <p className={styles.stageMsg} aria-live="polite">
          {message}
        </p>
      </button>
      <div className={styles.controls}>
        <span className={styles.stat}>
          Best <strong>{best ? `${best} ms` : '—'}</strong>
        </span>
        <button type="button" className={styles.ctrl} onClick={start}>
          {phase === 'idle' ? 'Start' : 'Restart'}
        </button>
      </div>
    </div>
  );
}

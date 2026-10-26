import React, {useEffect, useRef, useState} from 'react';
import {safeStore} from '@site/src/lib/hooks';
import styles from './styles.module.css';

const ROUND = 15; // seconds

/** A 15-second flick test: hit as many targets as you can. */
export default function AimTrainer() {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(ROUND);
  const [hits, setHits] = useState(0);
  const [shots, setShots] = useState(0);
  const [target, setTarget] = useState({x: 50, y: 50, id: 0});
  const [best, setBest] = useState(null);
  const tick = useRef(null);

  useEffect(() => {
    const b = Number(safeStore.get('ax-aim-best'));
    if (b) setBest(b);
    return () => clearInterval(tick.current);
  }, []);

  function nextTarget() {
    setTarget((t) => ({x: 8 + Math.random() * 84, y: 12 + Math.random() * 76, id: t.id + 1}));
  }

  function start() {
    setHits(0);
    setShots(0);
    setLeft(ROUND);
    setRunning(true);
    nextTarget();
    clearInterval(tick.current);
    const end = Date.now() + ROUND * 1000;
    tick.current = setInterval(() => {
      const s = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        clearInterval(tick.current);
        setRunning(false);
      }
    }, 200);
  }

  useEffect(() => {
    if (!running && shots > 0 && (!best || hits > best)) {
      setBest(hits);
      safeStore.set('ax-aim-best', String(hits));
    }
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const acc = shots ? Math.round((hits / shots) * 100) : 0;

  return (
    <div className={styles.toy}>
      <div
        className={`${styles.stage} ${styles.range}`}
        onPointerDown={() => running && setShots((s) => s + 1)}>
        {running ? (
          <button
            key={target.id}
            type="button"
            className={styles.target}
            style={{left: `${target.x}%`, top: `${target.y}%`}}
            onPointerDown={(e) => {
              e.stopPropagation();
              setShots((s) => s + 1);
              setHits((h) => h + 1);
              nextTarget();
            }}
            aria-label="Target"
          />
        ) : (
          <div className={styles.rangeIdle}>
            {shots > 0 ? (
              <p className={styles.stageMsg}>
                {hits} hits, {acc}% accuracy.
              </p>
            ) : (
              <p className={styles.stageMsg}>Hit as many targets as you can in {ROUND} seconds.</p>
            )}
            <button type="button" className={styles.ctrlPrimary} onClick={start}>
              {shots > 0 ? 'Go again' : 'Start'}
            </button>
          </div>
        )}
        <span className={styles.crosshairHint} aria-hidden="true" />
      </div>
      <div className={styles.controls}>
        <span className={styles.stat}>
          Time <strong>{left}s</strong>
        </span>
        <span className={styles.stat}>
          Hits <strong>{hits}</strong>
        </span>
        <span className={styles.stat}>
          Best <strong>{best ?? '—'}</strong>
        </span>
      </div>
    </div>
  );
}

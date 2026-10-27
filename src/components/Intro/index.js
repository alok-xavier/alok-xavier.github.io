import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import Signature from '@site/src/components/Signature';
import styles from './styles.module.css';

/**
 * A short boot sequence the first time someone lands in a session:
 * a deployment rolls out, the signature signs off, the curtain lifts.
 * Skippable with any key, click or tap. Skipped entirely for reduced motion.
 */

const LINES = [
  {text: '$ kubectl rollout status deployment/alok', at: 0},
  {text: 'Waiting for rollout to finish: 1 of 1 updated replicas available…', at: 450},
  {text: 'deployment "alok" successfully rolled out', at: 950, ok: true},
];
const DONE_AT = 2500;

function seen() {
  try {
    return window.sessionStorage.getItem('ax-intro') === '1';
  } catch (e) {
    return false;
  }
}

export default function Intro() {
  const [show, setShow] = useState(true); // server render shows it; a CSS failsafe hides it if JS never runs
  const [step, setStep] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || seen()) {
      window.__axIntroPlaying = false;
      setShow(false);
      return undefined;
    }
    window.__axIntroPlaying = true;
    try {
      window.sessionStorage.setItem('ax-intro', '1');
    } catch (e) {
      /* ignore */
    }
    document.documentElement.style.overflow = 'hidden';
    LINES.forEach((l, i) => timers.current.push(setTimeout(() => setStep(i + 1), l.at)));
    timers.current.push(setTimeout(() => setShow(false), DONE_AT));
    const skip = () => setShow(false);
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      timers.current.forEach(clearTimeout);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!show) document.documentElement.style.overflow = '';
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={styles.intro}
          initial={false}
          exit={{clipPath: 'inset(0 0 100% 0)'}}
          transition={{duration: 0.8, ease: [0.7, 0, 0.2, 1]}}
          aria-hidden="true">
          <div className={styles.term}>
            {LINES.slice(0, step).map((l) => (
              <p key={l.text} className={l.ok ? styles.ok : undefined}>
                {l.text}
              </p>
            ))}
            {step < LINES.length && <span className={styles.caret} />}
          </div>
          {step >= LINES.length && (
            <div className={styles.sign}>
              <Signature trigger="load" duration={1.1} color="#f5b544" strokeWidth={12} />
            </div>
          )}
          <p className={styles.skip}>Press any key to skip</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

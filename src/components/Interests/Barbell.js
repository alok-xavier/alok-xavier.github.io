import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styles from './styles.module.css';

// Competition plate colours and relative sizes
const PLATES = [
  {kg: 25, color: '#c63a32', h: 1, w: 15},
  {kg: 20, color: '#2f5db0', h: 1, w: 13},
  {kg: 15, color: '#d9a92a', h: 1, w: 11},
  {kg: 10, color: '#3b8a4e', h: 1, w: 9},
  {kg: 5, color: '#e6e7ec', h: 0.62, w: 8},
  {kg: 2.5, color: '#3a3f55', h: 0.5, w: 6},
];

const BAR = 20;
const MAX_WIDTH = 100; // sleeve length in svg units

export default function Barbell() {
  const [load, setLoad] = useState([25, 20]); // one side, inside → out

  const width = (arr) => arr.reduce((s, kg) => s + PLATES.find((p) => p.kg === kg).w + 1, 0);
  const total = BAR + load.reduce((s, kg) => s + kg, 0) * 2;

  function add(kg) {
    const next = [...load, kg].sort((a, b) => b - a); // heaviest inside
    if (width(next) <= MAX_WIDTH) setLoad(next);
  }

  function side(dir) {
    let x = dir === 1 ? 240 : 160; // outer face of each collar
    return load.map((kg, i) => {
      const p = PLATES.find((pl) => pl.kg === kg);
      const h = 120 * p.h;
      const px = dir === 1 ? x : x - p.w;
      x += dir * (p.w + 1);
      return (
        <motion.rect
          key={`${dir}-${i}-${kg}`}
          x={px}
          y={80 - h / 2}
          width={p.w}
          height={h}
          rx={2}
          fill={p.color}
          stroke="rgba(0,0,0,.35)"
          initial={{scaleY: 0, opacity: 0}}
          animate={{scaleY: 1, opacity: 1}}
          exit={{scaleY: 0, opacity: 0}}
          transition={{type: 'spring', stiffness: 380, damping: 22}}
          style={{originY: '50%', transformBox: 'fill-box'}}
        />
      );
    });
  }

  return (
    <div className={styles.toy}>
      <div className={styles.stage}>
        <svg viewBox="0 0 400 160" className={styles.barSvg} role="img" aria-label={`Barbell loaded to ${total} kilograms`}>
          <rect x="20" y="76" width="360" height="8" rx="3" fill="#9aa0b8" />
          <rect x="160" y="70" width="8" height="20" rx="2" fill="#c5c9d8" />
          <rect x="232" y="70" width="8" height="20" rx="2" fill="#c5c9d8" />
          <AnimatePresence>
            {side(-1)}
            {side(1)}
          </AnimatePresence>
        </svg>
        <p className={styles.bigNum} aria-live="polite">
          {total}
          <span> kg</span>
        </p>
      </div>
      <div className={styles.controls}>
        <div className={styles.plateBtns} role="group" aria-label="Add a pair of plates">
          {PLATES.map((p) => (
            <button
              key={p.kg}
              type="button"
              className={styles.plateBtn}
              style={{'--plate': p.color}}
              onClick={() => add(p.kg)}>
              +{p.kg}
            </button>
          ))}
        </div>
        <button type="button" className={styles.ctrl} onClick={() => setLoad([])}>
          Strip
        </button>
      </div>
    </div>
  );
}

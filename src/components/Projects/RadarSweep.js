import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styles from './styles.module.css';

/**
 * Covenant Radar as an actual radar: each blip is a borrower, its distance
 * from the centre is days until a covenant is predicted to break.
 * Borrowers and numbers here are illustrative.
 */

const BORROWERS = [
  {id: 'A', days: 12, angle: 28, covenant: 'Debt / EBITDA ≤ 3.0x', signals: 'Utilisation running hot, payments slipping'},
  {id: 'B', days: 22, angle: 140, covenant: 'Interest cover ≥ 1.5x', signals: 'Margins down two quarters in a row'},
  {id: 'C', days: 27, angle: 250, covenant: 'Current ratio ≥ 1.2x', signals: 'Cash outflows changed shape'},
  {id: 'D', days: 38, angle: 78, covenant: 'DSCR ≥ 1.25x', signals: 'Industry stress rising'},
  {id: 'E', days: 46, angle: 196, covenant: 'TOL / TNW ≤ 3.0x', signals: 'New borrowing, flat equity'},
  {id: 'F', days: 55, angle: 312, covenant: 'Drawing-power headroom ≥ 10%', signals: 'Limit utilisation above 90%'},
  {id: 'G', days: 64, angle: 112, covenant: 'Leverage ≤ 3.0x', signals: 'Adverse news, receivable days up'},
  {id: 'H', days: 71, angle: 228, covenant: 'Minimum net worth', signals: 'Losses eroding reserves'},
  {id: 'I', days: 79, angle: 4, covenant: 'Asset cover ≥ 1.33x', signals: 'Collateral values softening'},
  {id: 'J', days: 86, angle: 282, covenant: 'Promoter shareholding floor', signals: 'Promoter pledge increased'},
  {id: 'K', days: 88, angle: 164, covenant: 'Fixed-charge cover ≥ 1.2x', signals: 'Lease costs rising'},
];

const R = 130;
const C = 150;

function band(days) {
  if (days <= 30) return 'act';
  if (days <= 60) return 'watch';
  return 'monitor';
}

export default function RadarSweep() {
  const [horizon, setHorizon] = useState(90);
  const [active, setActive] = useState(BORROWERS[0]);

  const visible = BORROWERS.filter((b) => b.days <= horizon);

  return (
    <div className={styles.demo}>
      <div className={styles.demoBar}>
        <span className={styles.liveDot} aria-hidden="true" />
        Early-warning radar
        <span className={styles.demoNote}>Illustrative borrowers</span>
      </div>

      <div className={styles.radarWrap}>
        <svg viewBox="0 0 300 300" className={styles.radar} role="img" aria-label={`Radar of ${visible.length} borrowers predicted to breach within ${horizon} days`}>
          <defs>
            <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#232a4d" />
              <stop offset="100%" stopColor="#12162b" />
            </radialGradient>
            <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(245,181,68,0)" />
              <stop offset="100%" stopColor="rgba(245,181,68,.45)" />
            </linearGradient>
          </defs>
          <circle cx={C} cy={C} r={R} fill="url(#radarBg)" />
          {[30, 60, 90].map((d) => (
            <g key={d}>
              <circle cx={C} cy={C} r={(d / 90) * R} className={`${styles.ring} ${d > horizon ? styles.ringOff : ''}`} />
              <text x={C + 4} y={C - (d / 90) * R + 12} className={styles.ringLabel}>
                {d}d
              </text>
            </g>
          ))}
          <line x1={C - R} x2={C + R} y1={C} y2={C} className={styles.axis} />
          <line y1={C - R} y2={C + R} x1={C} x2={C} className={styles.axis} />

          <g className={styles.sweep} style={{transformOrigin: `${C}px ${C}px`}}>
            <path d={`M${C},${C} L${C + R},${C} A${R},${R} 0 0,0 ${C + R * Math.cos(-Math.PI / 5)},${C + R * Math.sin(-Math.PI / 5)} Z`} fill="url(#sweepGrad)" />
            <line x1={C} y1={C} x2={C + R} y2={C} className={styles.sweepEdge} />
          </g>

          <AnimatePresence>
            {visible.map((b) => {
              const rad = (b.angle * Math.PI) / 180;
              const r = (b.days / 90) * R;
              const x = C + r * Math.cos(rad);
              const y = C - r * Math.sin(rad);
              const isActive = active?.id === b.id;
              return (
                <motion.g
                  key={b.id}
                  initial={{opacity: 0, scale: 0}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0}}
                  style={{transformOrigin: `${x}px ${y}px`}}
                  className={styles.blipG}
                  tabIndex={0}
                  role="button"
                  aria-label={`Borrower ${b.id}: ${b.covenant}, predicted breach in ${b.days} days`}
                  onMouseEnter={() => setActive(b)}
                  onFocus={() => setActive(b)}
                  onClick={() => setActive(b)}>
                  <circle cx={x} cy={y} r={14} fill="transparent" />
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 7 : 5}
                    className={`${styles.blip} ${styles[band(b.days)]}`}
                    style={{animationDelay: `${-(b.angle / 360) * 4}s`}}
                  />
                  {isActive && <circle cx={x} cy={y} r={12} className={styles.blipRing} />}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>

        <div className={styles.radarSide}>
          <div className={styles.horizon} role="group" aria-label="Prediction horizon">
            {[30, 60, 90].map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={horizon === d}
                className={`${styles.chip} ${horizon === d ? styles.chipOn : ''}`}
                onClick={() => setHorizon(d)}>
                {d} days
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {active && active.days <= horizon ? (
              <motion.div key={active.id} initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className={styles.blipCard}>
                <p className={styles.readoutTitle}>
                  Borrower {active.id}{' '}
                  <span className={`${styles.tagBand} ${styles[`tag_${band(active.days)}`]}`}>{band(active.days)}</span>
                </p>
                <p className={styles.readoutText}>
                  <strong>{active.covenant}</strong> predicted to break in <strong>{active.days} days</strong>.
                </p>
                <p className={styles.readoutText}>{active.signals}.</p>
              </motion.div>
            ) : (
              <motion.p key="none" className={styles.readoutHint} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                Hover or tap a blip to see why it’s on the radar.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

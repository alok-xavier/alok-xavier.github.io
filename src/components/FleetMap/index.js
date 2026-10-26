import React from 'react';
import styles from './styles.module.css';

/**
 * A night-time "city map" of the fleet: one light per server, grouped
 * into one block per AWS account. Layout is generated from a fixed seed
 * so server-rendered HTML and the hydrated client always match.
 *
 * On load the lights come on in a single left-to-right sweep (like a
 * patch rollout moving account by account). Reduced-motion users get the
 * lit state immediately.
 */

const SERVERS = 1500;
const ACCOUNTS = 23;
const SEED = 20210802; // first day at TCS

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildFleet() {
  const rand = mulberry32(SEED);

  // Uneven account sizes, like a real estate: a few big ones, many small.
  const weights = Array.from({length: ACCOUNTS}, () => Math.pow(rand(), 1.6) + 0.18);
  const total = weights.reduce((s, w) => s + w, 0);
  const sizes = weights.map((w) => Math.max(12, Math.round((w / total) * SERVERS)));
  // Correct rounding drift so the map shows exactly SERVERS lights.
  let drift = SERVERS - sizes.reduce((s, n) => s + n, 0);
  for (let i = 0; drift !== 0; i = (i + 1) % ACCOUNTS) {
    const step = drift > 0 ? 1 : -1;
    if (sizes[i] + step >= 12) {
      sizes[i] += step;
      drift -= step;
    }
  }

  return sizes.map((count, block) => {
    const rows = 4 + Math.floor(rand() * 5); // 4–8 rows tall
    const cols = Math.ceil(count / rows);
    const lights = Array.from({length: count}, (_, i) => {
      const r = rand();
      // ~3% brighter, ~16% dimmer: a fleet is never perfectly uniform
      const tone = r < 0.03 ? 'hot' : r < 0.19 ? 'dim' : 'on';
      return {col: Math.floor(i / rows), tone};
    });
    return {block, rows, cols, lights};
  });
}

const FLEET = buildFleet();

export default function FleetMap() {
  return (
    <div
      className={styles.map}
      role="img"
      aria-label={`Illustration: ${SERVERS.toLocaleString('en-US')} lights, one per server, grouped into ${ACCOUNTS} blocks for ${ACCOUNTS} AWS accounts.`}>
      {FLEET.map(({block, rows, lights}) => (
        <div
          key={block}
          className={styles.block}
          style={{'--rows': rows, '--b': block}}>
          {lights.map((light, i) => (
            <span
              key={i}
              className={`${styles.light} ${styles[light.tone]}`}
              style={{'--c': light.col}}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

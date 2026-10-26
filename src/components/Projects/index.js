import React from 'react';
import {motion} from 'framer-motion';
import PlantFloor from './PlantFloor';
import RadarSweep from './RadarSweep';
import styles from './styles.module.css';

const PROJECTS = [
  {
    id: 'covenant-radar',
    name: 'Covenant Radar',
    stage: 'National final',
    summary:
      'Early warning for commercial lending. It watches a loan book every night and predicts which borrowers will break a covenant in the next 30, 60 or 90 days. Then it explains why and ranks what the credit desk should do today.',
    points: [
      'Covenant maths stays deterministic and auditable. AI adds signals and drafts the memo, never the number.',
      '24 covenant types and 7 signal families, from payment delays to news risk.',
      'A six-step nightly pipeline: ingest, test, score, rank, update cases, dispatch.',
      'Tested on the quarterly results of 24 NSE-listed companies.',
    ],
    stack: ['Python', 'FastAPI', 'pandas', 'scikit-learn', 'LiteLLM', 'Gemini', 'PostgreSQL', 'OpenTelemetry', 'Prometheus'],
    repo: 'https://github.com/Arv-ind-s/CovenantRadar',
    Demo: RadarSweep,
  },
  {
    id: 'sentineliq',
    name: 'SentinelIQ',
    stage: 'Kochi final',
    summary:
      'Predictive maintenance for a 15-machine plant. It spots a failing machine early, diagnoses the fault with cited evidence, and drafts the work order. A person approves it before anything reaches ERP.',
    points: [
      'Caught 91.7% of failure events in held-out tests, with 0.99 precision.',
      'Passed 12 of 12 hallucination tests. Every claim carries a citation.',
      'Cut downtime by 60.7% in the simulated plant.',
      'Works fully offline. Gemini only narrates; predictions never depend on it.',
    ],
    stack: ['Python', 'FastAPI', 'scikit-learn', 'DuckDB', 'Gemini 2.5 Flash-Lite', 'React', 'Three.js', 'Docker'],
    repo: 'https://github.com/Arv-ind-s/sentineliq',
    Demo: PlantFloor,
  },
];

export default function Projects() {
  return (
    <div className={styles.list}>
      {PROJECTS.map(({id, name, stage, summary, points, stack, repo, Demo}, i) => (
        <motion.article
          key={id}
          id={id}
          className={`${styles.project} ${i % 2 ? styles.flip : ''}`}
          initial={{opacity: 0, y: 32}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-80px'}}
          transition={{duration: 0.7, ease: [0.2, 0.7, 0.2, 1]}}>
          <div className={styles.copy}>
            <p className={styles.stage}>{stage}</p>
            <h3 className={styles.name}>{name}</h3>
            <p className={styles.summary}>{summary}</p>
            <ul className={styles.points}>
              {points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <ul className={styles.stack} aria-label="Built with">
              {stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <a className={styles.repo} href={repo}>
              Source on GitHub
            </a>
          </div>
          <Demo />
        </motion.article>
      ))}
    </div>
  );
}

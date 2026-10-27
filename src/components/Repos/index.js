import React, {useEffect, useState} from 'react';
import {animate, motion, useMotionValue, useSpring} from 'framer-motion';
import styles from './styles.module.css';

/**
 * Two shelves of GitHub repos. Star counts and languages are fetched live
 * from the public GitHub API (60 requests/hour per visitor, no token) and
 * cached in localStorage for 12 hours; if that fails the cards show without them.
 *
 * Edit the two arrays below to change what's featured.
 */

export const FAVOURITES = [
  {repo: 'kubernetes/kubernetes', note: 'The orchestrator I spend most of my working life inside.'},
  {repo: 'argoproj/argo-cd', note: 'GitOps delivery: Git says what should run, Argo makes it so.'},
  {repo: 'hashicorp/terraform', note: 'Infrastructure as code for every account I touch.'},
  {repo: 'prometheus/prometheus', note: 'Metrics and alerting, the backbone of on-call.'},
  {repo: 'k8sgpt-ai/k8sgpt', note: 'AI that reads a cluster and explains what’s broken. Pure AIOps.'},
  {repo: 'ollama/ollama', note: 'Run open models locally to experiment without a bill.'},
];

export const STUDY = [
  {repo: 'iam-veeramalla/Docker-Zero-to-Hero', note: 'Where my container fundamentals came from.'},
  {repo: 'kelseyhightower/kubernetes-the-hard-way', note: 'Bootstrapping a cluster by hand, no installers.'},
  {repo: 'donnemartin/system-design-primer', note: 'How large systems are put together.'},
  {repo: 'bregman-arie/devops-exercises', note: 'Interview-style questions across the whole DevOps stack.'},
  {repo: 'dastergon/awesome-sre', note: 'A reading list for reliability engineering.'},
  {repo: 'mlabonne/llm-course', note: 'A structured path into LLMs, from basics to deployment.'},
];

const LANG_COLORS = {
  Go: '#00add8',
  Python: '#3572a5',
  Shell: '#89e051',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  'Jupyter Notebook': '#da5b0b',
  HCL: '#844fba',
  Dockerfile: '#384d54',
};

const cache = {};

function useRepoMeta(repo) {
  const [meta, setMeta] = useState(cache[repo] || null);
  useEffect(() => {
    if (cache[repo]) return undefined;
    let alive = true;
    const key = `ax-gh-${repo}`;
    const TTL = 12 * 60 * 60 * 1000; // re-check star counts twice a day
    let stale = null;
    try {
      const saved = JSON.parse(window.localStorage.getItem(key) || 'null');
      if (saved) {
        cache[repo] = saved;
        setMeta(saved);
        if (Date.now() - (saved.at || 0) < TTL) return undefined;
        stale = saved;
      }
    } catch (e) {
      /* storage blocked: fetch instead */
    }
    fetch(`https://api.github.com/repos/${repo}`, {headers: {Accept: 'application/vnd.github+json'}})
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d || !alive) return;
        const m = {stars: d.stargazers_count, lang: d.language, at: Date.now()};
        cache[repo] = m;
        if (!stale || stale.stars !== m.stars) setMeta(m);
        try {
          window.localStorage.setItem(key, JSON.stringify(m));
        } catch (e) {
          /* ignore */
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [repo]);
  return meta;
}

function CountUp({value}) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {duration: 1.2, ease: [0.2, 0.7, 0.2, 1], onUpdate: (v) => setShown(v)});
    return () => controls.stop();
  }, [value]);
  const n = shown >= 1000 ? `${(shown / 1000).toFixed(shown >= 10000 ? 0 : 1)}k` : Math.round(shown).toString();
  return <>{n}</>;
}

function RepoCard({repo, note, index}) {
  const meta = useRepoMeta(repo);
  const [owner, name] = repo.split('/');
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, {stiffness: 200, damping: 20});
  const sy = useSpring(ry, {stiffness: 200, damping: 20});

  return (
    <motion.li
      initial={{opacity: 0, y: 18}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, margin: '-40px'}}
      transition={{duration: 0.5, delay: index * 0.05}}>
      <motion.a
        href={`https://github.com/${repo}`}
        className={styles.card}
        style={{rotateX: sx, rotateY: sy, transformPerspective: 800}}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
          e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
        }}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}>
        <span className={styles.owner}>{owner} /</span>
        <span className={styles.name}>{name}</span>
        <span className={styles.note}>{note}</span>
        <span className={styles.meta}>
          {meta?.lang && (
            <span className={styles.lang}>
              <span className={styles.langDot} style={{background: LANG_COLORS[meta.lang] || '#9aa0b8'}} />
              {meta.lang}
            </span>
          )}
          {typeof meta?.stars === 'number' && (
            <span className={styles.stars} title={`${meta.stars.toLocaleString('en-US')} stars`}>
              ★ <CountUp value={meta.stars} />
            </span>
          )}
        </span>
      </motion.a>
    </motion.li>
  );
}

function Shelf({title, intro, items}) {
  return (
    <div className={styles.shelf}>
      <h3 className={styles.shelfTitle}>{title}</h3>
      <p className={styles.shelfIntro}>{intro}</p>
      <ul className={styles.list}>
        {items.map((it, i) => (
          <RepoCard key={it.repo} {...it} index={i} />
        ))}
      </ul>
    </div>
  );
}

export default function Repos() {
  return (
    <div className={styles.shelves}>
      <Shelf title="Repos I keep coming back to" intro="The tools I run, and the ones pulling me towards AIOps." items={FAVOURITES} />
      <Shelf title="Where I study" intro="Courses, guides and reading lists I learn from." items={STUDY} />
    </div>
  );
}

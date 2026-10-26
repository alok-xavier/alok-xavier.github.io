import React, {useEffect, useMemo, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styles from './styles.module.css';

/**
 * Ctrl/⌘ + K menu for jumping around the homepage and opening links.
 * `open` / `setOpen` are owned by the page so other buttons can open it.
 */
export default function CommandPalette({open, setOpen, commands}) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const input = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement;
      setQuery('');
      setIndex(0);
      setTimeout(() => input.current?.focus(), 10);
    } else if (lastFocus.current) {
      lastFocus.current.focus?.();
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => (c.label + ' ' + (c.keywords || '')).toLowerCase().includes(q)) : commands;
  }, [query, commands]);

  function run(cmd) {
    setOpen(false);
    setTimeout(() => cmd.run(), 60);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => Math.min(results.length - 1, i + 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    }
    if (e.key === 'Enter' && results[index]) run(results[index]);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          onMouseDown={() => setOpen(false)}>
          <motion.div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-label="Jump to"
            initial={{opacity: 0, y: -12, scale: 0.98}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: -8, scale: 0.98}}
            transition={{type: 'spring', stiffness: 420, damping: 32}}
            onMouseDown={(e) => e.stopPropagation()}>
            <input
              ref={input}
              autoFocus
              className={styles.input}
              placeholder="Jump to a section or open a link…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              onKeyDown={onKeyDown}
              aria-controls="ax-palette-list"
              aria-activedescendant={results[index] ? `ax-cmd-${results[index].id}` : undefined}
            />
            <ul id="ax-palette-list" className={styles.list} role="listbox">
              {results.length === 0 && <li className={styles.empty}>Nothing matches “{query}”.</li>}
              {results.map((c, i) => (
                <li
                  key={c.id}
                  id={`ax-cmd-${c.id}`}
                  role="option"
                  aria-selected={i === index}
                  className={`${styles.item} ${i === index ? styles.itemOn : ''}`}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => run(c)}>
                  <span>{c.label}</span>
                  <span className={styles.group}>{c.group}</span>
                </li>
              ))}
            </ul>
            <p className={styles.foot}>
              <kbd>↑</kbd> <kbd>↓</kbd> to move, <kbd>Enter</kbd> to open, <kbd>Esc</kbd> to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

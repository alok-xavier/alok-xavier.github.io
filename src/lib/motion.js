import {useEffect} from 'react';

/**
 * GSAP + ScrollTrigger, loaded only in the browser.
 * useGsap(scopeRef, (gsap, ScrollTrigger, reduced) => {...}, deps)
 * runs the setup inside a gsap.context so everything is reverted on unmount.
 */
let cached = null;

export async function loadGsap() {
  if (cached) return cached;
  const [{gsap}, {ScrollTrigger}] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  cached = {gsap, ScrollTrigger};
  return cached;
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useGsap(scope, setup, deps = []) {
  useEffect(() => {
    let ctx;
    let cancelled = false;
    loadGsap().then(({gsap, ScrollTrigger}) => {
      if (cancelled || !scope.current) return;
      ctx = gsap.context(() => setup(gsap, ScrollTrigger, prefersReducedMotion()), scope);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Lenis smooth scrolling, wired to ScrollTrigger. Desktop wheel only; touch stays native. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let lenis;
    let tick;
    let cancelled = false;
    Promise.all([import('lenis'), loadGsap()]).then(([{default: Lenis}, {gsap, ScrollTrigger}]) => {
      if (cancelled) return;
      lenis = new Lenis({duration: 1.1, smoothWheel: true});
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      tick = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    });
    return () => {
      cancelled = true;
      if (tick) loadGsap().then(({gsap}) => gsap.ticker.remove(tick));
      lenis?.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);
}

/** Scroll to an element id, through Lenis when it's running. */
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, {offset: -64});
  else el.scrollIntoView({behavior: 'smooth', block: 'start'});
}

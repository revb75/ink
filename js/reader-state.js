// /js/reader-state.fixed.js
// Robust gating for vertical vs. horizontal with deduped logs.
// Exposes window.ReaderState with setScrollResolver, onProgress, refresh, setModeVertical, getMode.

(function(){
  'use strict';

  if (window.__INKWELL_READER_STATE__) return;
  window.__INKWELL_READER_STATE__ = true;

  const on = (el, ev, fn, opts) => el.addEventListener(ev, fn, opts||false);

  function resolveIsVertical(){
    if (window.INKWELL_MODE && typeof window.INKWELL_MODE.isVertical === 'boolean') return window.INKWELL_MODE.isVertical;
    const persisted = localStorage.getItem('InkWell:isVertical');
    const url = new URL(window.location.href);
    const vertParam = url.searchParams.get('vert');
    if (vertParam === 'true') return true;
    if (vertParam === 'false') return false;
    return persisted === 'true';
  }

  function throttle(fn, ms){
    let last = 0, timer = null, lastArgs = null;
    return function(){
      lastArgs = arguments;
      const now = Date.now();
      const rem = ms - (now - last);
      if (rem <= 0){
        last = now;
        fn.apply(this, lastArgs);
      } else if (!timer){
        timer = setTimeout(() => {
          timer = null;
          last = Date.now();
          fn.apply(this, lastArgs);
        }, Math.max(0, rem));
      }
    };
  }

  function defaultResolver(){
    const chapter = 0;
    const page = Math.max(0, Math.round(window.scrollY / Math.max(1, window.innerHeight * 0.9)));
    return { chapter, page };
  }

  let isVertical = resolveIsVertical();
  let resolver = defaultResolver;
  let scrollHandler = null;
  let lastKey = '';
  let skipLogged = false;

  let onProgress = ({chapter, page}) => {
    console.log('📖 Saving vertical progress: Chapter %d, Page %d', chapter, page);
  };

  function attachScroll(){
    if (scrollHandler) return;
    const handler = throttle(function(){
      const {chapter, page} = resolver();
      const key = chapter + ':' + page;
      if (key !== lastKey){
        lastKey = key;
        try { onProgress({chapter, page}); } catch(e){ console.error('onProgress error:', e); }
      }
    }, 200);
    scrollHandler = handler;
    on(window, 'scroll', handler, { passive: true });
    handler();
  }

  function detachScroll(){
    if (!scrollHandler) return;
    window.removeEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler = null;
  }

  function applyMode(){
    isVertical = resolveIsVertical();
    if (isVertical){
      console.info('ℹ️ Vertical mode (persisted)');
      attachScroll();
    } else {
      console.info('ℹ️ Horizontal mode (persisted)');
      if (!skipLogged){
        console.info('🚫 Skipping scroll tracking in horizontal mode');
        skipLogged = true;
      }
      detachScroll();
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyMode, { once: true });
  } else {
    applyMode();
  }

  window.ReaderState = {
    setScrollResolver(fn){ if (typeof fn === 'function') resolver = fn; },
    onProgress(fn){ if (typeof fn === 'function') onProgress = fn; },
    refresh(){ applyMode(); },
    setModeVertical(v){ 
      const b = v === true;
      localStorage.setItem('InkWell:isVertical', String(b));
      if (!window.INKWELL_MODE) window.INKWELL_MODE = {};
      window.INKWELL_MODE.isVertical = b;
      applyMode();
    },
    getMode(){ return isVertical ? 'vertical' : 'horizontal'; }
  };
})();

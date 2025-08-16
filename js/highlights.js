/**
 * highlights.js
 * Handles creation, loading, editing, and deletion of highlights in InkWell Reader.
 * Dependencies: rangy.js, Supabase client (sb), global variables: slug, userId, bookId, reader, page, chap
 */

(function (global) {
  if (!global.rangy) {
    console.error("[Highlights] Rangy is not available");
    return;
  }
  rangy.init();

  const STYLE_NAME = "user-highlight";
  let highlighter = null;
  let highlightMode = false;
  const listeners = {};

  function emit(evt, payload) {
    (listeners[evt] || []).forEach(fn => {
      try { fn(payload); } catch (e) { console.error(e); }
    });
  }

  function on(evt, fn) {
    (listeners[evt] = listeners[evt] || []).push(fn);
  }

  function ensureHighlighter() {
    if (highlighter) return highlighter;
    highlighter = rangy.createHighlighter();
    highlighter.addClassApplier(rangy.createClassApplier(STYLE_NAME, {
      ignoreWhiteSpace: true,
      tagNames: ["span"]
    }));
    return highlighter;
  }

  function setup({ viewer }) {
    ensureHighlighter();
    viewer.addEventListener("mouseup", tryCreate);
    viewer.addEventListener("touchend", () => setTimeout(tryCreate, 10));
  }

  function toggleMode(force) {
    highlightMode = typeof force === "boolean" ? force : !highlightMode;
    document.body.classList.toggle("highlight-mode", highlightMode);
    emit("modechange", { active: highlightMode });
    return highlightMode;
  }

  function tryCreate() {
    if (!highlightMode) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    ensureHighlighter();
    try {
      highlighter.highlightSelection(STYLE_NAME);
      const h = highlighter.highlights[highlighter.highlights.length - 1];
      const id = "" + h.id;
      const text = sel.toString().trim();
      sel.removeAllRanges();
      h.getHighlightElements().forEach(el => {
        el.dataset.hlLocalId = id;
        el.classList.add("user-highlight");
      });
      emit("created", { localId: id, text, elements: h.getHighlightElements() });
    } catch (e) {
      console.error("[Highlights] Failed to create highlight", e);
    }
  }

  function attachMeta(localId, dbRow) {
    if (!highlighter) return;
    const h = highlighter.highlights.find(x => "" + x.id === ("" + localId));
    if (!h) return;
    h.getHighlightElements().forEach(el => {
      el.dataset.dbId = dbRow.id;
      el.dataset.text = dbRow.text || "";
      el.dataset.note = dbRow.note || "";
      el.dataset.pageNumber = dbRow.page_number || "";
    });
  }

  function loadSerialized(serialized, rows) {
    ensureHighlighter();
    try {
      if (serialized) highlighter.deserialize(serialized);
    } catch (e) {
      console.warn("[Highlights] Failed to deserialize", e);
    }
    if (rows) {
      rows.forEach(r => attachMeta(r.local_id || "", r));
    }
  }

  function forEachHighlightSpan(fn) {
    if (!highlighter) return;
    highlighter.highlights.forEach(h => {
      h.getHighlightElements().forEach(el => fn(el, h));
    });
  }

  global.highlightModule = {
    setup,
    toggleMode,
    on,
    attachMeta,
    loadSerialized,
    forEachHighlightSpan
  };
})(window);

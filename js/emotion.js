/**
 * emotion.js
 * Handles emotion bar tap, context capture, Supabase insert, and floating emoji.
 * Assumes global: sb (Supabase), bookId, slug, chap, reader, window.selectedEmotion
 */

(function () {
  const popup = document.getElementById("emotion-popup");
  const label = document.getElementById("emotion-label");
  const zones = document.querySelectorAll(".emotion-zone");

  function showEmotion(emotion) {
    window.selectedEmotion = emotion;
    if (label) label.textContent = `You felt: ${emotion}`;
    if (popup) popup.style.display = "block";
  }

  function cancelEmotion() {
    if (popup) popup.style.display = "none";
  }

  function showFloatingEmoji(emotion) {
    const emoji = document.createElement("div");
    emoji.textContent = emotion;
    emoji.className = "floating-emoji";
    emoji.style.left = window.innerWidth / 2 + "px";
    emoji.style.top = window.innerHeight / 2 + "px";
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 1500);
  }

  function getTextNearMiddle() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const el = document.elementFromPoint(centerX, centerY);
    if (!el) return "";

    let node = el;
    while (node && node !== document.body && !node.textContent?.trim()) {
      node = node.parentElement;
    }

    return node?.textContent?.trim() || "";
  }

  async function confirmEmotion() {
    if (!window.selectedEmotion) {
      console.warn("[Emotion] No emotion selected");
      return;
    }
    if (popup) popup.style.display = "none";

    const { data: { session } } = await window.supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    const readerEl = document.getElementById("reader");
    const isVertical = document.body.classList.contains("vertical-mode");

    let textSource = getTextNearMiddle();
    const fullText = textSource;

    console.log("[Emotion Debug] Full text near middle:", fullText);

    const sel = window.getSelection();
    const selectedText = sel && !sel.isCollapsed ? sel.toString().trim() : null;
    console.log("[Emotion Debug] Selected text:", selectedText);

    let before = null, after = null;
    if (selectedText && fullText.includes(selectedText)) {
      const idx = fullText.indexOf(selectedText);
      before = fullText.slice(Math.max(0, idx - 30), idx);
      after = fullText.slice(idx + selectedText.length, idx + selectedText.length + 30);
    } else {
      before = fullText.slice(0, 30);
      after = fullText.slice(30, 60);
    }

    console.log("[Emotion Debug] Before:", before);
    console.log("[Emotion Debug] After:", after);

    let pageNumber = null;
    if (isVertical && readerEl) {
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      pageNumber = Math.max(1, Math.floor(readerEl.scrollTop / (vh * 0.95)) + 1);
    } else if (typeof window.page === "number") {
      pageNumber = window.page + 1;
    }

    console.log("[Emotion Debug] Page number:", pageNumber);

    const payload = {
      user_id: userId,
      book_id: window.bookId,
      book_slug: window.slug || null,
      chapter_index: window.chap || 0,
      page_number: pageNumber,
      emotion: window.selectedEmotion,
      text: selectedText,
      before_context: before,
      after_context: after,
      note: null,
      color: null,
      recorded_at: new Date().toISOString()
    };

    console.log("[Emotion] Inserting into Supabase:", payload);
    const { error, data } = await window.supabase.from("highlights").insert(payload).select().maybeSingle();
    if (error) {
      console.error("[Emotion] Insert error", error);
    } else {
      console.log("[Emotion] Insert successful", data);
      showFloatingEmoji(payload.emotion);
    }
  }

  zones.forEach(z => {
    ["click", "touchend"].forEach(ev =>
      z.addEventListener(ev, e => {
        e.preventDefault();
        if (document.body.classList.contains("highlight-mode")) return;
        showEmotion(z.dataset.emotion);
      }, { passive: false })
    );
  });

  window.confirmEmotion = confirmEmotion;
  window.cancelEmotion = cancelEmotion;
})();

// 🌐 Vertical mode logic with persistence
const params = new URLSearchParams(location.search);
let verticalParam = params.get('vert');

if (verticalParam === null) {
  // No URL param, fallback to localStorage
  verticalParam = localStorage.getItem('readerMode') || 'false';
  params.set('vert', verticalParam);
  window.location.search = params.toString(); // force reload with param
}

window.verticalMode = verticalParam === 'true';
localStorage.setItem('readerMode', verticalParam);
console.log(window.verticalMode ? '✅ Vertical mode enabled (persisted)' : 'ℹ️ Horizontal mode (persisted)');

document.addEventListener('DOMContentLoaded', () => {
  if (!window.verticalMode) {
    console.log("🚫 Skipping scroll tracking in horizontal mode");
    return;
  }

  const container = document.getElementById('reader');
  if (!container) {
    console.warn("⚠️ No #reader element found.");
    return;
  }

  let scrollTimeout;
  container.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const page = Math.floor(container.scrollTop / container.clientHeight);
      const chapter = window.chap ?? 0;
      console.log("📖 Saving vertical progress: Chapter", chapter, "Page", page);
      if (typeof saveReadingProgress === 'function') {
        saveReadingProgress(chapter, page);
      }
    }, 250);
  });
});

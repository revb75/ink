/* hide-broken.js
 * Minimal helper to hide broken images in chapter content.
 * Does NOT alter pagination or rewrite URLs.
 *
 * Usage in reader.html (after you inject chapter HTML):
 *   ChapterImages.hideBroken(readingContainer);
 * Or globally (once on load) to observe future chapters:
 *   ChapterImages.observe(readingContainer);
 */
(function (global){
  function hide(el){
    if (!el) return;
    el.style.display = "none";
    el.setAttribute("aria-hidden", "true");
  }

  function wireImg(img){
    if (!img || img.__inkwellHideWired) return;
    img.__inkwellHideWired = true;
    img.addEventListener("error", () => hide(img), { once:true });
    // Edge case: some browsers fire 'load' with zero naturalWidth on broken data
    img.addEventListener("load", () => {
      if ((img.naturalWidth|0) === 0) hide(img);
    }, { once:true });
  }

  function wireSvgImage(node){
    if (!node || node.__inkwellHideWired) return;
    node.__inkwellHideWired = true;
    // Try to load the href as an <img> to detect error
    const href = node.getAttribute("href") || node.getAttributeNS("http://www.w3.org/1999/xlink","href") || "";
    if (!href || /^data:|^blob:|^[a-z]+:\/\//i.test(href)) return;
    // Create a phantom img to test
    const ph = new Image();
    ph.onload = function(){ if ((ph.naturalWidth|0) === 0) node.remove(); };
    ph.onerror = function(){ node.remove(); };
    ph.src = href;
  }

  function hideBroken(container){
    if (!container) return;
    container.querySelectorAll("img").forEach(wireImg);
    container.querySelectorAll("svg image").forEach(wireSvgImage);
  }

  function observe(container){
    if (!container || container.__inkwellHideObserver) return;
    const obs = new MutationObserver((muts)=>{
      for (const m of muts){
        m.addedNodes && m.addedNodes.forEach(n=>{
          if (n.nodeType !== 1) return;
          if (n.tagName && n.tagName.toLowerCase() === "img") wireImg(n);
          if (n.matches) {
            n.matches("img") && wireImg(n);
            if (n.matches("svg image")) wireSvgImage(n);
            n.querySelectorAll && n.querySelectorAll("img").forEach(wireImg);
            n.querySelectorAll && n.querySelectorAll("svg image").forEach(wireSvgImage);
          }
        });
      }
    });
    obs.observe(container, { childList:true, subtree:true });
    container.__inkwellHideObserver = obs;
    // Wire existing
    hideBroken(container);
  }

  global.ChapterImages = { hideBroken, observe };
})(window);

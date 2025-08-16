/* asset-rewrite.js
 * Rewrites relative asset URLs in chapter XHTML to Supabase public URLs.
 * Handles: <img>, SVG <image>, <link rel="stylesheet">, and CSS url(...) in inline style attributes.
 *
 * Usage:
 *   1) Include this file in reader.html
 *        <script src="/js/asset-rewrite.js"></script>
 *   2) After you insert a chapter's XHTML into a container element:
 *        await InkWellAssets.rewrite(containerEl, {
 *          storageRoot: book.storage_root, // e.g., "The Book.epub"
 *          chapterPath: chapterHref,       // normalized path like "OEBPS/chapter-001.xhtml"
 *          bucket: "books"                 // default "books"
 *        });
 */
(function(global){
  function norm(p){ return (p || "").replace(/\\/g,"/"); }
  function dirname(p){
    p = norm(p);
    const i = p.lastIndexOf("/");
    return i >= 0 ? p.slice(0, i+1) : "";
  }
  function join(base, rel){
    base = norm(base);
    rel = norm(rel);
    if (!rel) return base;
    if (/^[a-z]+:\/\//i.test(rel) || rel.startsWith("data:") || rel.startsWith("blob:")) return rel;
    if (rel.startsWith("/")) return rel; // treat as absolute (leave untouched)
    const full = (base + rel).replace(/\/\.\//g,"/");
    const parts = [];
    full.split("/").forEach(seg => {
      if (!seg || seg === ".") return;
      if (seg === "..") { if (parts.length) parts.pop(); }
      else parts.push(seg);
    });
    return parts.join("/");
  }

  function getSb(){
    // Prefer global 'sb' if the app already created one
    if (global.sb && typeof global.sb === "object") return global.sb;
    if (global.supabase && typeof global.supabase.storage === "object") return global.supabase;
    throw new Error("Supabase client not found (expected global `sb` or `supabase`).");
  }

  function publicUrl(bucket, path){
    const client = getSb();
    try {
      const { data } = client.storage.from(bucket).getPublicUrl(path);
      return data && data.publicUrl ? data.publicUrl : null;
    } catch(e){
      console.warn("[assets] publicUrl error:", e);
      return null;
    }
  }

  function collectCssUrls(styleValue){
    // match url("...") or url('...') or url(...)
    const re = /url\(\s*(?:["']?)([^"')]+)(?:["']?)\s*\)/gi;
    const found = [];
    let m;
    while ((m = re.exec(styleValue))){
      if (m[1]) found.append ? found.append(m[1]) : found.push(m[1]);
    }
    return found;
  }

  function rewriteStyleUrls(el, baseDir, storageRoot, bucket){
    const style = el.getAttribute("style");
    if (!style || !style.includes("url(")) return;
    let replaced = style;
    const urls = collectCssUrls(style);
    urls.forEach(u => {
      const relPath = join(baseDir, u);
      const storagePath = norm(storageRoot ? storageRoot + "/" + relPath : relPath);
      const pub = publicUrl(bucket, storagePath);
      if (pub) {
        // replace exact occurrence
        // Use regex escaping for u
        const esc = u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        replaced = replaced.replace(new RegExp(`url\\((\\s*['"]?)${esc}(['"]?\\s*)\\)`, "g"), `url($1${pub}$2)`);
      } else {
        // if missing, remove the url() to avoid broken icon
        replaced = replaced.replace(new RegExp(`url\\((\\s*['"]?)${u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"]?\\s*)\\)`, "g"), "none");
      }
    });
    el.setAttribute("style", replaced);
  }

  async function rewrite(container, opts){
    const bucket = (opts && opts.bucket) || "books";
    const storageRoot = norm(opts && opts.storageRoot || "");
    const chapterPath = norm(opts && opts.chapterPath || "");
    const baseDir = dirname(chapterPath);

    // <img> in HTML/XHTML
    container.querySelectorAll("img[src]").forEach(img => {
      const src = img.getAttribute("src") || "";
      if (!src) return;
      if (/^data:|^blob:|^[a-z]+:\/\//i.test(src)) return;
      const relPath = join(baseDir, src);
      const storagePath = norm(storageRoot ? storageRoot + "/" + relPath : relPath);
      const pub = publicUrl(bucket, storagePath);
      if (pub) img.setAttribute("src", pub);
      else img.remove(); // hide broken
    });

    // <image> inside inline SVGs
    container.querySelectorAll("svg image[href], svg image[xlink\\:href]").forEach(node => {
      const raw = node.getAttribute("href") || node.getAttribute("xlink:href") || "";
      if (!raw) return;
      if (/^data:|^blob:|^[a-z]+:\/\//i.test(raw)) return;
      const relPath = join(baseDir, raw);
      const storagePath = norm(storageRoot ? storageRoot + "/" + relPath : relPath);
      const pub = publicUrl(bucket, storagePath);
      if (pub) {
        node.setAttribute("href", pub);
        node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", pub);
      } else node.remove();
    });

    // inline style="background:url(...)"
    container.querySelectorAll("[style*='url(']").forEach(el => {
      rewriteStyleUrls(el, baseDir, storageRoot, bucket);
    });

    // linked stylesheets within the chapter content (rare but possible)
    container.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
      const href = link.getAttribute("href") || "";
      if (!href || /^[a-z]+:\/\//i.test(href)) return;
      const relPath = join(baseDir, href);
      const storagePath = norm(storageRoot ? storageRoot + "/" + relPath : relPath);
      const pub = publicUrl(bucket, storagePath);
      if (pub) link.setAttribute("href", pub);
      else link.remove();
    });
  }

  global.InkWellAssets = { rewrite };
})(window);

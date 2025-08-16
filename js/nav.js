document.addEventListener("DOMContentLoaded", () => {
// /js/nav.js — fresh, working, simple slide-out (left)
(() => {
  if (window.__navFresh) return; window.__navFresh = 1;

  const DEFAULT_LINKS = [
    { text: "Analytics", href: "/analytics.html" },
    { text: "Dashboard", href: "/dashboard.html" },
    { text: "Library", href: "/library.html" },
    { text: "Profile", href: "/profile.html" },
    { text: "Upload", href: "/upload.html" },
    { text: "Logout", onclick: "logout()" }
  ];

  function getLinks() {
    const a = Array.isArray(window.navLinks) ? window.navLinks : [];
    return a.length ? a : DEFAULT_LINKS;
  }

  if (typeof window.logout !== "function") {
    window.logout = async () => {
      if (!window.supabase || !supabase.auth) {
        console.warn("⏳ Supabase not ready yet. Trying again...");
        setTimeout(window.logout, 300);
        return;
      }
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. See console.");
      } else {
        console.log("✅ Logged out.");
        window.location.href = "/index.html";
      }
    };
  }

  const css = `
  .nav-b{position:fixed;top:12px;left:12px;z-index:2147483647;width:44px;height:44px;border:0;background:transparent;padding:8px;cursor:pointer}
  .nav-b span{display:block;width:28px;height:2px;background:#222;margin:6px 0;border-radius:1px}
  .nav-ov{position:fixed;inset:0;background:transparent;pointer-events:none;z-index:2147483645}
  .nav-ov.show{background:rgba(0,128,0,0.3);pointer-events:auto}
  .nav-d{position:fixed;top:0;left:0;height:100%;width:280px;max-width:86vw;background:#fff;color:#222;border-right:1px solid #eaeaea;transform:translateX(-100%);transition:.22s ease transform;z-index:2147483646;display:flex;flex-direction:column}
  .nav-d.show{transform:translateX(0)}
  .nav-x{position:absolute;top:10px;right:10px;width:36px;height:36px;border:0;background:transparent;font-size:24px;line-height:1;cursor:pointer}
  .nav-ul{list-style:none;margin:48px 0 0 0;padding:8px 12px}
  .nav-ul a,.nav-ul button{display:block;width:100%;text-align:left;padding:12px 8px;background:transparent;border:0;color:#222;text-decoration:none;font-size:16px;border-radius:8px;cursor:pointer}
  .nav-ul a:hover,.nav-ul button:hover{background:#f6f6f6}
  `;
  const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);

  const b = document.createElement("button");
  b.className = "nav-b"; b.setAttribute("aria-label","Open menu");
  b.innerHTML = "<span></span><span></span><span></span>";
  document.body.appendChild(b);

  const ov = document.createElement("div"); ov.className = "nav-ov"; document.body.appendChild(ov);
  const d = document.createElement("aside"); d.className = "nav-d"; d.setAttribute("aria-label","Main menu"); document.body.appendChild(d);
  const x = document.createElement("button"); x.className = "nav-x"; x.setAttribute("aria-label","Close menu"); x.innerHTML = "&times;"; d.appendChild(x);
  const ul = document.createElement("ul"); ul.className = "nav-ul"; d.appendChild(ul);

  function render() {
    ul.textContent = "";
    (getLinks()).forEach(item => {
      const li = document.createElement("li");
      if (item.onclick) {
        const btn = document.createElement("button");
        btn.textContent = item.text;
        btn.onclick = () => {
          const fn = String(item.onclick).replace(/\(\s*\)$/,"").split(".").reduce((a,k)=>a&&a[k], window);
          if (typeof fn === "function") fn();
          close();
        };
        li.appendChild(btn);
      } else {
        const a = document.createElement("a");
        a.textContent = item.text;
        a.href = item.href || "#";
        if (item.target) a.target = item.target;
        if (a.target === "_blank") a.rel = "noopener noreferrer";
        a.addEventListener("click", close);
        li.appendChild(a);
      }
      ul.appendChild(li);
    });
  }

  function open(){ render(); ov.classList.add("show"); d.classList.add("show"); document.documentElement.style.overflow="hidden"; document.body.style.overflow="hidden"; }
  function close(){ ov.classList.remove("show"); d.classList.remove("show"); document.documentElement.style.overflow=""; document.body.style.overflow=""; }

  b.addEventListener("click", open);
  x.addEventListener("click", close);
  ov.addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && d.classList.contains("show")) close(); });

  console.log("[nav] ready; default links:", DEFAULT_LINKS.length);
})();

});

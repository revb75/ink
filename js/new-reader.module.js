import { isVertical, setVertical } from './reader-state.js';
import { initGestures } from './gestures.js';

// Optional: wait for existing Supabase without requiring it
function waitForSupabase(timeoutMs=8000){
  return new Promise(res=>{
    const t0=Date.now();
    (function tick(){
      if (window.supabase && typeof window.supabase.from==='function') return res(window.supabase);
      if (Date.now()-t0>=timeoutMs) return res(null);
      setTimeout(tick,50);
    })();
  });
}

function toast(msg){
  const t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 1200);
}

function renderSample(){
  const reader=document.getElementById('reader'); reader.innerHTML='';
  const title=new URLSearchParams(location.search).get('book')||'Welcome';
  for(let i=1;i<=3;i++){
    const d=document.createElement('div'); d.className='page';
    d.innerHTML=`<h2>${title} — Page ${i}</h2>
    <p>Select any text and click the 🖍️ button to simulate a highlight.</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis, nibh nec viverra gravida, sapien arcu posuere massa, vel aliquet lacus felis non lectus.</p>`;
    reader.appendChild(d);
  }
}

function enableHighlight(){
  const sel=window.getSelection(); const picked = sel && sel.toString().trim();
  if(!picked){ toast('Select some text first'); return }
  toast('Saved highlight');
}

async function renderFromSupabaseIfAvailable(){
  const sb = await waitForSupabase();
  if(!sb){ renderSample(); return }

  try{
    // Try books table first (common in your project)
    const qs=new URLSearchParams(location.search);
    const bookParam=qs.get('book');
    let bookId = null;

    // Try ./fetch.js if present for slug->id
    try{
      const mod = await import('./fetch.js');
      if(typeof mod.fetchBookIdBySlug==='function'){
        bookId = await mod.fetchBookIdBySlug(bookParam);
      }
    }catch{}

    // If no id from slug and param looks like UUID or numeric, pass-through
    if(!bookId && bookParam) bookId = bookParam;

    if(bookId){
      // Prefer books single row with HTML content under common columns
      const { data, error } = await sb.from('books').select('*').eq('id', bookId).maybeSingle();
      if(!error && data){
        const html = data.content_html || data.html || data.body_html || data.content || data.body || data.text || '';
        if(html){
          const reader=document.getElementById('reader'); reader.innerHTML='';
          const el=document.createElement('div'); el.className='page'; el.innerHTML=html; reader.appendChild(el);
          return;
        }
      }
    }
  }catch(e){
    console.warn('[new-reader] Supabase fallback error', e);
  }
  // fallback if nothing fetched
  renderSample();
}

function bindUI(){
  const modeBtn = document.getElementById('modeBtn');
  const hlBtn = document.getElementById('hlBtn');
  if(isVertical()) document.body.classList.add('vertical');
  modeBtn?.addEventListener('click', ()=>{
    const now = !isVertical(); setVertical(now);
    document.body.classList.toggle('vertical', now);
  });
  hlBtn?.addEventListener('click', enableHighlight);
}

document.addEventListener('DOMContentLoaded', async ()=>{
  bindUI();
  initGestures(document);
  await renderFromSupabaseIfAvailable();
});

// Expose simple APIs for manual testing
window.renderFromHTML = function(html){
  const reader=document.getElementById('reader'); reader.innerHTML='';
  const el=document.createElement('div'); el.className='page'; el.innerHTML=html||'<p>(empty)</p>'; reader.appendChild(el);
  toast('Rendered from HTML');
};

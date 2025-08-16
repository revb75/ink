// gestures.js — compatibility exports for highlight-gate.js and internal use
let gateCb=null, enabled=true;
export function disableGestures(){ enabled=false; gateCb?.(false); }
export function enableGestures(){ enabled=true; gateCb?.(true); }
export function initGestures(root=document){ root.dispatchEvent(new CustomEvent('inkwell:gestures-ready',{detail:{enabled}})); }
export function setHighlightGate(fn){ gateCb=(typeof fn==='function')?fn:null; }

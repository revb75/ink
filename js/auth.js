// /js/auth.js
import { supabase } from './supabase.js';

window.INKWELL_USER_ID = null;

async function refreshUser() {
  const { data: { session } } = await supabase.auth.getSession();
  const id = session?.user?.id || null;
  window.INKWELL_USER_ID = id;
  return id;
}

supabase.auth.onAuthStateChange((_evt, session) => {
  window.INKWELL_USER_ID = session?.user?.id || null;
});

export async function withUser(fn) {
  const id = await refreshUser();
  if (!id) {
    location.href = '/index.html'; // force login
    return;
  }
  return fn(id);
}

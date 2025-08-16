// /js/auth.js
// Auth utilities built on the singleton supabase client

import { supabase } from './supabase.js';

export async function getSession(){
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) console.error('[InkWell] getSession error:', error);
  return session || null;
}

export async function getUser(){
  const session = await getSession();
  return session?.user || null;
}

// Helper: run a function only when a user is available (provides userId and user object)
export async function withUser(fn){
  const user = await getUser();
  if (!user){
    console.warn('❌ No session found – user not logged in');
    return;
  }
  try { await fn(user.id, user); }
  catch (e) { console.error('[InkWell] withUser handler error:', e); }
}

// Optional: subscribe to auth state changes
export function onAuthChange(cb){
  return supabase.auth.onAuthStateChange((event, session) => {
    try { cb?.(event, session); } catch(e){ console.error('onAuthChange cb error:', e); }
  });
}

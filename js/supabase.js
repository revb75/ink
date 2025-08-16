// /js/supabase.js
// Singleton Supabase client initializer to avoid multiple GoTrueClient instances.
// Usage: import { supabase } from './supabase.js'

const SUPABASE_URL = 'https://hrxkqvifqawrnpzokome.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyeGtxdmlmcWF3cm5wem9rb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzQ0MDIsImV4cCI6MjA2Mjc1MDQwMn0.UZVhGweJEQBxqtrp37G77YmAefQWZYDGzdk1lyj4ua4';

async function ensureLib(){
  // If a client instance already exists, return it directly.
  if (globalThis.__supabase_instance__) return globalThis.__supabase_instance__;

  // If 'supabase' looks like a client (has auth.getSession), reuse it.
  if (globalThis.supabase && typeof globalThis.supabase?.auth?.getSession === 'function'){
    globalThis.__supabase_instance__ = globalThis.supabase;
    return globalThis.__supabase_instance__;
  }

  // If 'supabase' looks like the library (has createClient), use it.
  if (globalThis.supabase && typeof globalThis.supabase?.createClient === 'function'){
    const client = globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { storageKey: 'inkwell.auth', autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
    });
    globalThis.__supabase_instance__ = client;
    return client;
  }

  // Otherwise, import the library (ESM) dynamically.
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { storageKey: 'inkwell.auth', autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
  });
  globalThis.__supabase_instance__ = client;
  return client;
}

export const supabase = await ensureLib();
export default supabase;

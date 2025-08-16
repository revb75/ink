// /js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://hrxkqvifqawrnpzokome.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOi...ua4'; // your existing anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase; // optional for non-module scripts

// /js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://hrxkqvifqawrnpzokome.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyeGtxdmlmcWF3cm5wem9rb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzQ0MDIsImV4cCI6MjA2Mjc1MDQwMn0.UZVhGweJEQBxqtrp37G77YmAefQWZYDGzdk1lyj4ua4'; // your existing anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase; // optional for non-module scripts

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = window.INKWELL_SUPABASE_URL || 'https://hrxkqvifqawrnpzokome.supabase.co';
const SUPABASE_ANON_KEY = window.INKWELL_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyeGtxdmlmcWF3cm5wem9rb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzQ0MDIsImV4cCI6MjA2Mjc1MDQwMn0.UZVhGweJEQBxqtrp37G77YmAefQWZYDGzdk1lyj4ua4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase;

export async function fetchBookIdBySlug(slug) {
  const { data, error } = await window.supabase
    .from('books')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export function insertEmotionLog(entry) {
  console.log('[Emotion] insertEmotionLog called with:', entry);
  if (!entry.emotion) return;
  return window.window.supabase.from('highlights').insert([{
    user_id: entry.user_id,
    book_id: entry.book_id,
    chapter_index: entry.chapter_index,
    emotion: entry.emotion,
    recorded_at: entry.timestamp
  }]);
}

export async function saveReadingProgress(user_id, book_id, chapter_index, progress_percent) {
  const payload = [{
    user_id,
    book_id,
    chapter_index,
    progress_percent,
    updated_at: new Date().toISOString()
  }];

  const { error } = await window.supabase
    .from('reading_progress')
    .upsert(payload, { onConflict: ['user_id', 'book_id'] });

  if (error && error.code !== '409') {
    console.error('❌ Failed to save reading progress:', error);
  } else {
    console.log('✅ Reading progress saved:', payload);
  }
}

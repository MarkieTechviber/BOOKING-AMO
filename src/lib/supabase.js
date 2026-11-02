import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ajkzcocpptgfovrhjdsr.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqa3pjb2NwcHRnZm92cmhqZHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MDYzMTIsImV4cCI6MjEwNzE4MjMxMn0.fssgVIFHro6hZcs5kZM-veR2L2Z7OuJYzbhY7xFN10M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

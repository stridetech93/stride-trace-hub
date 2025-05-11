
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Get the environment variables, providing fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a check to provide a helpful development message
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

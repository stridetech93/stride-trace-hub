
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Use the existing config from src/integrations/supabase/client.ts
const SUPABASE_URL = "https://jaccigbkopobihlhhgpw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphY2NpZ2Jrb3BvYmlobGhoZ3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTM1OTksImV4cCI6MjA2MjU2OTU5OX0.H318e7xY2vkZdqsOSGtqHoCh4ExJl33aR5y0qzHExtk";

// Create the Supabase client with proper configuration for authentication
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

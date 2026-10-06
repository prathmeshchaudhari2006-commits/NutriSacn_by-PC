import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || supabaseUrl.includes('example.supabase.co')) {
    // Return mock interface fallback if Supabase environment variables are unconfigured
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

import { createClient } from '@supabase/supabase-js';

// Configuration directe (solution de secours)
const supabaseUrl = 'https://iukqrcngjtetcqrgmdhc.supabase.co';
const supabaseAnonKey = 'sb_publishable_niJx-IcFNWnSSfPm-Fv6rA_nB8PlE-q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;
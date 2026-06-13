import {createClient} from '@supabase/supabase-js';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
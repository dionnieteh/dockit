"use client"
import { createClient } from "@supabase/supabase-js";

console.log('=== BUILD TIME vs RUNTIME DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Check if these are literally the strings from your Railway config
console.log('URL value:', JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL));
console.log('Key value:', JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));

// Check all available environment variables
console.log('All env keys:', Object.keys(process.env));
console.log('NEXT_PUBLIC keys:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || 'missing-url',
  supabaseAnonKey || 'missing-key'
);
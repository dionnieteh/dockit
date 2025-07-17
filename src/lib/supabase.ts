"use client"
import { createClient } from "@supabase/supabase-js";

//TODO find out why env doesnt work in dev
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
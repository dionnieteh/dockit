import { createClient } from "@supabase/supabase-js";

//TODO find out why env doesnt work in dev
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://luhulppfsxuphyukfuzx.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1aHVscHBmc3h1cGh5dWtmdXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTI3NjAsImV4cCI6MjA2Nzg4ODc2MH0.MwMNujJ8KRTuvXRSji2diQDq6Sq-v_sFF2pSWcEec6M"
);
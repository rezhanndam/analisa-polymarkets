import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL and Key are not provided. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

// Client browser/public (bisa dipakai di komponen klien dengan aman)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co", 
  supabaseKey || "placeholder_key"
);

// Admin client (HANYA untuk server-side/API route, bisa bypass RLS)
export const supabaseAdmin = serviceKey 
  ? createClient(supabaseUrl || "https://placeholder.supabase.co", serviceKey)
  : supabase;

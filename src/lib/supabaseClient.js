import { createClient } from "@supabase/supabase-js";

// Membaca variabel lingkungan yang sudah kita siapkan di file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Membuat dan mengekspor satu klien Supabase untuk digunakan di seluruh aplikasi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

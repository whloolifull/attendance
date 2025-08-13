import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lndksrdypnligsjqvjda.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZGtzcmR5cG5saWdzanF2amRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NTE0NjQsImV4cCI6MjA2NzUyNzQ2NH0.m_bJhXGPqKsTuwUAs4uL7HVAet_mRu371z5wKifX5e8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

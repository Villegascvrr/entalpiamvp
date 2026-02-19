import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// Supabase Client — Singleton
// Uses the anon (publishable) key. All queries respect RLS.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
// to point to local Supabase (e.g. http://127.0.0.1:54321).
// ─────────────────────────────────────────────────────────────

const DEFAULT_URL = "https://syqhaewpxflmpmtmjspa.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5cWhhZXdweGZsbXBtdG1qc3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjA5NjgsImV4cCI6MjA4NjQzNjk2OH0.VcwTMRelMsjRQ56Yhi3sDGamiejqkD62ni08QmrAvrI";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? DEFAULT_URL;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? DEFAULT_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

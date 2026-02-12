import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// Supabase Client — Singleton
// Uses the anon (publishable) key. All queries respect RLS.
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://syqhaewpxflmpmtmjspa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5cWhhZXdweGZsbXBtdG1qc3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjA5NjgsImV4cCI6MjA4NjQzNjk2OH0.VcwTMRelMsjRQ56Yhi3sDGamiejqkD62ni08QmrAvrI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

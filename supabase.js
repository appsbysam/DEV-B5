
// Supabase connection
// 1) Create a Supabase project.
// 2) Run schema.sql in the Supabase SQL Editor.
// 3) Replace the placeholders below with your Project URL and anon/public key.

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

window.db = null;

if (
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("YOUR_") &&
  !SUPABASE_ANON_KEY.includes("YOUR_") &&
  window.supabase
) {
  window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

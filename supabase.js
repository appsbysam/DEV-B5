// Supabase connection for dev-B5
// Project: All Season Car Rental development

const SUPABASE_URL = "https://hckccqvtxweulskcqhcn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_beJk42tH45hBTQkax6tdDg_2YtSsVPG";

window.db = null;

if (window.supabase) {
  window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

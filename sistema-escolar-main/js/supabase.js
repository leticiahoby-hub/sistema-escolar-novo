// Cole aqui os dados do seu projeto Supabase.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://sxkfmlnwcxhqutkznbgn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oBbd0k4lzH1oy4IlfKd3hA_BYpH0Gnd";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

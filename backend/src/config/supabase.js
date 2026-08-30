const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

// Admin client with service role key - for server-side operations
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Public client with anon key - for RLS-respecting operations
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

module.exports = { supabaseAdmin, supabase };

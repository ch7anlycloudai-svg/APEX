/**
 * APEX Commerce Database Setup Script
 * Runs migrations against Supabase PostgreSQL
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load env
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

async function executeSql(sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/`;

  // Use the pg-meta query endpoint
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    const urlObj = new URL(`${SUPABASE_URL}/pg/query`);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Alternative: use supabase-js with raw SQL via rpc
async function executeSqlViaRpc(sql) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Try using the built-in SQL execution
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
  return { data, error };
}

// Split SQL into individual statements and execute via REST
async function executeStatementsViaRest(sql) {
  // Remove comments and split by semicolons
  const statements = sql
    .replace(/--.*$/gm, '')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 60).replace(/\n/g, ' ');
    process.stdout.write(`  [${i + 1}/${statements.length}] ${preview}... `);

    try {
      const result = await executeSql(stmt);
      if (result.status >= 200 && result.status < 300) {
        console.log('OK');
      } else if (result.status === 404) {
        // pg/query endpoint not available, will try alternative
        console.log('SKIP (endpoint not available)');
        return false;
      } else {
        const errMsg = typeof result.data === 'object' ? JSON.stringify(result.data) : result.data;
        console.log(`WARN (${result.status}): ${errMsg.substring(0, 100)}`);
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }
  return true;
}

async function main() {
  console.log('=== APEX Commerce Database Setup ===');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = ['001_schema.sql', '002_rls_policies.sql', '003_storage.sql'];

  for (const file of files) {
    console.log(`\n--- Running ${file} ---`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    const success = await executeStatementsViaRest(sql);

    if (!success) {
      console.log('\n*** Direct SQL endpoint not available ***');
      console.log('Please run the SQL manually in your Supabase Dashboard:');
      console.log('  1. Go to https://supabase.com/dashboard');
      console.log('  2. Select your project');
      console.log('  3. Go to SQL Editor');
      console.log('  4. Paste and run each migration file:');
      files.forEach(f => console.log(`     - server/src/db/migrations/${f}`));
      console.log('\nAlternatively, the SQL content has been printed below.\n');

      // Print the SQL for manual execution
      for (const f of files) {
        console.log(`\n========== ${f} ==========`);
        console.log(fs.readFileSync(path.join(migrationsDir, f), 'utf8'));
      }
      break;
    }
  }

  // Verify tables were created
  console.log('\n--- Verifying tables ---');
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const tables = ['stores', 'users', 'store_settings', 'store_themes',
                  'categories', 'products', 'product_images', 'customers', 'orders', 'order_items'];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && error.code === 'PGRST205') {
      console.log(`  ${table}: NOT FOUND`);
    } else if (error) {
      console.log(`  ${table}: ERROR - ${error.message}`);
    } else {
      console.log(`  ${table}: OK`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);

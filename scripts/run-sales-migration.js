/**
 * Run Sales Inquiries Migration
 *
 * This script creates the sales_inquiries table in Supabase.
 * Run with: node scripts/run-sales-migration.js
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_SECRET_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_SECRET_KEY)')
  console.error('\n📝 Please create a .env.local file with these variables.')
  console.error('\n📋 Alternatively, you can run the SQL manually:')
  console.error('   1. Go to your Supabase project dashboard')
  console.error('   2. Navigate to SQL Editor')
  console.error('   3. Run the SQL from: scripts/migrations/012_sales_inquiries.sql')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('\n📊 Running Sales Inquiries Migration...\n')

  try {
    const sqlPath = path.join(process.cwd(), 'scripts/migrations/012_sales_inquiries.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('   Reading migration file: 012_sales_inquiries.sql')

    // Execute the SQL via Supabase client
    // Note: Supabase client doesn't have direct SQL execution, so we'll use the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      throw new Error(`Migration failed: ${response.statusText}`)
    }

    console.log('✅ Migration completed successfully!\n')
    console.log('📋 Created:')
    console.log('   - sales_inquiries table')
    console.log('   - Row Level Security policies')
    console.log('   - Indexes for performance')
    console.log('   - Auto-update trigger\n')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('\n📝 Manual Migration Instructions:')
    console.error('   1. Go to https://supabase.com/dashboard')
    console.error('   2. Select your project')
    console.error('   3. Navigate to SQL Editor')
    console.error('   4. Copy and paste the contents of:')
    console.error('      scripts/migrations/012_sales_inquiries.sql')
    console.error('   5. Click "Run" to execute the migration\n')
    process.exit(1)
  }
}

runMigration()

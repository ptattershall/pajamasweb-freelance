/**
 * Run All Migrations via Supabase REST API
 * 
 * This script runs all migration files by executing SQL through the Supabase REST API.
 * 
 * Run with: node scripts/run-migrations-via-api.js
 */

require('dotenv').config({ path: '.env.local' })

const fs = require('fs')
const pathModule = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_SECRET_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_SECRET_KEY')
  process.exit(1)
}

const migrations = [
  '001_create_bookings_table.sql',
  '002_client_portal_phase1.sql',
  '003_client_portal_phase3_invoices.sql',
  '004_client_portal_phase4_bookings.sql',
  '005_client_portal_phase5_deliverables.sql',
  '006_client_portal_phase6_milestones.sql',
]

async function executeSql(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
    },
    body: JSON.stringify({ query: sql }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HTTP ${response.status}: ${error}`)
  }
  
  return response.json()
}

async function runMigrations() {
  console.log('\n🚀 Starting database migrations via REST API...\n')
  
  let successCount = 0
  let failureCount = 0
  
  for (const migration of migrations) {
    try {
      const sqlPath = pathModule.join(process.cwd(), `scripts/migrations/${migration}`)
      const sql = fs.readFileSync(sqlPath, 'utf-8')
      
      console.log(`⏳ Running: ${migration}`)
      
      // Try to execute the SQL
      try {
        await executeSql(sql)
        console.log(`   ✅ Success`)
        successCount++
      } catch (error) {
        // If REST API doesn't work, provide manual instructions
        console.error(`   ⚠️  Could not execute via API: ${error.message}`)
        console.log(`   📋 Please run this SQL manually in Supabase SQL Editor:`)
        console.log(`      File: scripts/migrations/${migration}`)
        failureCount++
      }
    } catch (error) {
      console.error(`   ❌ Error reading file: ${error.message}`)
      failureCount++
    }
  }
  
  console.log(`\n📊 Migration Summary:`)
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ⚠️  Manual: ${failureCount}`)
  
  if (failureCount > 0) {
    console.log(`\n📝 Manual Migration Instructions:`)
    console.log(`   1. Go to: ${supabaseUrl}/project/_/sql`)
    console.log(`   2. For each migration file, copy the SQL and run it`)
    console.log(`   3. Files are in: scripts/migrations/`)
  }
}

runMigrations().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})


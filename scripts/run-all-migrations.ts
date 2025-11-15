/**
 * Run All Migrations Script
 * 
 * This script runs all migration files in order to ensure the Supabase database
 * is fully up to date with all tables and schemas.
 * 
 * Run with: npx ts-node scripts/run-all-migrations.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_SECRET_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_SECRET_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const migrations = [
  '001_create_bookings_table.sql',
  '002_client_portal_phase1.sql',
  '003_client_portal_phase3_invoices.sql',
  '004_client_portal_phase4_bookings.sql',
  '005_client_portal_phase5_deliverables.sql',
  '006_client_portal_phase6_milestones.sql',
]

async function runMigrations() {
  console.log('\n🚀 Starting database migrations...\n')
  
  let successCount = 0
  let failureCount = 0
  
  for (const migration of migrations) {
    try {
      const sqlPath = path.join(process.cwd(), `scripts/migrations/${migration}`)
      const sql = fs.readFileSync(sqlPath, 'utf-8')
      
      console.log(`⏳ Running: ${migration}`)
      
      // Execute the SQL
      const { error } = await supabase.rpc('exec', { sql })
      
      if (error) {
        console.error(`   ❌ Failed: ${error.message}`)
        failureCount++
      } else {
        console.log(`   ✅ Success`)
        successCount++
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`)
      failureCount++
    }
  }
  
  console.log(`\n📊 Migration Summary:`)
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${failureCount}`)
  
  if (failureCount === 0) {
    console.log(`\n✨ All migrations completed successfully!`)
    await verifyTables()
  } else {
    console.log(`\n⚠️  Some migrations failed. Please check the errors above.`)
    process.exit(1)
  }
}

async function verifyTables() {
  console.log(`\n🔍 Verifying tables...\n`)
  
  const expectedTables = [
    'bookings',
    'booking_history',
    'profiles',
    'invoices',
    'contracts',
    'deliverables',
    'project_milestones',
    'milestone_updates',
  ]
  
  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error && error.code !== 'PGRST116') {
        console.log(`   ❌ ${table}: ${error.message}`)
      } else {
        console.log(`   ✅ ${table}`)
      }
    } catch (error) {
      console.log(`   ❌ ${table}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  console.log(`\n✨ Database is up to date!`)
}

runMigrations().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})


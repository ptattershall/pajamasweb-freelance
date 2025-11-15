/**
 * Verify Migrations Script
 * 
 * This script checks which tables exist in your Supabase database
 * to verify that migrations have been applied.
 * 
 * Run with: node scripts/verify-migrations.js
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const expectedTables = {
  'Migration 1: Bookings': ['bookings', 'booking_history'],
  'Migration 2: Profiles': ['profiles'],
  'Migration 3: Invoices': ['invoices'],
  'Migration 4: Extended Bookings': ['bookings'],
  'Migration 5: Deliverables': ['contracts', 'deliverables'],
  'Migration 6: Milestones': ['project_milestones', 'milestone_updates'],
}

async function verifyMigrations() {
  console.log('\n🔍 Verifying Database Migrations\n')
  console.log(`Supabase URL: ${supabaseUrl}\n`)
  
  let allTablesExist = true
  let completedMigrations = 0
  
  for (const [migration, tables] of Object.entries(expectedTables)) {
    console.log(`📋 ${migration}`)
    
    let migrationComplete = true
    for (const table of tables) {
      try {
        // Try to query the table to see if it exists
        const { data, error, status } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (status === 406) {
          // 406 means table doesn't exist
          console.log(`   ❌ ${table} - NOT FOUND`)
          migrationComplete = false
          allTablesExist = false
        } else if (error && error.code === 'PGRST116') {
          // PGRST116 means table exists but is empty or no rows match
          console.log(`   ✅ ${table}`)
        } else if (error) {
          console.log(`   ⚠️  ${table} - Error: ${error.message}`)
          migrationComplete = false
        } else {
          console.log(`   ✅ ${table}`)
        }
      } catch (error) {
        console.log(`   ❌ ${table} - ${error.message}`)
        migrationComplete = false
        allTablesExist = false
      }
    }
    
    if (migrationComplete) {
      completedMigrations++
    }
    console.log('')
  }
  
  console.log(`📊 Summary:`)
  console.log(`   Completed Migrations: ${completedMigrations}/${Object.keys(expectedTables).length}`)
  
  if (allTablesExist) {
    console.log(`\n✨ All migrations are applied! Your database is up to date.`)
    return 0
  } else {
    console.log(`\n⚠️  Some tables are missing. Please run the migrations.`)
    console.log(`\n📖 See docs/MIGRATION_GUIDE.md for instructions.`)
    return 1
  }
}

verifyMigrations()
  .then(code => process.exit(code))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })


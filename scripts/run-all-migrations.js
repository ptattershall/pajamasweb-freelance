/**
 * Run All Migrations Script (Node.js version)
 *
 * This script runs all migration files in order to ensure the Supabase database
 * is fully up to date with all tables and schemas.
 *
 * Run with: node scripts/run-all-migrations.js
 */

require('dotenv').config({ path: '.env.local' })

const { Client } = require('pg')
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

// Extract database connection info from Supabase URL
const projectId = supabaseUrl.split('//')[1].split('.')[0]
const dbHost = `${projectId}.supabase.co`
const dbPort = 5432
const dbName = 'postgres'
const dbUser = 'postgres'
const dbPassword = serviceRoleKey

const migrations = [
  '001_create_bookings_table.sql',
  '002_client_portal_phase1.sql',
  '003_client_portal_phase3_invoices.sql',
  '004_client_portal_phase4_bookings.sql',
  '005_client_portal_phase5_deliverables.sql',
  '006_client_portal_phase6_milestones.sql',
]

async function runMigrations() {
  const client = new Client({
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPassword,
    ssl: 'require',
    connectionTimeoutMillis: 10000,
  })

  try {
    await client.connect()
    console.log('\n🚀 Starting database migrations...\n')

    let successCount = 0
    let failureCount = 0

    for (const migration of migrations) {
      try {
        const sqlPath = pathModule.join(process.cwd(), `scripts/migrations/${migration}`)
        const sql = fs.readFileSync(sqlPath, 'utf-8')

        console.log(`⏳ Running: ${migration}`)
        await client.query(sql)
        console.log(`   ✅ Success`)
        successCount++
      } catch (error) {
        console.error(`   ❌ Error: ${error.message || String(error)}`)
        failureCount++
      }
    }

    console.log(`\n📊 Migration Summary:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Failed: ${failureCount}`)

    if (failureCount === 0) {
      console.log(`\n✨ All migrations completed successfully!`)
      await verifyTables(client)
    } else {
      console.log(`\n⚠️  Some migrations failed. Please check the errors above.`)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

async function verifyTables(client) {
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
      const result = await client.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)`,
        [table]
      )

      if (result.rows[0].exists) {
        console.log(`   ✅ ${table}`)
      } else {
        console.log(`   ❌ ${table}: Table not found`)
      }
    } catch (error) {
      console.log(`   ❌ ${table}: ${error.message || String(error)}`)
    }
  }

  console.log(`\n✨ Database is up to date!`)
}

runMigrations().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})


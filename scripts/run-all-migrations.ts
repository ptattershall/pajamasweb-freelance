/**
 * Run All Migrations Script
 *
 * Uses direct PostgreSQL connection via DATABASE_URL. Supabase does not expose
 * raw SQL execution via the REST API, so we need a direct DB connection.
 *
 * Get DATABASE_URL from: Supabase Dashboard → Settings → Database → Connection string
 * Use the "Direct connection" or "Session mode" URI.
 *
 * Run with: npm run migrate
 */

import 'dotenv/config'
import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

config({ path: '.env.local' })

const migrations = [
  '001_create_bookings_table.sql',
  '002_client_portal_phase1.sql',
  '003_client_portal_phase3_invoices.sql',
  '004_client_portal_phase4_bookings.sql',
  '005_client_portal_phase5_deliverables.sql',
  '006_client_portal_phase6_milestones.sql',
  '007_client_portal_avatar_storage.sql',
  '008_add_invoice_urls.sql',
  '009_add_booking_notes.sql',
  '009_client_invitations.sql',
  '010_client_portal_file_storage.sql',
  '011_milestone_notifications.sql',
  '012_subscriptions_table.sql',
  '013_subscriptions_client_id_nullable.sql',
]

const expectedTables = [
  'bookings',
  'booking_history',
  'profiles',
  'invoices',
  'contracts',
  'deliverables',
  'project_milestones',
  'milestone_updates',
  'subscriptions',
]

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ Missing DATABASE_URL environment variable.\n')
    console.error('   Add it to .env.local. Get it from:')
    console.error('   Supabase Dashboard → Project Settings → Database → Connection string\n')
    console.error('   Use "Direct connection" or "Session mode" (URI format).')
    console.error('   Example: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres')
    process.exit(1)
  }

  const { Client } = await import('pg')

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  })

  try {
    await client.connect()
    console.log('\n🚀 Starting database migrations...\n')

    let successCount = 0
    let failureCount = 0

    for (const migration of migrations) {
      try {
        const sqlPath = path.join(process.cwd(), `scripts/migrations/${migration}`)
        const sql = fs.readFileSync(sqlPath, 'utf-8')

        console.log(`⏳ Running: ${migration}`)
        await client.query(sql)
        console.log(`   ✅ Success`)
        successCount++
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error(`   ❌ Failed: ${msg}`)
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
    const msg = error instanceof Error ? error.message : String(error)
    console.error('❌ Connection error:', msg)
    if (msg.includes('password') || msg.includes('authentication')) {
      console.error('\n   Tip: Ensure DATABASE_URL uses your database password (not the service role key).')
      console.error('   Get it from: Supabase Dashboard → Settings → Database')
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

async function verifyTables(client: import('pg').Client) {
  console.log(`\n🔍 Verifying tables...\n`)

  for (const table of expectedTables) {
    try {
      const result = await client.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
        [table]
      )

      if (result.rows[0].exists) {
        console.log(`   ✅ ${table}`)
      } else {
        console.log(`   ❌ ${table}: Table not found`)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.log(`   ❌ ${table}: ${msg}`)
    }
  }

  console.log(`\n✨ Database is up to date!`)
}

runMigrations().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

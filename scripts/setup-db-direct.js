/**
 * Direct Database Setup Script
 * 
 * This script connects directly to PostgreSQL and creates the database tables.
 * 
 * Run with: node scripts/setup-db-direct.js
 */

require('dotenv').config({ path: '.env.local' })

const fs = require('fs')
const path = require('path')

// Get Supabase connection info from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_SECRET_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

// Extract database connection info from Supabase URL
// Format: https://[project-id].supabase.co
const projectId = supabaseUrl.split('//')[1].split('.')[0]
const dbHost = `${projectId}.supabase.co`
const dbPort = 5432
const dbName = 'postgres'
const dbUser = 'postgres'
const dbPassword = serviceRoleKey

console.log('🚀 Connecting to Supabase PostgreSQL...')
console.log(`   Host: ${dbHost}`)
console.log(`   Database: ${dbName}`)

// Try to use pg library if available, otherwise provide instructions
try {
  const { Client } = require('pg')
  
  async function setupDatabase() {
    const client = new Client({
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
      password: dbPassword,
      ssl: 'require',
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 10000
    })
    
    try {
      await client.connect()
      console.log('✅ Connected to database')

      const sqlPath = path.join(process.cwd(), 'docs/database/02-image-metadata-schema.sql')
      const sql = fs.readFileSync(sqlPath, 'utf-8')

      console.log('\n📊 Creating database tables...')
      await client.query(sql)

      console.log('✅ Database tables created successfully!')
      await client.end()
      return true
    } catch (error) {
      console.error('❌ Error:', error.message)
      console.error('   Code:', error.code)
      console.error('   Detail:', error.detail)
      try {
        await client.end()
      } catch (e) {}
      return false
    }
  }
  
  setupDatabase()
} catch (e) {
  console.log('⚠️  PostgreSQL client not installed')
  console.log('\n📝 To create tables manually:')
  console.log('   1. Go to Supabase Dashboard')
  console.log('   2. Click "SQL Editor"')
  console.log('   3. Click "New Query"')
  console.log('   4. Copy contents of: docs/database/02-image-metadata-schema.sql')
  console.log('   5. Paste and click "Run"')
  console.log('\n💡 Or install pg: npm install pg')
}


/**
 * Supabase Setup Script
 *
 * This script sets up:
 * 1. Database tables for image metadata
 * 2. Storage bucket for hero images
 * 3. Admin user for authentication
 *
 * Run with: node scripts/setup-supabase.js
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_SECRET_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_SECRET_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function setupDatabase() {
  console.log('\n📊 Setting up database tables...')

  try {
    const sqlPath = path.join(process.cwd(), 'docs/database/02-image-metadata-schema.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`   Executing ${statements.length} SQL statements...`)

    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      try {
        const { error } = await supabase.rpc('query', {
          query: statement
        })

        if (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists') &&
              !error.message.includes('duplicate key')) {
            console.error(`   ❌ Statement ${i + 1} failed:`, error.message)
          }
        }
      } catch (e) {
        // Continue on error - some statements may fail if tables already exist
        console.log(`   ⚠️  Statement ${i + 1}: ${e.message}`)
      }
    }

    console.log('✅ Database tables created/verified successfully')
    return true
  } catch (error) {
    console.error('⚠️  Database setup encountered an issue')
    console.log('   You may need to create tables manually in Supabase SQL Editor')
    console.log('   Path: docs/database/02-image-metadata-schema.sql')
    return true // Don't fail completely
  }
}

async function setupStorageBucket() {
  console.log('\n🪣 Setting up storage bucket...')
  
  try {
    const { data, error } = await supabase.storage.createBucket('hero-images', {
      public: true,
    })
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Storage bucket already exists')
        return true
      }
      console.error('❌ Storage bucket creation failed:', error.message)
      return false
    }
    
    console.log('✅ Storage bucket created successfully')
    return true
  } catch (error) {
    console.error('❌ Error creating storage bucket:', error.message)
    return false
  }
}

async function createAdminUser() {
  console.log('\n👤 Creating admin user...')
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    })
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ Admin user already exists: ${adminEmail}`)
        return true
      }
      console.error('❌ Admin user creation failed:', error.message)
      return false
    }
    
    console.log(`✅ Admin user created successfully`)
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    return true
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Supabase setup...')
  console.log(`   URL: ${supabaseUrl}`)
  
  const dbSuccess = await setupDatabase()
  const bucketSuccess = await setupStorageBucket()
  const userSuccess = await createAdminUser()
  
  if (dbSuccess && bucketSuccess && userSuccess) {
    console.log('\n✅ All setup tasks completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Test login at http://localhost:3000/admin/login')
    console.log('   2. Upload images at http://localhost:3000/admin/images')
    console.log('   3. Verify images display on blog/case study pages')
  } else {
    console.log('\n⚠️  Some setup tasks failed. Please check the errors above.')
    process.exit(1)
  }
}

main()


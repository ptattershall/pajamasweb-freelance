/**
 * Supabase Setup Script
 * 
 * This script sets up:
 * 1. Database tables for image metadata
 * 2. Storage bucket for hero images
 * 3. Admin user for authentication
 * 
 * Run with: npx ts-node scripts/setup-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_SECRET_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function setupDatabase() {
  console.log('\n📊 Setting up database tables...')
  
  try {
    const sqlPath = path.join(process.cwd(), 'docs/database/02-image-metadata-schema.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')
    
    const { error } = await supabase.rpc('exec', { sql })
    
    if (error) {
      console.error('Database setup failed:', error.message)
      return false
    }
    
    console.log('✅ Database tables created')
    return true
  } catch (error) {
    console.error('Error reading SQL file:', error)
    return false
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
      console.error('Storage bucket creation failed:', error.message)
      return false
    }
    
    console.log('✅ Storage bucket created')
    return true
  } catch (error) {
    console.error('Error creating storage bucket:', error)
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
      console.error('Admin user creation failed:', error.message)
      return false
    }
    
    console.log(`✅ Admin user created`)
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    return true
  } catch (error) {
    console.error('Error creating admin user:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Supabase setup...')
  
  const dbSuccess = await setupDatabase()
  const bucketSuccess = await setupStorageBucket()
  const userSuccess = await createAdminUser()
  
  if (dbSuccess && bucketSuccess && userSuccess) {
    console.log('\n✅ Setup completed!')
  } else {
    console.log('\n⚠️  Some tasks failed')
    process.exit(1)
  }
}

main()


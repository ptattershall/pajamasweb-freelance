/**
 * Authentication Testing Script
 * 
 * This script tests the authentication flows to ensure everything is working correctly.
 * Run this after setting up your environment variables and database migrations.
 * 
 * Usage:
 *   npx tsx scripts/test-auth.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error(
    '   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY):',
    supabasePublishableKey ? '✅' : '❌'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabasePublishableKey)

async function testAuthentication() {
  console.log('🧪 Testing Client Portal Authentication\n')
  console.log('=' .repeat(50))

  // Test 1: Check Supabase connection
  console.log('\n📡 Test 1: Supabase Connection')
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.log('❌ Failed to connect to Supabase')
      console.log('   Error:', error.message)
      return false
    }
    console.log('✅ Successfully connected to Supabase')
  } catch (err) {
    console.log('❌ Connection error:', err)
    return false
  }

  // Test 2: Check if tables exist
  console.log('\n📊 Test 2: Database Tables')
  const tables = ['profiles', 'invoices', 'bookings', 'contracts', 'deliverables', 'project_milestones']
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1)
      if (error) {
        console.log(`❌ Table '${table}' not found or not accessible`)
        console.log('   Error:', error.message)
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`)
      }
    } catch (err) {
      console.log(`❌ Error checking table '${table}':`, err)
    }
  }

  // Test 3: Check RLS policies
  console.log('\n🔒 Test 3: Row Level Security')
  console.log('   Note: RLS policies should block unauthenticated access')
  
  try {
    const { data, error } = await supabase.from('profiles').select('*')
    if (error && error.message.includes('row-level security')) {
      console.log('✅ RLS is properly configured (access denied as expected)')
    } else if (!error && (!data || data.length === 0)) {
      console.log('✅ RLS is working (no data returned for unauthenticated user)')
    } else {
      console.log('⚠️  RLS might not be configured correctly')
      console.log('   Data returned:', data?.length || 0, 'rows')
    }
  } catch (err) {
    console.log('❌ Error testing RLS:', err)
  }

  // Test 4: Test signup flow (with cleanup)
  console.log('\n👤 Test 4: User Signup Flow')
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (error) {
      console.log('❌ Signup failed:', error.message)
    } else if (data.user) {
      console.log('✅ Signup successful')
      console.log('   User ID:', data.user.id)
      console.log('   Email:', data.user.email)
      console.log('   Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No (check email)')
      
      // Cleanup: Sign out
      await supabase.auth.signOut()
      console.log('   ✅ Cleanup: Signed out test user')
    }
  } catch (err) {
    console.log('❌ Signup error:', err)
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('\n📋 Test Summary')
  console.log('   ✅ = Passed')
  console.log('   ❌ = Failed')
  console.log('   ⚠️  = Warning')
  console.log('\n💡 Next Steps:')
  console.log('   1. Run database migrations if any tables are missing')
  console.log('   2. Create test user accounts via the signup page')
  console.log('   3. Test the full authentication flow in the browser')
  console.log('   4. Add test data and verify dashboard statistics')
  console.log('\n📖 See docs/features/05-client-portal/TESTING_AND_DEPLOYMENT.md for detailed testing guide')
}

// Run tests
testAuthentication()
  .then(() => {
    console.log('\n✅ Testing complete\n')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Testing failed:', err)
    process.exit(1)
  })


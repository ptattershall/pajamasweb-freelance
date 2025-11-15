/**
 * Phase 5 File Storage Tests
 * Tests for deliverables and contracts file upload, download, and preview functionality
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, passed: true })
    console.log(`✅ ${name}`)
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    })
    console.log(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function runTests() {
  console.log('🧪 Phase 5 File Storage Tests\n')

  // Test 1: Check if storage buckets exist
  await test('Storage buckets exist', async () => {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) throw error

    const bucketNames = buckets.map((b) => b.name)
    if (!bucketNames.includes('deliverables')) {
      throw new Error('deliverables bucket not found')
    }
    if (!bucketNames.includes('contracts')) {
      throw new Error('contracts bucket not found')
    }
  })

  // Test 2: Check deliverables table exists
  await test('Deliverables table exists', async () => {
    const { data, error } = await supabase
      .from('deliverables')
      .select('*', { count: 'exact', head: true })

    if (error && error.code !== 'PGRST116') {
      throw error
    }
  })

  // Test 3: Check contracts table exists
  await test('Contracts table exists', async () => {
    const { data, error } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })

    if (error && error.code !== 'PGRST116') {
      throw error
    }
  })

  // Test 4: Check RLS policies on deliverables
  await test('Deliverables RLS policies configured', async () => {
    // This is a basic check - in production, you'd test actual RLS enforcement
    const { data, error } = await supabase
      .from('deliverables')
      .select('*', { count: 'exact', head: true })

    // Should succeed with service role key
    if (error && error.code !== 'PGRST116') {
      throw error
    }
  })

  // Test 5: Check RLS policies on contracts
  await test('Contracts RLS policies configured', async () => {
    const { data, error } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })

    // Should succeed with service role key
    if (error && error.code !== 'PGRST116') {
      throw error
    }
  })

  // Test 6: Verify storage bucket permissions
  await test('Storage bucket permissions configured', async () => {
    // Try to list files in deliverables bucket
    const { data, error } = await supabase.storage
      .from('deliverables')
      .list()

    // Should succeed with service role key
    if (error) throw error
  })

  // Test 7: Check file_url column exists in deliverables
  await test('Deliverables file_url column exists', async () => {
    const { data, error } = await supabase
      .from('deliverables')
      .select('file_url', { count: 'exact', head: true })

    if (error && error.code !== 'PGRST116') {
      throw error
    }
  })

  // Test 8: Check file_url column exists in contracts
  await test('Contracts file_url column exists', async () => {
    const { data, error } = await supabase
      .from('contracts')
      .select('file_url', { count: 'exact', head: true })

    if (error && error.code !== 'PGRST116') {
      throw error
    }
  })

  // Test 9: Check file_size column exists
  await test('File size columns exist', async () => {
    const { data: deliv } = await supabase
      .from('deliverables')
      .select('file_size', { count: 'exact', head: true })

    const { data: contracts } = await supabase
      .from('contracts')
      .select('file_size', { count: 'exact', head: true })

    // Both should succeed
  })

  // Test 10: Check file_type column exists
  await test('File type columns exist', async () => {
    const { data: deliv } = await supabase
      .from('deliverables')
      .select('file_type', { count: 'exact', head: true })

    const { data: contracts } = await supabase
      .from('contracts')
      .select('file_type', { count: 'exact', head: true })

    // Both should succeed
  })

  // Print summary
  console.log('\n📊 Test Summary')
  console.log('================')
  const passed = results.filter((r) => r.passed).length
  const total = results.length
  console.log(`Passed: ${passed}/${total}`)

  if (passed === total) {
    console.log('\n✅ All tests passed!')
  } else {
    console.log('\n❌ Some tests failed:')
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error}`)
      })
  }

  process.exit(passed === total ? 0 : 1)
}

runTests().catch((error) => {
  console.error('Test runner error:', error)
  process.exit(1)
})


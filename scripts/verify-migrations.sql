-- Migration Verification Script
-- Run this in Supabase SQL Editor to verify all migrations are applied correctly

-- Check if all required tables exist
SELECT 
  CASE 
    WHEN COUNT(*) = 6 THEN '✅ All 6 tables exist'
    ELSE '❌ Missing tables: ' || (6 - COUNT(*))::text
  END as table_status,
  array_agg(table_name ORDER BY table_name) as existing_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'profiles', 
  'invoices', 
  'bookings', 
  'contracts', 
  'deliverables', 
  'project_milestones'
);

-- Check RLS is enabled on all tables
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 
  'invoices', 
  'bookings', 
  'contracts', 
  'deliverables', 
  'project_milestones'
)
ORDER BY tablename;

-- Check if storage bucket for avatars exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') 
    THEN '✅ Avatars bucket exists'
    ELSE '⚠️ Avatars bucket not created (optional - run 007_client_portal_avatar_storage.sql)'
  END as storage_status;

-- Count RLS policies per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 
  'invoices', 
  'bookings', 
  'contracts', 
  'deliverables', 
  'project_milestones'
)
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Check for any test data
SELECT 
  'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts
UNION ALL
SELECT 'deliverables', COUNT(*) FROM deliverables
UNION ALL
SELECT 'project_milestones', COUNT(*) FROM project_milestones
ORDER BY table_name;

-- Verify indexes exist
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 
  'invoices', 
  'bookings', 
  'contracts', 
  'deliverables', 
  'project_milestones'
)
ORDER BY tablename, indexname;

-- Summary Report
SELECT 
  '=== MIGRATION VERIFICATION SUMMARY ===' as report;

SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('profiles', 'invoices', 'bookings', 'contracts', 'deliverables', 'project_milestones')) = 6
    THEN '✅ All required tables created'
    ELSE '❌ Some tables are missing'
  END as tables_status;

SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename IN ('profiles', 'invoices', 'bookings', 'contracts', 'deliverables', 'project_milestones')
          AND rowsecurity = true) = 6
    THEN '✅ RLS enabled on all tables'
    ELSE '❌ RLS not enabled on some tables'
  END as rls_status;

SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename IN ('profiles', 'invoices', 'bookings', 'contracts', 'deliverables', 'project_milestones')) > 0
    THEN '✅ RLS policies configured'
    ELSE '❌ No RLS policies found'
  END as policies_status;

-- Next Steps
SELECT 
  '=== NEXT STEPS ===' as next_steps
UNION ALL
SELECT '1. If all checks pass, create test user accounts'
UNION ALL
SELECT '2. Test authentication flows (signup, signin, logout)'
UNION ALL
SELECT '3. Add test data using the queries in TESTING_AND_DEPLOYMENT.md'
UNION ALL
SELECT '4. Verify dashboard shows real statistics'
UNION ALL
SELECT '5. Deploy to production';


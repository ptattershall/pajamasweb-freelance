/**
 * Seed Database Script
 *
 * Seeds services, creates test users (owner + client), profiles, and sample
 * portal data (invoices, bookings, contracts, deliverables, milestones).
 *
 * Run with: npm run seed
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_SECRET_KEY) in .env.local
 */

import 'dotenv/config'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const serviceRoleKey = (
  process.env.SUPABASE_SERVICE_ROLE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
)?.trim()

const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL ?? 'owner@example.com'
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? 'TestOwner123!'
const CLIENT_EMAIL = process.env.SEED_CLIENT_EMAIL ?? 'client@example.com'
const CLIENT_PASSWORD = process.env.SEED_CLIENT_PASSWORD ?? 'TestClient123!'

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_URL or Supabase service role key (SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_ROLE_SECRET_KEY)'
  )
  process.exit(1)
}

// Accept legacy JWT (200+ chars) or Supabase's new secret format (sb_secret_...)
const keySource = process.env.SUPABASE_SERVICE_ROLE_SECRET_KEY ? 'SUPABASE_SERVICE_ROLE_SECRET_KEY' : 'SUPABASE_SERVICE_ROLE_KEY'
const keyLen = serviceRoleKey.length
const isLegacyJwt = keyLen >= 200
const isNewSecret = serviceRoleKey.startsWith('sb_secret_')
if (!isLegacyJwt && !isNewSecret) {
  console.error(
    `❌ Key from ${keySource} is ${keyLen} chars and doesn't look like a service_role key. Use the secret key (service_role or sb_secret_...) from Supabase Dashboard → Project Settings → API, not the anon/publishable key.`
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const services = [
  {
    slug: 'web-design',
    title: 'Web Design',
    summary: 'Beautiful, responsive website design tailored to your brand',
    details_md: `# Web Design Service

## What's Included
- Custom responsive design
- Mobile-first approach
- Brand alignment
- Figma prototypes
- Design system documentation

## Timeline
- 2-3 weeks for standard projects
- Rush delivery available

## Perfect For
- New businesses launching online
- Redesigning existing websites
- Creating brand presence`,
    price_from_cents: 299900,
    tier: 'starter',
    is_active: true,
  },
  {
    slug: 'web-development',
    title: 'Web Development',
    summary: 'Full-stack web applications built with modern technologies',
    details_md: `# Web Development Service

## What's Included
- Next.js/React development
- Backend API development
- Database design & setup
- Authentication & security
- Deployment & hosting

## Tech Stack
- Next.js 16
- TypeScript
- Supabase
- Stripe integration
- Vercel deployment

## Perfect For
- SaaS applications
- E-commerce platforms
- Custom web applications`,
    price_from_cents: 499900,
    tier: 'pro',
    is_active: true,
  },
  {
    slug: 'retainer-10hrs',
    title: 'Retainer - 10 Hours/Month',
    summary: 'Ongoing support and maintenance for your web presence',
    details_md: `# Retainer Service - 10 Hours/Month

## What's Included
- 10 hours of development per month
- Priority support
- Bug fixes & maintenance
- Performance optimization
- Monthly check-ins

## Perfect For
- Ongoing maintenance
- Small feature updates
- Technical support`,
    price_from_cents: 99900,
    tier: 'starter',
    is_active: true,
  },
  {
    slug: 'retainer-20hrs',
    title: 'Retainer - 20 Hours/Month',
    summary: 'Dedicated development time for continuous improvements',
    details_md: `# Retainer Service - 20 Hours/Month

## What's Included
- 20 hours of development per month
- Priority support
- Feature development
- Performance optimization
- Monthly strategy calls

## Perfect For
- Growing businesses
- Regular feature updates
- Dedicated support`,
    price_from_cents: 199900,
    tier: 'pro',
    is_active: true,
  },
  {
    slug: 'retainer-40hrs',
    title: 'Retainer - 40 Hours/Month',
    summary: 'Full-time equivalent support for your development needs',
    details_md: `# Retainer Service - 40 Hours/Month

## What's Included
- 40 hours of development per month
- Dedicated developer
- Priority support
- Feature development
- Weekly strategy calls

## Perfect For
- Established businesses
- Complex applications
- Continuous development`,
    price_from_cents: 399900,
    tier: 'enterprise',
    is_active: true,
  },
]

async function seedServices(): Promise<void> {
  console.log('🌱 Seeding services...')
  for (const service of services) {
    const { error } = await supabase.from('services').upsert(service, { onConflict: 'slug' })
    if (error) {
      console.error(`   ❌ ${service.slug}:`, error.message)
    } else {
      console.log(`   ✅ ${service.slug}`)
    }
  }
}

async function ensureUser(
  email: string,
  password: string,
  _displayName: string
): Promise<{ id: string; created: boolean }> {
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 200 })
  const found = listData?.users?.find((u) => u.email === email)
  if (found) {
    console.log(`   ✅ User ${email} (existing)`)
    return { id: found.id, created: false }
  }
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw error
  if (!created.user) throw new Error(`Failed to create user ${email}`)
  console.log(`   ✅ User ${email} (created)`)
  return { id: created.user.id, created: true }
}

async function seedProfiles(ownerId: string, clientId: string): Promise<void> {
  console.log('👤 Seeding profiles...')
  const { error: e1 } = await supabase.from('profiles').upsert(
    {
      user_id: ownerId,
      role: 'OWNER',
      display_name: 'Test Owner',
      company: 'Pajamasweb',
      email_verified: true,
    },
    { onConflict: 'user_id' }
  )
  if (e1) {
    console.error('   ❌ Owner profile:', e1.message)
  } else {
    console.log('   ✅ Owner profile')
  }

  const { error: e2 } = await supabase.from('profiles').upsert(
    {
      user_id: clientId,
      role: 'CLIENT',
      display_name: 'Test Client',
      company: 'Acme Corp',
      email_verified: true,
    },
    { onConflict: 'user_id' }
  )
  if (e2) {
    console.error('   ❌ Client profile:', e2.message)
  } else {
    console.log('   ✅ Client profile')
  }
}

async function seedPortalData(clientId: string): Promise<void> {
  console.log('📋 Seeding portal data (invoices, bookings, contracts, deliverables, milestones)...')

  const now = new Date().toISOString()
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error: inv1 } = await supabase.from('invoices').insert({
    client_id: clientId,
    amount_cents: 50000,
    currency: 'USD',
    status: 'paid',
    description: 'Website design deposit',
    due_date: nextMonth,
    paid_at: now,
  })
  if (inv1) console.error('   ❌ Invoice 1:', inv1.message)
  else console.log('   ✅ Invoice (paid)')

  const { error: inv2 } = await supabase.from('invoices').insert({
    client_id: clientId,
    amount_cents: 25000,
    currency: 'USD',
    status: 'open',
    description: 'Retainer - October',
    due_date: nextMonth,
  })
  if (inv2) console.error('   ❌ Invoice 2:', inv2.message)
  else console.log('   ✅ Invoice (open)')

  const { error: book1 } = await supabase.from('bookings').insert({
    client_id: clientId,
    title: 'Kickoff call',
    description: 'Project kickoff and scope review',
    starts_at: nextWeek,
    ends_at: nextWeek,
    attendee_email: CLIENT_EMAIL,
    attendee_name: 'Test Client',
    provider: 'calcom',
    status: 'confirmed',
  })
  if (book1) console.error('   ❌ Booking 1:', book1.message)
  else console.log('   ✅ Booking (upcoming)')

  const { error: contract1 } = await supabase.from('contracts').insert({
    client_id: clientId,
    title: 'Master Service Agreement',
    file_url: 'https://example.com/contracts/msa.pdf',
    file_size: 102400,
    file_type: 'application/pdf',
    version: 1,
  })
  if (contract1) console.error('   ❌ Contract:', contract1.message)
  else console.log('   ✅ Contract')

  const { error: deliv1 } = await supabase.from('deliverables').insert({
    client_id: clientId,
    title: 'Homepage design files',
    description: 'Figma and assets',
    file_url: 'https://example.com/deliverables/homepage.zip',
    file_size: 2048000,
    file_type: 'application/zip',
    delivered_at: now,
  })
  if (deliv1) console.error('   ❌ Deliverable:', deliv1.message)
  else console.log('   ✅ Deliverable')

  const { data: milestone, error: mileErr } = await supabase
    .from('project_milestones')
    .insert({
      client_id: clientId,
      title: 'Design approval',
      description: 'Client reviews and approves designs',
      due_date: nextMonth,
      status: 'in_progress',
      progress_percent: 50,
    })
    .select('id')
    .single()

  if (mileErr) {
    console.error('   ❌ Milestone:', mileErr.message)
  } else {
    console.log('   ✅ Project milestone')
    if (milestone?.id) {
      await supabase.from('milestone_updates').insert({
        milestone_id: milestone.id,
        update_text: 'First draft shared with client for review.',
      })
      console.log('   ✅ Milestone update')
    }
  }
}

async function main(): Promise<void> {
  console.log('🚀 Seeding database...\n')

  await seedServices()
  console.log('')

  console.log('👤 Creating test users (if not present)...')
  const owner = await ensureUser(OWNER_EMAIL, OWNER_PASSWORD, 'Test Owner')
  const client = await ensureUser(CLIENT_EMAIL, CLIENT_PASSWORD, 'Test Client')
  console.log('')

  await seedProfiles(owner.id, client.id)
  console.log('')

  await seedPortalData(client.id)
  console.log('')

  console.log('✅ Seed complete!\n')
  console.log('Test accounts:')
  console.log(`   Owner:  ${OWNER_EMAIL}  /  ${OWNER_PASSWORD}`)
  console.log(`   Client: ${CLIENT_EMAIL} /  ${CLIENT_PASSWORD}`)
  console.log('\nSign in at /portal/signin or /admin (depending on your app routes).')
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})

/**
 * Seed Services Script
 * 
 * This script seeds the database with test services.
 * Run with: npx ts-node scripts/seed-services.ts
 */

require('dotenv').config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_SECRET_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables')
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

async function seedServices() {
  console.log('🌱 Seeding services...')

  try {
    for (const service of services) {
      const { data, error } = await supabase
        .from('services')
        .upsert(service, { onConflict: 'slug' })
        .select()

      if (error) {
        console.error(`❌ Error seeding ${service.slug}:`, error.message)
      } else {
        console.log(`✅ Seeded ${service.slug}`)
      }
    }

    console.log('\n✅ Services seeded successfully!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seedServices()


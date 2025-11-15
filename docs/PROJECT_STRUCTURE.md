# Project Structure

## Directory Layout

```
pajamasweb-freelance/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin CMS (Phase 3)
│   │   ├── layout.tsx            # Admin layout with sidebar
│   │   ├── page.tsx              # Dashboard
│   │   ├── images/page.tsx       # Image management
│   │   ├── blog/page.tsx         # Blog management
│   │   └── case-studies/page.tsx # Case studies management
│   ├── api/
│   │   └── search/route.ts       # Search API endpoint
│   ├── blog/                     # Blog pages
│   │   ├── page.tsx              # Blog listing
│   │   └── [slug]/page.tsx       # Blog detail (SSG)
│   ├── case-studies/             # Case studies pages
│   │   ├── page.tsx              # Case studies listing
│   │   └── [slug]/page.tsx       # Case study detail (SSG)
│   ├── search/page.tsx           # Search page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles with CSS variables
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── label.tsx
│   │   └── alert.tsx
│   └── SearchContent.tsx         # Search component
│
├── content/                      # MDX content files
│   ├── blog/                     # Blog posts
│   │   ├── getting-started-with-web-design.mdx
│   │   └── performance-optimization-tips.mdx
│   └── case-studies/             # Case studies
│       └── ecommerce-redesign.mdx
│
├── lib/
│   ├── content.ts                # Content utility functions
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # shadcn/ui utilities
│
├── scripts/
│   └── sync-metadata.ts          # Metadata sync script
│
├── docs/
│   ├── DEVELOPMENT_ROADMAP.md    # Project roadmap
│   ├── PHASE2_SETUP.md           # Phase 2 setup guide
│   ├── PHASE3_SETUP.md           # Phase 3 setup guide
│   ├── SHADCN_SETUP.md           # shadcn/ui setup
│   ├── PROJECT_STRUCTURE.md      # This file
│   ├── features/
│   │   └── 01-content-management/
│   │       ├── feature.md        # Feature requirements
│   │       └── IMPLEMENTATION_PROGRESS.md
│   └── database/
│       └── 01-content-metadata-schema.sql
│
├── public/                       # Static assets
├── components.json               # shadcn/ui config
├── tailwind.config.js            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
├── package.json                  # Dependencies
└── README.md                     # Project README
```

## Key Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v3** - Styling
- **shadcn/ui** - Component library
- **Supabase** - Backend & database
- **next-mdx-remote** - MDX rendering
- **gray-matter** - Frontmatter parsing

## Development Phases

- ✅ **Phase 1** - Basic MDX Setup
- ✅ **Phase 2** - Supabase Metadata Integration
- 🔄 **Phase 3** - Admin CMS UI (In Progress)
- ⬜ **Phase 4** - Vector Embeddings & Recommendations

## Running the Project

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```


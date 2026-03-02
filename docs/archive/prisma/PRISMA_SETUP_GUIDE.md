# Prisma Setup Guide for Supabase

## Overview

This guide walks through setting up Prisma ORM with your existing Supabase PostgreSQL database.

## Prerequisites

- ✅ Prisma CLI installed (`npm install -D prisma`)
- ✅ @prisma/client installed (`npm install @prisma/client`)
- ✅ Supabase project created
- ✅ Database migrations already applied

## Step 1: Get Your Supabase Database Password

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **PajamasWeb**
3. Go to **Settings** → **Database**
4. Look for the **Connection string** section
5. Copy the password from the connection string or reset it if needed
6. The format is: `postgresql://postgres.[project-ref]:[PASSWORD]@...`

## Step 2: Configure Environment Variables

1. Open `.env` file in the project root
2. Replace `[PASSWORD]` in both DATABASE_URL and DIRECT_URL with your actual password
3. Example:
   ```env
   DATABASE_URL="postgresql://postgres.zynlwtatsulhtczpynwx:your_actual_password@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.zynlwtatsulhtczpynwx:your_actual_password@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
   ```

## Step 3: Introspect Your Database

Run this command to generate Prisma schema from your existing database:

```bash
npx prisma db pull
```

This will:
- Connect to your Supabase database
- Read all existing tables, columns, and relationships
- Generate `prisma/schema.prisma` with all models

## Step 4: Generate Prisma Client

```bash
npx prisma generate
```

This creates TypeScript types and the Prisma Client in `lib/generated/prisma`.

## Step 5: Create Prisma Client Singleton

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@/lib/generated/prisma'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Step 6: Test Connection

Create a test file to verify Prisma can connect:

```bash
npx prisma studio
```

This opens Prisma Studio where you can browse your data.

## Troubleshooting

### "Missing required environment variable: DATABASE_URL"
- Make sure `.env` file exists in project root
- Verify DATABASE_URL is set correctly
- Check password is correct

### "Connection refused"
- Verify Supabase project is running
- Check network connectivity
- Ensure password is correct

### "SSL certificate problem"
- This is normal for Supabase
- The connection string includes SSL settings

## Next Steps

1. ✅ Complete this setup
2. Create Prisma client singleton (lib/prisma.ts)
3. Migrate API routes to use Prisma
4. Update service files to use Prisma
5. Write tests for Prisma queries

## Resources

- [Prisma Supabase Guide](https://www.prisma.io/docs/orm/overview/databases/supabase)
- [Prisma Client API](https://www.prisma.io/docs/orm/reference/prisma-client-reference)
- [Supabase Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)


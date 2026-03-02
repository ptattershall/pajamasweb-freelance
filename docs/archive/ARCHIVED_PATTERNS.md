# Archived Query Patterns

**Purpose**: Reference guide for old patterns that are being phased out.

## Why Archive These Patterns?

The old patterns work but have several issues:
- ❌ No type safety
- ❌ Manual error handling
- ❌ No runtime validation
- ❌ Verbose code
- ❌ Hard to maintain
- ❌ Difficult to test

## Pattern 1: Direct Supabase in API Routes

### Location
- `app/api/portal/bookings/route.ts`
- `app/api/portal/deliverables/route.ts`
- `app/api/portal/projects/overview/route.ts`
- `app/api/admin/milestones/route.ts`

### Example
```typescript
const supabase = createServerSupabaseClient()
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('client_id', user.id)
  .order('starts_at', { ascending: false })

if (error) throw error
return data
```

### Issues
- No type checking on returned data
- Manual error handling
- Repeated code across routes
- Hard to test

### Migration Path
Replace with query helper:
```typescript
import { getClientBookings } from '@/lib/query-helpers'
const bookings = await getClientBookings(user.id)
```

---

## Pattern 2: Supabase Client Proxy

### Location
- `lib/supabase.ts`
- `lib/booking-service.ts`
- `lib/client-service.ts`

### Example
```typescript
const supabase: any = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabaseClient()
    return (client as any)[prop]
  },
})

const { data, error } = await supabase
  .from('table')
  .select('*')
```

### Issues
- Uses `any` type (loses type safety)
- Lazy initialization complexity
- Hard to debug
- Not necessary with query helpers

### Status
- ✅ Still used in some files
- ⚠️ Can be removed when all queries migrated
- 📝 Kept for backward compatibility

---

## Pattern 3: Manual Validation

### Location
- Various service files (before Phase 3)

### Example
```typescript
const { data, error } = await supabase
  .from('invoices')
  .select('*')
  .eq('id', id)
  .single()

if (error) throw error

// Manual type casting (no validation!)
return data as Invoice
```

### Issues
- No runtime validation
- Type casting is unsafe
- Invalid data can slip through
- Hard to debug

### Migration Path
Use Zod validation:
```typescript
import { invoiceSchema } from '@/lib/validation-schemas'
const invoice = invoiceSchema.parse(data)
```

---

## Pattern 4: Inline Error Handling

### Location
- Multiple API routes

### Example
```typescript
try {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch' },
      { status: 500 }
    )
  }
  
  return NextResponse.json(data)
} catch (err) {
  console.error('Unexpected error:', err)
  return NextResponse.json(
    { error: 'Server error' },
    { status: 500 }
  )
}
```

### Issues
- Repetitive code
- Inconsistent error messages
- Hard to maintain
- Difficult to test

### Migration Path
Use query helpers with consistent error handling:
```typescript
try {
  const booking = await getBooking(id)
  return NextResponse.json(booking)
} catch (error) {
  console.error('Error fetching booking:', error)
  return NextResponse.json(
    { error: 'Failed to fetch booking' },
    { status: 500 }
  )
}
```

---

## Pattern 5: Untyped Service Functions

### Location
- `lib/supabase.ts` (blog/case study functions)

### Example
```typescript
export async function searchBlogPosts(query: string) {
  const { data, error } = await supabase
    .from('blog_posts_meta')
    .select('*')
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error searching blog posts:', error)
    throw error
  }

  return data // No type annotation!
}
```

### Issues
- Return type is `any`
- No validation
- IDE can't provide autocomplete
- Hard to use in TypeScript

### Status
- ⚠️ Still in use for blog/case study queries
- 📝 Can be migrated to Zod schemas
- 🔄 Lower priority (not critical path)

---

## Deprecation Timeline

### Phase 5 (Current)
- ✅ Document old patterns
- ✅ Create migration guides
- ✅ Identify all usages

### Phase 6 (Future)
- 🔄 Migrate remaining API routes
- 🔄 Add Zod schemas for blog/case study queries
- 🔄 Remove proxy pattern

### Phase 7 (Future)
- 🗑️ Remove old patterns
- 🗑️ Clean up deprecated code
- 🗑️ Update documentation

## Reference

For more information:
- `docs/QUERY_PATTERNS_REFERENCE.md` - Side-by-side comparisons
- `docs/REST_API_ZOD_MIGRATION_CHECKLIST.md` - Migration steps
- `lib/query-helpers.ts` - New pattern implementation
- `lib/validation-schemas.ts` - Zod schemas


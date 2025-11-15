# Zod Usage Examples

## Example 1: Creating a Booking

```typescript
// app/api/bookings/route.ts
import { createBooking } from '@/lib/query-helpers'
import { createBookingSchema } from '@/lib/validation-schemas'
import type { CreateBookingInput } from '@/lib/validation-schemas'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Zod validates input automatically
    const validated = createBookingSchema.parse(body)
    
    // Create booking with validated data
    const booking = await createBooking(validated)
    
    return Response.json(booking)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { errors: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}
```

## Example 2: React Component with Type Safety

```typescript
// app/dashboard/bookings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getClientBookings } from '@/lib/query-helpers'
import type { Booking } from '@/lib/validation-schemas'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await getClientBookings(clientId)
        setBookings(data) // data is fully typed as Booking[]
      } catch (error) {
        console.error('Failed to load bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  return (
    <div>
      {bookings.map(booking => (
        <div key={booking.id}>
          <h3>{booking.title}</h3>
          <p>{booking.attendee_email}</p>
          <p>{new Date(booking.starts_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}
```

## Example 3: Form Validation

```typescript
// components/BookingForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBookingSchema } from '@/lib/validation-schemas'
import type { CreateBookingInput } from '@/lib/validation-schemas'

export function BookingForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
  })

  const onSubmit = async (data: CreateBookingInput) => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    // ...
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      
      <input {...register('attendee_email')} type="email" />
      {errors.attendee_email && <span>{errors.attendee_email.message}</span>}
      
      <button type="submit">Create Booking</button>
    </form>
  )
}
```

## Example 4: Service Layer Integration

```typescript
// lib/booking-service.ts
import { getClientBookings, createBooking } from '@/lib/query-helpers'
import type { CreateBookingInput, Booking } from '@/lib/validation-schemas'

export async function fetchClientBookings(clientId: string): Promise<Booking[]> {
  return getClientBookings(clientId)
}

export async function addBooking(input: CreateBookingInput): Promise<Booking> {
  return createBooking(input)
}
```

## Example 5: Error Handling

```typescript
import { z } from 'zod'
import { createBooking } from '@/lib/query-helpers'

try {
  const booking = await createBooking({
    client_id: 'invalid-uuid', // Will fail validation
    title: 'Meeting',
    // ... other fields
  })
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    console.log(error.errors)
    // [{ code: 'invalid_string', path: ['client_id'], message: 'Invalid UUID' }]
  } else {
    // Handle database errors
    console.error(error)
  }
}
```

## Key Benefits

✅ **Type Safety** - TypeScript catches errors at compile time  
✅ **Runtime Validation** - Zod catches errors at runtime  
✅ **Clear Error Messages** - Users see helpful validation messages  
✅ **IDE Autocomplete** - Full IntelliSense support  
✅ **Consistency** - Same validation everywhere  


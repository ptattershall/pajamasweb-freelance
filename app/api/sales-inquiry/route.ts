/**
 * Sales Inquiry API Endpoint
 *
 * Handles sales funnel form submissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSalesInquiry } from '@/lib/sales-inquiry-service'
import { createSalesInquirySchema } from '@/lib/validation-schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validationResult = createSalesInquirySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    // Create the sales inquiry
    const { data, error } = await createSalesInquiry(validationResult.data)

    if (error) {
      console.error('Error creating sales inquiry:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Return success with the inquiry ID
    return NextResponse.json(
      {
        success: true,
        id: data?.id,
        message: 'Sales inquiry submitted successfully'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Sales inquiry API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

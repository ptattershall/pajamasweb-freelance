import { NextRequest, NextResponse } from 'next/server'
import { retrievePaymentIntent } from '@/lib/stripe'
import { getPaymentByIntentId } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    if (!paymentIntentId.startsWith('pi_')) {
      return NextResponse.json(
        { error: 'Invalid payment intent ID format' },
        { status: 400 }
      )
    }

    const paymentIntent = await retrievePaymentIntent(paymentIntentId)

    const dbPayment = await getPaymentByIntentId(paymentIntentId)

    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      receiptEmail: paymentIntent.receipt_email,
      description: paymentIntent.description,
      metadata: {
        serviceName: paymentIntent.metadata?.serviceName,
        serviceId: paymentIntent.metadata?.serviceId,
        type: paymentIntent.metadata?.type,
      },
      paymentMethod: paymentIntent.payment_method ? {
        type: typeof paymentIntent.payment_method === 'object' 
          ? paymentIntent.payment_method.type 
          : undefined,
      } : null,
      dbPayment: dbPayment ? {
        id: dbPayment.id,
        status: dbPayment.status,
        createdAt: dbPayment.created_at,
      } : null,
    })
  } catch (error) {
    console.error('Error retrieving payment intent:', error)

    if (error instanceof Error && error.message.includes('No such payment_intent')) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to retrieve payment details' },
      { status: 500 }
    )
  }
}

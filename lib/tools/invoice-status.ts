/**
 * Invoice Status Tool for Vercel AI SDK
 * 
 * Provides clients with access to their invoice information.
 * Only accessible to authenticated clients.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { getInvoiceSummary, formatInvoice } from '@/lib/client-service';

export const invoiceStatusInputSchema = z.object({
  userId: z.string().describe('The authenticated user ID'),
});

export type InvoiceStatusInput = z.infer<typeof invoiceStatusInputSchema>;

/**
 * Invoice status tool for Vercel AI SDK
 * 
 * Usage in chat:
 * - "What's my invoice status?"
 * - "How much do I owe?"
 * - "Show me my recent invoices"
 * - "When is my next payment due?"
 */
export const invoiceStatusTool = tool({
  description:
    'Get invoice and payment status for the authenticated client. Shows paid/pending invoices, total amounts, and recent transactions.',
  inputSchema: invoiceStatusInputSchema,
  execute: async (params: InvoiceStatusInput) => {
    try {
      if (!params.userId) {
        return {
          success: false,
          error: 'User authentication required. Please log in to view your invoices.',
        };
      }

      const summary = await getInvoiceSummary(params.userId);

      // Format response
      const recentInvoicesText = summary.recentInvoices
        .map((inv) => `- ${formatInvoice(inv)}`)
        .join('\n');

      const totalOwed = summary.recentInvoices
        .filter((i) => i.status !== 'paid')
        .reduce((sum, i) => sum + i.amount_cents, 0);

      return {
        success: true,
        summary: {
          totalInvoices: summary.total,
          paidInvoices: summary.paid,
          pendingInvoices: summary.pending,
          totalAmountCents: summary.totalAmount,
          totalAmountUSD: (summary.totalAmount / 100).toFixed(2),
          amountOwedCents: totalOwed,
          amountOwedUSD: (totalOwed / 100).toFixed(2),
        },
        recentInvoices: recentInvoicesText,
        message: `You have ${summary.total} invoices total. ${summary.paid} are paid and ${summary.pending} are pending payment.`,
        nextSteps:
          summary.pending > 0
            ? 'Would you like to make a payment? I can help you process it.'
            : 'All your invoices are up to date!',
      };
    } catch (error) {
      console.error('Error fetching invoice status:', error);
      return {
        success: false,
        error: 'Failed to retrieve invoice information. Please try again or contact support.',
      };
    }
  },
});

/**
 * Tool to get detailed invoice information
 */
export const invoiceDetailsTool = tool({
  description: 'Get detailed information about a specific invoice or payment',
  inputSchema: z.object({
    userId: z.string().describe('The authenticated user ID'),
    invoiceId: z.string().optional().describe('Specific invoice ID to look up'),
  }),
  execute: async (params) => {
    try {
      if (!params.userId) {
        return {
          success: false,
          error: 'User authentication required.',
        };
      }

      const summary = await getInvoiceSummary(params.userId);

      if (params.invoiceId) {
        const invoice = summary.recentInvoices.find((i) => i.id === params.invoiceId);
        if (!invoice) {
          return {
            success: false,
            error: `Invoice ${params.invoiceId} not found.`,
          };
        }

        return {
          success: true,
          invoice: {
            id: invoice.id,
            amount: `$${(invoice.amount_cents / 100).toFixed(2)}`,
            status: invoice.status,
            created: new Date(invoice.created_at).toLocaleDateString(),
            updated: new Date(invoice.updated_at).toLocaleDateString(),
            description: invoice.description,
          },
        };
      }

      // Return all invoices if no specific ID provided
      return {
        success: true,
        invoices: summary.recentInvoices.map((inv) => ({
          id: inv.id,
          amount: `$${(inv.amount_cents / 100).toFixed(2)}`,
          status: inv.status,
          created: new Date(inv.created_at).toLocaleDateString(),
          description: inv.description,
        })),
      };
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      return {
        success: false,
        error: 'Failed to retrieve invoice details.',
      };
    }
  },
});


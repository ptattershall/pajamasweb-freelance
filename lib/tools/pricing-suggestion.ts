/**
 * Pricing Suggestion Tool for Vercel AI SDK
 * 
 * Provides price estimates for web projects based on requirements.
 * Integrates with the AI chat to suggest pricing when users ask about costs.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { calculatePricing, formatPricingResult, getConfidenceExplanation } from '@/lib/pricing';

// Zod schema for pricing suggestion input
export const pricingSuggestionInputSchema = z.object({
  projectType: z
    .enum(['site', 'web_app', 'ecom', 'automation'])
    .describe('Type of project: site (brochure/marketing), web_app (SaaS/app), ecom (e-commerce), automation (workflow automation)'),
  features: z
    .array(z.string())
    .min(1)
    .max(20)
    .describe('List of required features (e.g., "user authentication", "payment processing", "admin dashboard")'),
  integrations: z
    .array(z.enum(['stripe', 'oauth', 'cms', 'crm', 'gcal', 'slack', 'zapier', 'shopify', 'hubspot']))
    .optional()
    .describe('Third-party integrations needed (e.g., Stripe for payments, Slack for notifications)'),
  timeline: z
    .enum(['rush', 'standard'])
    .optional()
    .default('standard')
    .describe('Project timeline: rush (30% premium for expedited delivery) or standard (4-12 weeks)'),
  notes: z
    .string()
    .max(500)
    .optional()
    .describe('Additional context or special requirements'),
});

export type PricingSuggestionInput = z.infer<typeof pricingSuggestionInputSchema>;

/**
 * Pricing suggestion tool for Vercel AI SDK
 * 
 * Usage in chat:
 * - "How much would a website with Stripe integration cost?"
 * - "What's the price for a web app with user auth and CRM integration?"
 * - "I need a rush timeline for an e-commerce site"
 */
export const pricingSuggestionTool = tool({
  description:
    'Get a price estimate for a web project based on project type, features, integrations, and timeline. Use this when users ask about pricing or want an estimate.',
  inputSchema: pricingSuggestionInputSchema,
  execute: async (params: PricingSuggestionInput) => {
    try {
      // Calculate pricing
      const result = calculatePricing({
        projectType: params.projectType,
        features: params.features,
        integrations: params.integrations,
        timeline: params.timeline,
        notes: params.notes,
      });

      // Format response
      const formattedPrice = formatPricingResult(result);
      const confidenceExplanation = getConfidenceExplanation(result.confidence);

      return {
        success: true,
        lowUSD: result.lowUSD,
        highUSD: result.highUSD,
        confidence: result.confidence,
        confidenceLabel:
          result.confidence >= 0.8
            ? 'High'
            : result.confidence >= 0.6
              ? 'Medium'
              : 'Low',
        factors: result.factors,
        formattedPrice,
        confidenceExplanation,
        disclaimer:
          'This is an estimate based on the information provided. Actual pricing may vary based on specific requirements, design complexity, and additional features discovered during the discovery phase.',
        cta: 'Would you like to book a free consultation to discuss your project in detail?',
      };
    } catch (error) {
      console.error('Error calculating pricing:', error);
      return {
        success: false,
        error: 'Failed to calculate pricing. Please try again or contact us for a custom quote.',
      };
    }
  },
});

/**
 * Tool for getting available project types and integrations
 * Helps the AI understand what options are available
 */
export const pricingInfoTool = tool({
  description: 'Get information about available project types and integrations for pricing estimates',
  inputSchema: z.object({
    type: z
      .enum(['project_types', 'integrations', 'all'])
      .optional()
      .default('all')
      .describe('What information to retrieve'),
  }),
  execute: async (params) => {
    const projectTypes = {
      site: 'Brochure/marketing website ($2,500-$5,000)',
      web_app: 'Web application/SaaS ($5,000-$15,000)',
      ecom: 'E-commerce store ($8,000-$20,000)',
      automation: 'Workflow automation ($3,000-$10,000)',
    };

    const integrations = {
      stripe: 'Payment processing',
      oauth: 'Social login (Google, GitHub, etc.)',
      cms: 'Content management system',
      crm: 'Customer relationship management',
      gcal: 'Google Calendar integration',
      slack: 'Slack notifications',
      zapier: 'Zapier automation',
      shopify: 'Shopify integration',
      hubspot: 'HubSpot CRM',
    };

    if (params.type === 'project_types') {
      return { projectTypes };
    } else if (params.type === 'integrations') {
      return { integrations };
    } else {
      return { projectTypes, integrations };
    }
  },
});


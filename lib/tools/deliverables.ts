/**
 * Deliverables Tool for Vercel AI SDK
 * 
 * Provides clients with access to their project deliverables.
 * Only accessible to authenticated clients.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { getDeliverableSummary, getClientDeliverables, formatDeliverable } from '@/lib/client-service';

export const deliverablesInputSchema = z.object({
  userId: z.string().describe('The authenticated user ID'),
});

export type DeliverablesInput = z.infer<typeof deliverablesInputSchema>;

/**
 * Deliverables tool for Vercel AI SDK
 * 
 * Usage in chat:
 * - "What deliverables have I received?"
 * - "Show me my project files"
 * - "Where can I download my website?"
 * - "What's been delivered so far?"
 */
export const deliverablesTool = tool({
  description:
    'Get project deliverables for the authenticated client. Shows files, documents, and assets delivered for projects.',
  inputSchema: deliverablesInputSchema,
  execute: async (params: DeliverablesInput) => {
    try {
      if (!params.userId) {
        return {
          success: false,
          error: 'User authentication required. Please log in to view your deliverables.',
        };
      }

      const summary = await getDeliverableSummary(params.userId);

      // Format recent deliverables
      const recentText = summary.recentDeliverables
        .map((d) => `- ${formatDeliverable(d)}`)
        .join('\n');

      // Format by project
      const byProjectText = Object.entries(summary.byProject)
        .map(([projectId, deliverables]) => {
          const projectName = projectId === 'unassigned' ? 'Unassigned' : projectId;
          const items = deliverables.map((d) => `  - ${d.title}`).join('\n');
          return `${projectName}:\n${items}`;
        })
        .join('\n\n');

      return {
        success: true,
        summary: {
          totalDeliverables: summary.total,
          projectCount: Object.keys(summary.byProject).length,
        },
        recentDeliverables: recentText || 'No deliverables yet.',
        byProject: byProjectText,
        message: `You have ${summary.total} deliverables across ${Object.keys(summary.byProject).length} projects.`,
        cta:
          summary.total === 0
            ? 'Your project is in progress. Deliverables will appear here as they are completed.'
            : 'All your deliverables are ready for download. Click on any file to access it.',
      };
    } catch (error) {
      console.error('Error fetching deliverables:', error);
      return {
        success: false,
        error: 'Failed to retrieve deliverables. Please try again or contact support.',
      };
    }
  },
});

/**
 * Tool to get detailed deliverable information
 */
export const deliverableDetailsTool = tool({
  description: 'Get detailed information about a specific deliverable or project files',
  inputSchema: z.object({
    userId: z.string().describe('The authenticated user ID'),
    deliverableId: z.string().optional().describe('Specific deliverable ID to look up'),
    projectId: z.string().optional().describe('Project ID to filter deliverables'),
  }),
  execute: async (params) => {
    try {
      if (!params.userId) {
        return {
          success: false,
          error: 'User authentication required.',
        };
      }

      const deliverables = await getClientDeliverables(params.userId);

      if (params.deliverableId) {
        const deliverable = deliverables.find((d) => d.id === params.deliverableId);
        if (!deliverable) {
          return {
            success: false,
            error: `Deliverable ${params.deliverableId} not found.`,
          };
        }

        return {
          success: true,
          deliverable: {
            id: deliverable.id,
            title: deliverable.title,
            description: deliverable.description,
            status: deliverable.status,
            completedAt: deliverable.completed_at ? new Date(deliverable.completed_at).toLocaleDateString() : 'Not completed',
          },
        };
      }

      // Return all deliverables
      return {
        success: true,
        deliverables: deliverables.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          status: d.status,
          completedAt: d.completed_at ? new Date(d.completed_at).toLocaleDateString() : 'Not completed',
        })),
      };
    } catch (error) {
      console.error('Error fetching deliverable details:', error);
      return {
        success: false,
        error: 'Failed to retrieve deliverable details.',
      };
    }
  },
});


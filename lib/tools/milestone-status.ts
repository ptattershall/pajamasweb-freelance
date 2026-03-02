/**
 * Milestone Status Tool for Vercel AI SDK
 *
 * Provides clients with access to their project milestone status.
 * Only accessible to authenticated clients. Uses existing DAL and RLS.
 */

import { tool } from 'ai';
import { z } from 'zod';
import {
  getClientProjectMilestones,
  getMilestoneUpdates,
} from '@/lib/query-helpers';

export const milestoneStatusInputSchema = z.object({
  userId: z.string().describe('The authenticated user ID (client_id)'),
});

export type MilestoneStatusInput = z.infer<typeof milestoneStatusInputSchema>;

/**
 * Milestone status tool for Vercel AI SDK
 *
 * Usage in chat:
 * - "What's the status of my project milestones?"
 * - "Where are we on my project timeline?"
 * - "Any updates on my milestones?"
 * - "What milestones do I have?"
 */
export const milestoneStatusTool = tool({
  description:
    'Get project milestone status for the authenticated client. Shows milestones with status, due date, progress, and recent updates. Use when the user asks about project status, timeline, milestones, or progress.',
  inputSchema: milestoneStatusInputSchema,
  execute: async (params: MilestoneStatusInput) => {
    try {
      if (!params.userId) {
        return {
          success: false,
          error: 'User authentication required. Please log in to view your milestones.',
        };
      }

      const milestones = await getClientProjectMilestones(params.userId);

      if (milestones.length === 0) {
        return {
          success: true,
          summary: { total: 0 },
          milestonesText: 'No milestones on file yet.',
          message: 'You don’t have any project milestones yet. Your team will add them as the project progresses.',
          cta: 'Ask about deliverables or bookings, or contact your project manager for timeline details.',
        };
      }

      const byStatus = milestones.reduce(
        (acc, m) => {
          acc[m.status] = (acc[m.status] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const milestonesText = milestones
        .map((m) => {
          const due = m.due_date
            ? new Date(m.due_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'No due date';
          return `- ${m.title}: ${m.status} (${m.progress_percent}%), due ${due}`;
        })
        .join('\n');

      return {
        success: true,
        summary: {
          total: milestones.length,
          byStatus,
        },
        milestonesText,
        message: `You have ${milestones.length} milestone(s). ${milestones.filter((m) => m.status === 'completed').length} completed, ${milestones.filter((m) => m.status === 'in_progress').length} in progress.`,
        cta: 'I can give more detail on a specific milestone if you tell me which one.',
      };
    } catch (error) {
      console.error('Error fetching milestone status:', error);
      return {
        success: false,
        error: 'Failed to retrieve milestone information. Please try again or contact support.',
      };
    }
  },
});

/**
 * Tool to get detailed information about a specific milestone (including recent updates).
 */
export const milestoneDetailsTool = tool({
  description:
    'Get detailed information about a specific project milestone, including recent updates. Use when the user asks about one milestone by name or wants more detail.',
  inputSchema: z.object({
    userId: z.string().describe('The authenticated user ID'),
    milestoneId: z.string().optional().describe('Specific milestone ID to look up'),
  }),
  execute: async (params: { userId: string; milestoneId?: string }) => {
    try {
      if (!params.userId) {
        return {
          success: false,
          error: 'User authentication required.',
        };
      }

      const milestones = await getClientProjectMilestones(params.userId);

      if (params.milestoneId) {
        const milestone = milestones.find((m) => m.id === params.milestoneId);
        if (!milestone) {
          return {
            success: false,
            error: `Milestone ${params.milestoneId} not found.`,
          };
        }

        let recentUpdates: string[] = [];
        try {
          const updates = await getMilestoneUpdates(milestone.id);
          recentUpdates = updates
            .slice(0, 5)
            .map(
              (u) =>
                `${new Date(u.created_at).toLocaleDateString('en-US')}: ${u.update_text}`
            );
        } catch {
          // ignore if no updates or RLS
        }

        const due = milestone.due_date
          ? new Date(milestone.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'No due date';

        return {
          success: true,
          milestone: {
            id: milestone.id,
            title: milestone.title,
            description: milestone.description,
            status: milestone.status,
            progressPercent: milestone.progress_percent,
            dueDate: due,
            recentUpdates: recentUpdates.length
              ? recentUpdates.join('\n')
              : 'No updates yet.',
          },
        };
      }

      return {
        success: true,
        milestones: milestones.map((m) => ({
          id: m.id,
          title: m.title,
          status: m.status,
          progressPercent: m.progress_percent,
          dueDate: m.due_date
            ? new Date(m.due_date).toLocaleDateString('en-US')
            : null,
        })),
      };
    } catch (error) {
      console.error('Error fetching milestone details:', error);
      return {
        success: false,
        error: 'Failed to retrieve milestone details.',
      };
    }
  },
});

/**
 * Centralized Zod Validation Schemas
 * 
 * All public-facing form and API input validation schemas
 * Ensures consistent validation across the application
 */

import { z } from 'zod'

// ============================================================================
// BLOG POST SCHEMAS
// ============================================================================

export const blogPostSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  summary: z
    .string()
    .min(20, 'Summary must be at least 20 characters')
    .max(500, 'Summary must be less than 500 characters'),
  publishedAt: z.string().min(1, 'Publish date is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  heroImage: z.string().url().optional().or(z.literal('')),
  content: z.string().min(50, 'Content must be at least 50 characters'),
})

export const blogPostUpdateSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  summary: z
    .string()
    .min(20, 'Summary must be at least 20 characters')
    .max(500, 'Summary must be less than 500 characters')
    .optional(),
  publishedAt: z.string().min(1, 'Publish date is required').optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required').optional(),
  heroImage: z.string().url().optional().or(z.literal('')),
  content: z.string().min(50, 'Content must be at least 50 characters').optional(),
})

export type BlogPostInput = z.infer<typeof blogPostSchema>
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  company: z.string().optional(),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

export const imageUploadSchema = z.object({
  folder: z.enum(['blog', 'case-studies']).default('blog'),
})

export const avatarUploadSchema = z.object({
  // File validation happens in the route handler
  // This schema is for any additional metadata
})

export const contractUploadSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
})

export const deliverableUploadSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
})

// ============================================================================
// MILESTONE SCHEMAS
// ============================================================================

export const createMilestoneSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).default('pending'),
  progress_percent: z.number().min(0).max(100).default(0),
})

export const updateMilestoneSchema = z.object({
  client_id: z.string().uuid('Invalid client ID').optional(),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional(),
  progress_percent: z.number().min(0).max(100).optional(),
})

export const milestoneUpdateSchema = z.object({
  update_text: z.string().min(1, 'Update text is required').max(1000, 'Update must be less than 1000 characters'),
})

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

export const createNotificationSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  milestone_id: z.string().uuid('Invalid milestone ID'),
  notification_type: z.enum(['update', 'reminder', 'alert']),
  message: z.string().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
})

// ============================================================================
// DATABASE SCHEMAS - PROFILES
// ============================================================================

/** Application roles: OWNER (admin), CLIENT, SALES (contractor), DEV (developer contractor) */
export const profileRoleEnum = z.enum(['OWNER', 'CLIENT', 'SALES', 'DEV'])
export type ProfileRole = z.infer<typeof profileRoleEnum>

/** Roles that can be assigned via invitation (not OWNER) */
export const invitationRoleEnum = z.enum(['CLIENT', 'SALES', 'DEV'])
export type InvitationRole = z.infer<typeof invitationRoleEnum>

export const profileSchema = z.object({
  user_id: z.string().uuid(),
  role: profileRoleEnum,
  display_name: z.string().nullable(),
  company: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  email_verified: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createProfileSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  role: profileRoleEnum.default('CLIENT'),
  display_name: z.string().min(1, 'Display name is required').max(255),
  company: z.string().max(255).optional(),
})

export const updateProfileSchema = z.object({
  user_id: z.string().uuid('Invalid user ID').optional(),
  role: profileRoleEnum.optional(),
  display_name: z.string().min(1, 'Display name is required').max(255).optional(),
  company: z.string().max(255).optional(),
})

// ============================================================================
// DATABASE SCHEMAS - CLIENT ASSIGNMENTS
// ============================================================================

export const assignmentRoleTypeEnum = z.enum(['SALES', 'DEV'])
export const assignmentStatusEnum = z.enum(['ACTIVE', 'ENDED'])

export const clientAssignmentSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  assigned_user_id: z.string().uuid(),
  role_type: assignmentRoleTypeEnum,
  status: assignmentStatusEnum,
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createClientAssignmentSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  assigned_user_id: z.string().uuid('Invalid assigned user ID'),
  role_type: assignmentRoleTypeEnum,
})

export const updateClientAssignmentSchema = z.object({
  status: assignmentStatusEnum.optional(),
  ended_at: z.string().datetime().nullable().optional(),
})

// ============================================================================
// DATABASE SCHEMAS - BOOKINGS
// ============================================================================

export const bookingProviderEnum = z.enum(['calcom', 'gcal', 'manual'])
export type BookingProvider = z.infer<typeof bookingProviderEnum>

export const bookingSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid().nullable(),
  assigned_user_id: z.string().uuid().nullable().optional(),
  created_by: z.string().uuid().nullable().optional(),
  title: z.string(),
  description: z.string().nullable(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  external_id: z.string().nullable(),
  provider: bookingProviderEnum,
  attendee_email: z.string().email(),
  attendee_name: z.string().nullable(),
  location: z.string().nullable(),
  meeting_link: z.string().nullable(),
  notes: z.string().nullable(),
  agenda: z.string().nullable().optional(),
  status: z.enum(['confirmed', 'cancelled', 'rescheduled']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

const createBookingFields = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  assigned_user_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  starts_at: z.string().datetime('Invalid start time'),
  ends_at: z.string().datetime('Invalid end time'),
  external_id: z.string().optional(),
  provider: z.enum(['calcom', 'gcal']).default('calcom'),
  attendee_email: z.string().email('Invalid email'),
  attendee_name: z.string().optional(),
  location: z.string().optional(),
  meeting_link: z.string().url().optional(),
  notes: z.string().optional(),
})

export const createBookingSchema = createBookingFields.refine(
  (data) => new Date(data.starts_at) < new Date(data.ends_at),
  {
    message: 'Start time must be before end time',
    path: ['ends_at'],
  }
)

export const updateBookingSchema = createBookingFields.partial().refine(
  (data) => {
    if (data.starts_at !== undefined && data.ends_at !== undefined) {
      return new Date(data.starts_at) < new Date(data.ends_at)
    }
    return true
  },
  {
    message: 'Start time must be before end time',
    path: ['ends_at'],
  }
)

/**
 * Schema used by the admin "schedule a meeting" flow.
 * - `client_id` is OPTIONAL (admin can schedule with prospects who don't have an account).
 * - Provider defaults to 'manual'.
 * - `notify_attendee` controls whether we send the email + ICS attachment.
 */
export const adminCreateBookingSchema = z
  .object({
    client_id: z.string().uuid('Invalid client ID').optional().nullable(),
    title: z
      .string()
      .min(1, 'Title is required')
      .max(255, 'Title must be less than 255 characters'),
    description: z.string().max(2000).optional(),
    starts_at: z.string().datetime('Invalid start time'),
    ends_at: z.string().datetime('Invalid end time'),
    attendee_email: z.string().email('Invalid email'),
    attendee_name: z.string().max(255).optional(),
    location: z.string().max(255).optional(),
    meeting_link: z
      .string()
      .url('Meeting link must be a valid URL')
      .optional()
      .or(z.literal('')),
    agenda: z.string().max(5000).optional(),
    notes: z.string().max(5000).optional(),
    notify_attendee: z.boolean().default(true),
  })
  .refine(
    (data) => new Date(data.starts_at) < new Date(data.ends_at),
    {
      message: 'Start time must be before end time',
      path: ['ends_at'],
    }
  )

export type AdminCreateBookingInput = z.infer<typeof adminCreateBookingSchema>

// ============================================================================
// DATABASE SCHEMAS - CONTACT MESSAGES (admin inbox)
// ============================================================================

export const contactMessageStatusEnum = z.enum([
  'new',
  'read',
  'replied',
  'archived',
])
export type ContactMessageStatus = z.infer<typeof contactMessageStatusEnum>

export const contactMessageSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  subject: z.string().nullable(),
  body: z.string(),
  user_id: z.string().uuid().nullable(),
  related_client_id: z.string().uuid().nullable(),
  status: contactMessageStatusEnum,
  read_at: z.string().datetime().nullable(),
  replied_at: z.string().datetime().nullable(),
  replied_by: z.string().uuid().nullable(),
  admin_notes: z.string().nullable(),
  source: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

/**
 * Public contact form payload (POST /api/contact). Aggressively bounded so
 * a bad actor can't dump huge payloads into the inbox.
 */
export const createContactMessageSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(120, 'Name must be less than 120 characters'),
  email: z.string().email('Enter a valid email address'),
  subject: z
    .string()
    .max(200, 'Subject must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  body: z
    .string()
    .min(10, 'Please share a bit more detail (10+ characters)')
    .max(5000, 'Message must be less than 5000 characters'),
})

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>

/**
 * Admin triage update (PATCH /api/admin/contact-messages/[id]).
 */
export const updateContactMessageSchema = z.object({
  status: contactMessageStatusEnum.optional(),
  admin_notes: z.string().max(2000).optional().nullable(),
})

export type UpdateContactMessageInput = z.infer<typeof updateContactMessageSchema>
export type ContactMessage = z.infer<typeof contactMessageSchema>

// ============================================================================
// DATABASE SCHEMAS - INVOICES
// ============================================================================

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  stripe_invoice_id: z.string().nullable(),
  amount_cents: z.number().int().positive(),
  currency: z.string().default('USD'),
  status: z.enum(['draft', 'open', 'paid', 'void', 'uncollectible']),
  description: z.string().nullable(),
  due_date: z.string().datetime().nullable(),
  paid_at: z.string().datetime().nullable(),
  hosted_invoice_url: z.string().url().nullable(),
  invoice_pdf: z.string().url().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createInvoiceSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  amount_cents: z.number().int().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
})

export const updateInvoiceSchema = z.object({
  client_id: z.string().uuid('Invalid client ID').optional(),
  amount_cents: z.number().int().positive('Amount must be positive').optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
})

// ============================================================================
// PAYMENT INTENT SCHEMAS
// ============================================================================

export const createPaymentIntentSchema = z.object({
  serviceSlug: z.string().optional(),
  amountCents: z.number().int().min(50, 'Amount must be at least 50 cents').optional(),
  userId: z.string().min(1, 'User ID is required'),
  userEmail: z.string().email('Valid email is required'),
  userName: z.string().optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  metadata: z.record(z.string(), z.string()).optional(),
}).refine(
  (data) => data.serviceSlug || data.amountCents,
  { message: 'Either serviceSlug or amountCents is required' }
)

export const paymentIntentResponseSchema = z.object({
  clientSecret: z.string(),
  paymentIntentId: z.string(),
  amount: z.number().int().positive(),
  currency: z.string(),
  customerId: z.string().optional(),
})

// ============================================================================
// DATABASE SCHEMAS - PAYMENTS
// ============================================================================

export const paymentSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid().nullable(),
  intent_id: z.string().nullable(),
  type: z.enum(['deposit', 'retainer', 'invoice']),
  amount_cents: z.number().int().positive(),
  currency: z.string().default('usd'),
  status: z.string(),
  related_service: z.string().uuid().nullable(),
  metadata: z.record(z.string(), z.string()).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createPaymentSchema = z.object({
  client_id: z.string().uuid('Invalid client ID').optional(),
  intent_id: z.string().optional(),
  type: z.enum(['deposit', 'retainer', 'invoice']),
  amount_cents: z.number().int().positive('Amount must be positive'),
  currency: z.string().default('usd'),
  status: z.string().default('pending'),
  related_service: z.string().uuid('Invalid service ID').optional(),
  metadata: z.record(z.string(), z.string()).optional(),
})

// ============================================================================
// DATABASE SCHEMAS - CONTRACTS
// ============================================================================

export const contractSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  title: z.string(),
  file_url: z.string().url(),
  file_size_bytes: z.number().int().positive(),
  mime_type: z.string(),
  uploaded_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createContractSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  title: z.string().min(1, 'Title is required').max(255),
  file_url: z.string().url('Invalid file URL'),
  file_size_bytes: z.number().int().positive('File size must be positive'),
  mime_type: z.string(),
})

export const updateContractSchema = z.object({
  client_id: z.string().uuid('Invalid client ID').optional(),
  title: z.string().min(1, 'Title is required').max(255).optional(),
  file_url: z.string().url('Invalid file URL').optional(),
  file_size_bytes: z.number().int().positive('File size must be positive').optional(),
  mime_type: z.string().optional(),
})

// ============================================================================
// DATABASE SCHEMAS - DELIVERABLES
// ============================================================================

export const deliverableSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']),
  due_date: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createDeliverableSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).default('pending'),
  due_date: z.string().datetime().optional(),
})

export const updateDeliverableSchema = z.object({
  client_id: z.string().uuid('Invalid client ID').optional(),
  title: z.string().min(1, 'Title is required').max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional(),
  due_date: z.string().datetime().optional(),
})

// ============================================================================
// DATABASE SCHEMAS - PROJECT MILESTONES
// ============================================================================

export const projectMilestoneSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  due_date: z.string().datetime().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']),
  progress_percent: z.number().int().min(0).max(100),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createProjectMilestoneSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).default('pending'),
  progress_percent: z.number().int().min(0).max(100).default(0),
})

export const updateProjectMilestoneSchema = z.object({
  client_id: z.string().uuid('Invalid client ID').optional(),
  title: z.string().min(1, 'Title is required').max(255).optional(),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional(),
  progress_percent: z.number().int().min(0).max(100).optional(),
})

// ============================================================================
// DATABASE SCHEMAS - MILESTONE UPDATES
// ============================================================================

export const milestoneUpdateRecordSchema = z.object({
  id: z.string().uuid(),
  milestone_id: z.string().uuid(),
  update_text: z.string(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
})

export const createMilestoneUpdateRecordSchema = z.object({
  milestone_id: z.string().uuid('Invalid milestone ID'),
  update_text: z.string().min(1, 'Update text is required').max(1000),
})

// ============================================================================
// DATABASE SCHEMAS - BOOKING HISTORY
// ============================================================================

export const bookingHistorySchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid(),
  action: z.string(),
  previous_status: z.string().nullable(),
  new_status: z.string().nullable(),
  changed_by: z.string().uuid(),
  created_at: z.string().datetime(),
})

// ============================================================================
// CHAT API (POST /api/chat)
// ============================================================================

const chatMessagePartSchema = z.object({
  type: z.string().max(64),
  text: z.string().max(50000).optional(),
})

/** Message shape accepted from the client / AI SDK round-trip (optional id from UI) */
export const chatApiMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(50000).default(''),
  id: z.string().max(128).optional(),
  parts: z.array(chatMessagePartSchema).max(200).optional(),
})

export const chatPostBodySchema = z
  .object({
    messages: z.array(chatApiMessageSchema).min(1).max(100),
    sessionId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    const last = data.messages[data.messages.length - 1]
    if (!last || last.role !== 'user') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Last message must be from the user',
        path: ['messages'],
      })
      return
    }
    if (!last.content.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Last user message must include non-empty content',
        path: ['messages', data.messages.length - 1, 'content'],
      })
    }
  })

// ============================================================================
// SEARCH API (GET /api/search)
// ============================================================================

export const searchQuerySchema = z
  .object({
    q: z.string().max(500).optional(),
    tag: z.string().max(100).optional(),
    type: z.enum(['blog', 'case-studies', 'all']).optional(),
  })
  .refine((d) => Boolean(d.q?.trim()) || Boolean(d.tag?.trim()), {
    message: 'Query or tag parameter is required',
    path: ['q'],
  })

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Auth types
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// File upload types
export type ImageUploadInput = z.infer<typeof imageUploadSchema>
export type ContractUploadInput = z.infer<typeof contractUploadSchema>
export type DeliverableUploadInput = z.infer<typeof deliverableUploadSchema>

// Milestone types
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>
export type MilestoneUpdateInput = z.infer<typeof milestoneUpdateSchema>
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>

// Profile types
export type Profile = z.infer<typeof profileSchema>
export type CreateProfileInput = z.infer<typeof createProfileSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// Client assignment types
export type ClientAssignment = z.infer<typeof clientAssignmentSchema>
export type CreateClientAssignmentInput = z.infer<typeof createClientAssignmentSchema>
export type UpdateClientAssignmentInput = z.infer<typeof updateClientAssignmentSchema>

// Booking types
export type Booking = z.infer<typeof bookingSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>

// Invoice types
export type Invoice = z.infer<typeof invoiceSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>

// Contract types
export type Contract = z.infer<typeof contractSchema>
export type CreateContractInput = z.infer<typeof createContractSchema>
export type UpdateContractInput = z.infer<typeof updateContractSchema>

// Deliverable types
export type Deliverable = z.infer<typeof deliverableSchema>
export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>
export type UpdateDeliverableInput = z.infer<typeof updateDeliverableSchema>

// Project milestone types
export type ProjectMilestone = z.infer<typeof projectMilestoneSchema>
export type CreateProjectMilestoneInput = z.infer<typeof createProjectMilestoneSchema>
export type UpdateProjectMilestoneInput = z.infer<typeof updateProjectMilestoneSchema>

// Milestone update types
export type MilestoneUpdateRecord = z.infer<typeof milestoneUpdateRecordSchema>
export type CreateMilestoneUpdateRecordInput = z.infer<typeof createMilestoneUpdateRecordSchema>

// Booking history types
export type BookingHistory = z.infer<typeof bookingHistorySchema>

// Payment types
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type PaymentIntentResponse = z.infer<typeof paymentIntentResponseSchema>
export type Payment = z.infer<typeof paymentSchema>
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>

// Chat & search
export type ChatPostBodyInput = z.infer<typeof chatPostBodySchema>
export type SearchQueryInput = z.infer<typeof searchQuerySchema>

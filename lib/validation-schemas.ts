/**
 * Centralized Zod Validation Schemas
 * 
 * All public-facing form and API input validation schemas
 * Ensures consistent validation across the application
 */

import { z } from 'zod'

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

export const updateMilestoneSchema = createMilestoneSchema.partial()

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

export const profileSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['OWNER', 'CLIENT']),
  display_name: z.string().nullable(),
  company: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  email_verified: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createProfileSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  role: z.enum(['OWNER', 'CLIENT']).default('CLIENT'),
  display_name: z.string().min(1, 'Display name is required').max(255),
  company: z.string().max(255).optional(),
})

export const updateProfileSchema = createProfileSchema.partial()

// ============================================================================
// DATABASE SCHEMAS - BOOKINGS
// ============================================================================

export const bookingSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  external_id: z.string().nullable(),
  provider: z.enum(['calcom', 'gcal']),
  attendee_email: z.string().email(),
  attendee_name: z.string().nullable(),
  location: z.string().nullable(),
  meeting_link: z.string().nullable(),
  notes: z.string().nullable(),
  status: z.enum(['confirmed', 'cancelled', 'rescheduled']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createBookingSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
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
}).refine((data) => new Date(data.starts_at) < new Date(data.ends_at), {
  message: 'Start time must be before end time',
  path: ['ends_at'],
})

export const updateBookingSchema = createBookingSchema.partial()

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

export const updateInvoiceSchema = createInvoiceSchema.partial()

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

export const updateContractSchema = createContractSchema.partial()

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

export const updateDeliverableSchema = createDeliverableSchema.partial()

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

export const updateProjectMilestoneSchema = createProjectMilestoneSchema.partial()

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
// DATABASE SCHEMAS - SALES INQUIRIES
// ============================================================================

export const salesInquirySchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  email: z.string().email(),
  company: z.string().nullable(),
  phone: z.string().nullable(),
  services: z.array(z.string()),
  project_description: z.string().nullable(),
  timeline: z.string().nullable(),
  budget_range: z.string().nullable(),
  additional_notes: z.string().nullable(),
  meeting_booked: z.boolean(),
  booking_id: z.string().uuid().nullable(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CLOSED_WON', 'CLOSED_LOST']),
  source: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  admin_notes: z.string().nullable(),
})

export const createSalesInquirySchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(255),
  email: z.string().email('Invalid email address'),
  company: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
  project_description: z.string().min(1, 'Project description is required').max(2000),
  timeline: z.string().optional(),
  budget_range: z.string().optional(),
  additional_notes: z.string().max(1000).optional(),
})

export const updateSalesInquirySchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  admin_notes: z.string().optional(),
  meeting_booked: z.boolean().optional(),
  booking_id: z.string().uuid().optional(),
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

// Sales inquiry types
export type SalesInquiry = z.infer<typeof salesInquirySchema>
export type CreateSalesInquiryInput = z.infer<typeof createSalesInquirySchema>
export type UpdateSalesInquiryInput = z.infer<typeof updateSalesInquirySchema>


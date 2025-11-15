import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

// Export a getter function that returns the client
export function getSupabase() {
  return getSupabaseClient()
}

// Export a proxy that ensures the client is initialized
// This allows us to use `supabase` throughout the codebase
// but defer initialization until first use
export const supabase: any = new Proxy(
  {},
  {
    get: (target, prop) => {
      const client = getSupabase()
      return (client as any)[prop]
    },
  }
)

// Types for metadata tables
export interface BlogPostMeta {
  id?: string
  slug: string
  title: string
  summary?: string
  tags?: string[]
  published_at?: string
  embedding?: number[]
}

export interface CaseStudyMeta {
  id?: string
  slug: string
  title: string
  client_name?: string
  problem?: string
  results?: string
  tags?: string[]
  published_at?: string
  embedding?: number[]
}

// Blog posts metadata functions
export async function upsertBlogPostMeta(post: BlogPostMeta) {
  const { data, error } = await supabase
    .from('blog_posts_meta')
    .upsert(post, { onConflict: 'slug' })
    .select()

  if (error) {
    console.error('Error upserting blog post metadata:', error)
    throw error
  }

  return data
}

export async function getBlogPostsMeta() {
  const { data, error } = await supabase
    .from('blog_posts_meta')
    .select('*')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts metadata:', error)
    throw error
  }

  return data
}

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

  return data
}

export async function getBlogPostsByTag(tag: string) {
  const { data, error } = await supabase
    .from('blog_posts_meta')
    .select('*')
    .contains('tags', [tag])
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts by tag:', error)
    throw error
  }

  return data
}

// Case studies metadata functions
export async function upsertCaseStudyMeta(study: CaseStudyMeta) {
  const { data, error } = await supabase
    .from('case_studies_meta')
    .upsert(study, { onConflict: 'slug' })
    .select()

  if (error) {
    console.error('Error upserting case study metadata:', error)
    throw error
  }

  return data
}

export async function getCaseStudiesMeta() {
  const { data, error } = await supabase
    .from('case_studies_meta')
    .select('*')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching case studies metadata:', error)
    throw error
  }

  return data
}

export async function searchCaseStudies(query: string) {
  const { data, error } = await supabase
    .from('case_studies_meta')
    .select('*')
    .or(`title.ilike.%${query}%,problem.ilike.%${query}%,results.ilike.%${query}%`)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error searching case studies:', error)
    throw error
  }

  return data
}

export async function getCaseStudiesByTag(tag: string) {
  const { data, error } = await supabase
    .from('case_studies_meta')
    .select('*')
    .contains('tags', [tag])
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching case studies by tag:', error)
    throw error
  }

  return data
}

// Image storage functions
export async function uploadImage(file: File, folder: 'blog' | 'case-studies') {
  const timestamp = Date.now()
  const filename = `${folder}/${timestamp}-${file.name}`

  const { data, error } = await supabase.storage
    .from('hero-images')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading image:', error)
    throw error
  }

  return data
}

export async function deleteImage(path: string) {
  const { error } = await supabase.storage
    .from('hero-images')
    .remove([path])

  if (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

export async function getImageUrl(path: string) {
  const { data } = supabase.storage
    .from('hero-images')
    .getPublicUrl(path)

  return data.publicUrl
}

export async function listImages(folder?: 'blog' | 'case-studies') {
  const { data, error } = await supabase.storage
    .from('hero-images')
    .list(folder || '', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error) {
    console.error('Error listing images:', error)
    throw error
  }

  return data
}

// Image metadata database functions
export interface ImageMetadata {
  id?: string
  path: string
  url: string
  filename: string
  size: number
  mime_type: string
  folder: 'blog' | 'case-studies'
}

export interface BlogPostImage {
  id?: string
  blog_post_slug: string
  image_id: string
  is_hero?: boolean
  position?: number
  images?: ImageMetadata
}

export interface CaseStudyImage {
  id?: string
  case_study_slug: string
  image_id: string
  is_hero?: boolean
  position?: number
  images?: ImageMetadata
}

export async function insertImageMetadata(image: ImageMetadata) {
  const { data, error } = await supabase
    .from('images')
    .insert([image])
    .select()

  if (error) {
    console.error('Error inserting image metadata:', error)
    throw error
  }

  return data
}

export async function associateImageWithBlogPost(
  blogPostSlug: string,
  imageId: string,
  isHero: boolean = false
) {
  const { data, error } = await supabase
    .from('blog_post_images')
    .insert([{ blog_post_slug: blogPostSlug, image_id: imageId, is_hero: isHero }])
    .select()

  if (error) {
    console.error('Error associating image with blog post:', error)
    throw error
  }

  return data
}

export async function associateImageWithCaseStudy(
  caseStudySlug: string,
  imageId: string,
  isHero: boolean = false
) {
  const { data, error } = await supabase
    .from('case_study_images')
    .insert([{ case_study_slug: caseStudySlug, image_id: imageId, is_hero: isHero }])
    .select()

  if (error) {
    console.error('Error associating image with case study:', error)
    throw error
  }

  return data
}

export async function getBlogPostImages(blogPostSlug: string): Promise<BlogPostImage[]> {
  const { data, error } = await supabase
    .from('blog_post_images')
    .select('*, images(*)')
    .eq('blog_post_slug', blogPostSlug)
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching blog post images:', error)
    throw error
  }

  return (data as BlogPostImage[]) || []
}

export async function getCaseStudyImages(caseStudySlug: string): Promise<CaseStudyImage[]> {
  const { data, error } = await supabase
    .from('case_study_images')
    .select('*, images(*)')
    .eq('case_study_slug', caseStudySlug)
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching case study images:', error)
    throw error
  }

  return (data as CaseStudyImage[]) || []
}

// Authentication functions
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error signing in:', error)
    throw error
  }

  return data
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Error signing up:', error)
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting current user:', error)
    return null
  }

  return user
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting session:', error)
    return null
  }

  return session
}

// Vector similarity search functions
export async function findSimilarBlogPosts(embedding: number[], limit: number = 5): Promise<BlogPostMeta[]> {
  const { data, error } = await supabase.rpc('match_blog_posts', {
    query_embedding: embedding,
    match_count: limit,
  })

  if (error) {
    console.error('Error finding similar blog posts:', error)
    throw error
  }

  return (data as BlogPostMeta[]) || []
}

export async function findSimilarCaseStudies(embedding: number[], limit: number = 5): Promise<CaseStudyMeta[]> {
  const { data, error } = await supabase.rpc('match_case_studies', {
    query_embedding: embedding,
    match_count: limit,
  })

  if (error) {
    console.error('Error finding similar case studies:', error)
    throw error
  }

  return (data as CaseStudyMeta[]) || []
}

// Update blog post with embedding
export async function updateBlogPostEmbedding(slug: string, embedding: number[]) {
  const { data, error } = await supabase
    .from('blog_posts_meta')
    .update({ embedding })
    .eq('slug', slug)
    .select()

  if (error) {
    console.error('Error updating blog post embedding:', error)
    throw error
  }

  return data
}

// Update case study with embedding
export async function updateCaseStudyEmbedding(slug: string, embedding: number[]) {
  const { data, error } = await supabase
    .from('case_studies_meta')
    .update({ embedding })
    .eq('slug', slug)
    .select()

  if (error) {
    console.error('Error updating case study embedding:', error)
    throw error
  }

  return data
}

// Services and Payments Types
export interface Service {
  id?: string
  slug: string
  title: string
  summary?: string
  details_md?: string
  price_from_cents?: number
  tier?: 'starter' | 'pro' | 'enterprise'
  is_active?: boolean
  stripe_price_id?: string
  created_at?: string
  updated_at?: string
}

export interface Payment {
  id?: string
  client_id?: string
  intent_id?: string
  type: 'deposit' | 'retainer' | 'invoice'
  amount_cents: number
  currency?: string
  status?: string
  related_service?: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

// Services functions
export async function getServices(activeOnly: boolean = true): Promise<Service[]> {
  let query = supabase.from('services').select('*')

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching services:', error)
    throw error
  }

  return (data as Service[]) || []
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching service:', error)
    throw error
  }

  return data as Service | null
}

export async function createService(service: Service) {
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()

  if (error) {
    console.error('Error creating service:', error)
    throw error
  }

  return data[0]
}

export async function updateService(id: string, updates: Partial<Service>) {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating service:', error)
    throw error
  }

  return data[0]
}

// Payments functions
export async function createPayment(payment: Payment) {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()

  if (error) {
    console.error('Error creating payment:', error)
    throw error
  }

  return data[0]
}

export async function getPaymentsByUser(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user payments:', error)
    throw error
  }

  return data
}

export async function getPaymentByIntentId(intentId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('intent_id', intentId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching payment:', error)
    throw error
  }

  return data || null
}

export async function updatePayment(id: string, updates: Partial<Payment>) {
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating payment:', error)
    throw error
  }

  return data[0]
}


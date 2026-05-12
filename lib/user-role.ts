import type { ProfileRole } from '@/lib/validation-schemas'
import { getUserProfile } from '@/lib/auth-service'

export async function getUserRole(userId: string): Promise<ProfileRole | null> {
  const profile = await getUserProfile(userId)
  return profile?.role ?? null
}

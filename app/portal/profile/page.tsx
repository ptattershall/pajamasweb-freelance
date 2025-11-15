/**
 * Client Portal Profile Page
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { User, Mail, Building2, Save, Camera, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeToggle } from '@/components/theme-toggle'

interface UserProfile {
  user_id: string
  display_name: string
  company: string
  avatar_url: string | null
  email: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    display_name: '',
    company: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/portal/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setFormData({
            display_name: data.display_name || '',
            company: data.company || '',
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setMessage('Profile updated successfully')
      } else {
        setError('Failed to update profile')
      }
    } catch (error) {
      setError('An error occurred')
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setMessage(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/portal/avatar', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile((prev) => prev ? { ...prev, avatar_url: data.avatar_url } : null)
        setMessage('Avatar updated successfully')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to upload avatar')
      }
    } catch (error) {
      setError('An error occurred while uploading avatar')
      console.error('Error uploading avatar:', error)
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) return

    setUploadingAvatar(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/portal/avatar', {
        method: 'DELETE',
      })

      if (response.ok) {
        setProfile((prev) => prev ? { ...prev, avatar_url: null } : null)
        setMessage('Avatar deleted successfully')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete avatar')
      }
    } catch (error) {
      setError('An error occurred while deleting avatar')
      console.error('Error deleting avatar:', error)
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Profile Settings</h1>
        <ThemeToggle />
      </div>

      <div className="max-w-2xl">
        {message && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-700">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a photo to personalize your profile</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Avatar Section */}
            <div className="mb-8 flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Profile avatar"
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  ) : (
                    <User className="text-muted-foreground" size={48} />
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                  >
                    <Camera className="mr-2" size={16} />
                    {profile?.avatar_url ? 'Change' : 'Upload'}
                  </Button>
                  {profile?.avatar_url && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteAvatar}
                      disabled={uploadingAvatar}
                    >
                      <Trash2 className="mr-2" size={16} />
                      Remove
                    </Button>
                  )}
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input
                  id="display_name"
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Your name"
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input
                  id="company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Your company"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}


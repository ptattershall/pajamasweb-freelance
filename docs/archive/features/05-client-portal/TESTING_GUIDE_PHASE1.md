# Client Portal Phase 1 - Testing Guide

## Prerequisites

1. **Database Migration:**
   - Run `scripts/migrations/007_client_portal_avatar_storage.sql` in Supabase SQL Editor
   - Verify the `avatars` bucket is created in Supabase Storage

2. **Environment Variables:**
   - Ensure `NEXT_PUBLIC_APP_URL` is set correctly
   - Verify Supabase credentials are configured

3. **Email Configuration:**
   - Configure email templates in Supabase Dashboard
   - Set up SMTP or use Supabase's default email service

## Test Scenarios

### 1. Email Verification Flow

**Test Case 1.1: New User Signup**
1. Navigate to `/portal/signup`
2. Fill in:
   - Email: `test@example.com`
   - Full Name: `Test User`
   - Company: `Test Company` (optional)
   - Password: `password123`
3. Click "Sign Up"
4. Expected: Redirected to signin with message "Check your email to verify your account"
5. Check email inbox for verification email
6. Click verification link in email
7. Expected: Redirected to `/portal/signin` with success message

**Test Case 1.2: Resend Verification Email**
1. Navigate to `/portal/signin`
2. Enter email of unverified account
3. Enter password
4. Click "Sign In"
5. Expected: Error message about email not confirmed
6. Click "Resend verification email" button
7. Expected: Success message "Verification email sent!"
8. Check email inbox for new verification email

### 2. Password Reset Flow

**Test Case 2.1: Request Password Reset**
1. Navigate to `/portal/signin`
2. Click "Forgot your password?" link
3. Expected: Redirected to `/portal/forgot-password`
4. Enter email: `test@example.com`
5. Click "Send Reset Link"
6. Expected: Success message "Check Your Email"
7. Check email inbox for password reset email

**Test Case 2.2: Reset Password**
1. Click password reset link in email
2. Expected: Redirected to `/portal/reset-password`
3. Enter new password: `newpassword123`
4. Confirm password: `newpassword123`
5. Click "Reset Password"
6. Expected: Success message and auto-redirect to signin
7. Sign in with new password
8. Expected: Successfully signed in

**Test Case 2.3: Password Validation**
1. Navigate to `/portal/reset-password` (via email link)
2. Enter password: `short` (less than 8 characters)
3. Click "Reset Password"
4. Expected: Error message "Password must be at least 8 characters long"
5. Enter password: `password123`
6. Confirm password: `different123`
7. Click "Reset Password"
8. Expected: Error message "Passwords do not match"

### 3. Avatar Upload Flow

**Test Case 3.1: Upload Avatar**
1. Sign in to portal
2. Navigate to `/portal/profile`
3. Click "Upload" button in avatar section
4. Select a valid image file (JPEG, PNG, GIF, or WebP)
5. Expected: 
   - Loading spinner appears
   - Avatar uploads successfully
   - Success message "Avatar updated successfully"
   - New avatar is displayed immediately

**Test Case 3.2: Change Avatar**
1. Navigate to `/portal/profile` (with existing avatar)
2. Click "Change" button
3. Select a different image file
4. Expected:
   - Old avatar is deleted from storage
   - New avatar is uploaded
   - Success message appears
   - New avatar is displayed

**Test Case 3.3: Delete Avatar**
1. Navigate to `/portal/profile` (with existing avatar)
2. Click "Remove" button
3. Confirm deletion in browser prompt
4. Expected:
   - Avatar is deleted from storage
   - Success message "Avatar deleted successfully"
   - Default user icon is displayed

**Test Case 3.4: File Validation**
1. Navigate to `/portal/profile`
2. Try to upload a file larger than 5MB
3. Expected: Error message "File size exceeds 5MB limit"
4. Try to upload an invalid file type (e.g., .txt, .pdf)
5. Expected: Error message "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."

### 4. Profile Management

**Test Case 4.1: Update Profile**
1. Navigate to `/portal/profile`
2. Update display name: `Updated Name`
3. Update company: `New Company`
4. Click "Save Changes"
5. Expected: Success message "Profile updated successfully"
6. Refresh page
7. Expected: Changes are persisted

**Test Case 4.2: View Profile**
1. Navigate to `/portal/profile`
2. Expected:
   - Email is displayed (read-only)
   - Display name is editable
   - Company is editable
   - Avatar is displayed (if uploaded)

## API Endpoint Testing

### Using cURL

**Test Password Reset Email:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Test Resend Verification:**
```bash
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Test Avatar Upload:**
```bash
curl -X POST http://localhost:3000/api/portal/avatar \
  -H "x-user-id: YOUR_USER_ID" \
  -F "file=@/path/to/image.jpg"
```

**Test Avatar Delete:**
```bash
curl -X DELETE http://localhost:3000/api/portal/avatar \
  -H "x-user-id: YOUR_USER_ID"
```

## Common Issues & Troubleshooting

### Issue: Email not received
- Check Supabase email settings
- Verify SMTP configuration
- Check spam folder
- Ensure email templates are configured

### Issue: Avatar upload fails
- Verify storage bucket exists in Supabase
- Check RLS policies are applied
- Ensure file size is under 5MB
- Verify file type is supported

### Issue: Password reset link doesn't work
- Check `NEXT_PUBLIC_APP_URL` is set correctly
- Verify redirect URL in Supabase Auth settings
- Ensure link hasn't expired (typically 1 hour)

### Issue: Verification email not working
- Check email confirmation is enabled in Supabase Auth settings
- Verify redirect URL is whitelisted in Supabase
- Check email template is configured

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Proper error messages displayed to users
- ✅ Success messages displayed on successful operations
- ✅ Data persisted correctly in database
- ✅ Files stored correctly in Supabase Storage
- ✅ Emails sent and received
- ✅ Redirects working as expected

## Next Steps After Testing

1. Address critical security issues (replace `x-user-id` headers)
2. Implement proper session management
3. Add authentication middleware
4. Test with multiple users
5. Performance testing with larger files
6. Mobile responsiveness testing


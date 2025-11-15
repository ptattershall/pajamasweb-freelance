# Phase 5: Security Testing Guide

**Date**: 2025-11-14  
**Status**: ✅ COMPLETE  
**Purpose**: Comprehensive security testing procedures

## 🔐 Authentication Testing

### Test 1: Session Validation
- [ ] Login with valid credentials
- [ ] Verify auth-token cookie is set
- [ ] Verify cookie is httpOnly
- [ ] Verify cookie is Secure flag
- [ ] Access protected route
- [ ] Verify access granted

### Test 2: Invalid Session
- [ ] Delete auth-token cookie
- [ ] Try to access protected route
- [ ] Verify redirect to signin
- [ ] Verify no data exposed

### Test 3: Expired Session
- [ ] Manually expire token
- [ ] Try to access protected route
- [ ] Verify 401 Unauthorized
- [ ] Verify redirect to signin

### Test 4: Session Hijacking
- [ ] Capture auth-token
- [ ] Use token in different browser
- [ ] Verify access granted (expected)
- [ ] Verify token is valid

### Test 5: Logout
- [ ] Login successfully
- [ ] Click logout
- [ ] Verify auth-token deleted
- [ ] Try to access protected route
- [ ] Verify redirect to signin

## 👥 Authorization Testing

### Test 1: Client Access Control
- [ ] Login as CLIENT
- [ ] Try to access /admin routes
- [ ] Verify 403 Forbidden
- [ ] Verify no admin data exposed

### Test 2: Admin Access Control
- [ ] Login as OWNER
- [ ] Access /admin routes
- [ ] Verify access granted
- [ ] Verify all admin features work

### Test 3: Data Isolation
- [ ] Login as CLIENT A
- [ ] Try to access CLIENT B's data
- [ ] Verify 404 Not Found
- [ ] Verify no data exposed

### Test 4: Role Verification
- [ ] Manually change role in database
- [ ] Try to access admin endpoints
- [ ] Verify access denied
- [ ] Verify role check working

## 🔒 Data Protection Testing

### Test 1: RLS Policies
- [ ] Query invoices as CLIENT
- [ ] Verify only own invoices returned
- [ ] Query invoices as OWNER
- [ ] Verify all invoices returned

### Test 2: File Access
- [ ] Generate signed URL as CLIENT
- [ ] Try to access other client's file
- [ ] Verify 403 Forbidden
- [ ] Verify no file exposed

### Test 3: Signed URL Expiration
- [ ] Generate signed URL
- [ ] Wait 1 hour
- [ ] Try to use expired URL
- [ ] Verify 403 Forbidden

### Test 4: PII Masking
- [ ] Submit form with email
- [ ] Check logs
- [ ] Verify email masked
- [ ] Verify no PII exposed

## 🛡️ API Security Testing

### Test 1: SQL Injection
- [ ] Try: `'; DROP TABLE invoices; --`
- [ ] Verify no error
- [ ] Verify table still exists
- [ ] Verify no injection possible

### Test 2: XSS Injection
- [ ] Try: `<script>alert('xss')</script>`
- [ ] Verify script not executed
- [ ] Verify content escaped
- [ ] Verify no XSS possible

### Test 3: CSRF Attack
- [ ] Create form on external site
- [ ] Try to submit to API
- [ ] Verify request rejected
- [ ] Verify CSRF protection working

### Test 4: Input Validation
- [ ] Submit invalid email
- [ ] Verify validation error
- [ ] Submit negative number
- [ ] Verify validation error
- [ ] Submit oversized input
- [ ] Verify validation error

### Test 5: Error Messages
- [ ] Trigger 404 error
- [ ] Verify no sensitive data
- [ ] Trigger 500 error
- [ ] Verify no stack trace
- [ ] Verify generic error message

## 🔍 Endpoint Testing

### Test 1: Unauthenticated Access
- [ ] Call API without auth-token
- [ ] Verify 401 Unauthorized
- [ ] Verify no data exposed

### Test 2: Invalid Token
- [ ] Call API with invalid token
- [ ] Verify 401 Unauthorized
- [ ] Verify no data exposed

### Test 3: Expired Token
- [ ] Call API with expired token
- [ ] Verify 401 Unauthorized
- [ ] Verify no data exposed

### Test 4: Wrong Role
- [ ] Call admin endpoint as CLIENT
- [ ] Verify 403 Forbidden
- [ ] Verify no admin data exposed

### Test 5: Rate Limiting
- [ ] Call endpoint 100+ times
- [ ] Verify rate limiting (if implemented)
- [ ] Verify no DoS possible

## 📊 Security Checklist

### Authentication
- [ ] Session validation working
- [ ] Invalid sessions rejected
- [ ] Expired sessions rejected
- [ ] Logout clears session
- [ ] No session fixation

### Authorization
- [ ] Clients cannot access admin
- [ ] Admins can access all data
- [ ] Data isolation working
- [ ] Role verification working
- [ ] No privilege escalation

### Data Protection
- [ ] RLS policies enforced
- [ ] File access controlled
- [ ] Signed URLs expire
- [ ] PII masked in logs
- [ ] No data leakage

### API Security
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CSRF protected
- [ ] Input validated
- [ ] Errors safe

### Endpoints
- [ ] All endpoints protected
- [ ] Authentication required
- [ ] Authorization checked
- [ ] Proper error codes
- [ ] No sensitive data exposed

## 🧪 Testing Tools

### Manual Testing
- Browser DevTools
- Postman/Insomnia
- cURL commands
- Browser extensions

### Automated Testing
- Jest for unit tests
- Playwright for E2E tests
- OWASP ZAP for scanning
- Burp Suite for testing

### Security Scanning
- npm audit
- Snyk
- OWASP ZAP
- Burp Suite

## 📝 Test Results Template

```
Test: [Test Name]
Date: [Date]
Tester: [Name]
Result: [PASS/FAIL]
Details: [Details]
Recommendations: [Recommendations]
```

## ✅ Sign-Off

- [ ] All authentication tests passed
- [ ] All authorization tests passed
- [ ] All data protection tests passed
- [ ] All API security tests passed
- [ ] All endpoint tests passed
- [ ] No security vulnerabilities found
- [ ] Ready for production

## 📞 Issues Found

Document any security issues found:
1. Issue: [Description]
   Severity: [Critical/High/Medium/Low]
   Fix: [Recommended fix]
   Status: [Open/In Progress/Closed]

## 🚀 Next Steps

1. Run all security tests
2. Document results
3. Fix any issues found
4. Re-test fixes
5. Get sign-off
6. Deploy to production


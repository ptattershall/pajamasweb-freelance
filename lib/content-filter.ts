/**
 * Content Filter
 * 
 * Handles content filtering, PII masking, and inappropriate content detection
 */

export interface FilterResult {
  filtered: boolean;
  issues: string[];
  maskedContent?: string;
  piiDetected: boolean;
}

/**
 * Filter content for inappropriate material
 */
export function filterContent(content: string): FilterResult {
  const issues: string[] = [];
  let maskedContent = content;
  let piiDetected = false;

  // Check 1: Detect PII (Personal Identifiable Information)
  const piiCheck = detectAndMaskPII(content);
  if (piiCheck.detected) {
    piiDetected = true;
    maskedContent = piiCheck.masked;
    issues.push('Personal information detected and masked');
  }

  // Check 2: Detect inappropriate language
  if (containsInappropriateLanguage(maskedContent)) {
    issues.push('Inappropriate language detected');
  }

  // Check 3: Detect potential spam
  if (isSpam(maskedContent)) {
    issues.push('Spam pattern detected');
  }

  // Check 4: Detect potential phishing
  if (isPhishing(maskedContent)) {
    issues.push('Potential phishing content detected');
  }

  return {
    filtered: issues.length > 0,
    issues,
    maskedContent,
    piiDetected,
  };
}

/**
 * Detect and mask PII
 */
function detectAndMaskPII(content: string): {
  detected: boolean;
  masked: string;
} {
  let masked = content;
  let detected = false;

  // Email pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailPattern.test(masked)) {
    detected = true;
    masked = masked.replace(emailPattern, '[EMAIL]');
  }

  // Phone pattern (US format)
  const phonePattern = /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g;
  if (phonePattern.test(masked)) {
    detected = true;
    masked = masked.replace(phonePattern, '[PHONE]');
  }

  // Social Security Number pattern
  const ssnPattern = /\d{3}-\d{2}-\d{4}/g;
  if (ssnPattern.test(masked)) {
    detected = true;
    masked = masked.replace(ssnPattern, '[SSN]');
  }

  // Credit card pattern
  const ccPattern = /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g;
  if (ccPattern.test(masked)) {
    detected = true;
    masked = masked.replace(ccPattern, '[CREDIT_CARD]');
  }

  // IP address pattern
  const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  if (ipPattern.test(masked)) {
    detected = true;
    masked = masked.replace(ipPattern, '[IP_ADDRESS]');
  }

  return { detected, masked };
}

/**
 * Check for inappropriate language
 */
function containsInappropriateLanguage(content: string): boolean {
  const inappropriateWords = [
    'hate',
    'violence',
    'abuse',
    'harassment',
    'discrimination',
  ];

  const lowerContent = content.toLowerCase();
  return inappropriateWords.some((word) => lowerContent.includes(word));
}

/**
 * Check for spam patterns
 */
function isSpam(content: string): boolean {
  // Check for excessive links
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 5) return true;

  // Check for excessive capitalization
  const capsCount = (content.match(/[A-Z]/g) || []).length;
  if (capsCount / content.length > 0.5) return true;

  // Check for repeated characters
  if (/(.)\1{4,}/.test(content)) return true;

  // Check for common spam phrases
  const spamPhrases = [
    'click here now',
    'limited time offer',
    'act now',
    'buy now',
    'free money',
  ];

  const lowerContent = content.toLowerCase();
  return spamPhrases.some((phrase) => lowerContent.includes(phrase));
}

/**
 * Check for phishing patterns
 */
function isPhishing(content: string): boolean {
  const phishingIndicators = [
    'verify your account',
    'confirm your password',
    'update your information',
    'click here to confirm',
    'urgent action required',
    'suspicious activity',
  ];

  const lowerContent = content.toLowerCase();
  return phishingIndicators.some((indicator) => lowerContent.includes(indicator));
}

/**
 * Sanitize HTML content
 */
export function sanitizeHTML(content: string): string {
  // Remove script tags
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove dangerous HTML tags
  const dangerousTags = ['iframe', 'object', 'embed', 'form'];
  dangerousTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized;
}

/**
 * Check if content is safe
 */
export function isSafeContent(content: string): boolean {
  const filterResult = filterContent(content);
  return !filterResult.filtered;
}

/**
 * Get content safety score (0-100)
 */
export function getContentSafetyScore(content: string): number {
  const filterResult = filterContent(content);

  if (!filterResult.filtered) {
    return 100;
  }

  // Deduct points for each issue
  let score = 100;
  score -= filterResult.issues.length * 15;
  if (filterResult.piiDetected) score -= 20;

  return Math.max(0, score);
}


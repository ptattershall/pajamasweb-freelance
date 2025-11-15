/**
 * Safety Service
 * 
 * Handles confidence scoring, response validation, and safety checks
 */

export interface SafetyCheckResult {
  safe: boolean;
  confidence: number;
  issues: string[];
  shouldEscalate: boolean;
  escalationReason?: string;
}

export interface ConfidenceScore {
  overall: number;
  sources: {
    contentQuality: number;
    factualAccuracy: number;
    completeness: number;
    relevance: number;
  };
}

/**
 * Calculate confidence score for a response
 */
export function calculateConfidenceScore(
  response: string,
  toolsUsed: string[],
  contextRelevance: number
): ConfidenceScore {
  // Content quality (0-100)
  const contentQuality = Math.min(100, response.length / 10);

  // Factual accuracy based on tools used (0-100)
  const factualAccuracy = toolsUsed.length > 0 ? 85 : 60;

  // Completeness based on response structure (0-100)
  const completeness = calculateCompleteness(response);

  // Relevance based on context (0-100)
  const relevance = Math.round(contextRelevance * 100);

  // Overall confidence (weighted average)
  const overall = Math.round(
    contentQuality * 0.25 +
    factualAccuracy * 0.35 +
    completeness * 0.25 +
    relevance * 0.15
  );

  return {
    overall: Math.min(100, Math.max(0, overall)),
    sources: {
      contentQuality: Math.round(contentQuality),
      factualAccuracy,
      completeness,
      relevance,
    },
  };
}

/**
 * Calculate response completeness
 */
function calculateCompleteness(response: string): number {
  const hasIntro = response.length > 50;
  const hasDetails = response.length > 200;
  const hasConclusion = response.split('.').length > 3;
  const hasStructure = response.includes('\n') || response.includes('•');

  const score = [hasIntro, hasDetails, hasConclusion, hasStructure].filter(
    Boolean
  ).length;

  return (score / 4) * 100;
}

/**
 * Perform comprehensive safety check
 */
export function performSafetyCheck(
  response: string,
  confidence: number,
  toolsUsed: string[]
): SafetyCheckResult {
  const issues: string[] = [];
  let shouldEscalate = false;
  let escalationReason: string | undefined;

  // Check 1: Confidence threshold
  if (confidence < 50) {
    issues.push('Low confidence score');
    shouldEscalate = true;
    escalationReason = 'Low confidence response';
  }

  // Check 2: Response length (too short might indicate incomplete)
  if (response.length < 50) {
    issues.push('Response too short');
    shouldEscalate = true;
    escalationReason = 'Incomplete response';
  }

  // Check 3: Uncertainty indicators
  if (hasUncertaintyIndicators(response)) {
    issues.push('Response contains uncertainty');
    if (confidence < 70) {
      shouldEscalate = true;
      escalationReason = 'Uncertain response';
    }
  }

  // Check 4: Potential hallucination indicators
  if (hasPotentialHallucination(response, toolsUsed)) {
    issues.push('Potential hallucination detected');
    shouldEscalate = true;
    escalationReason = 'Potential hallucination';
  }

  // Check 5: Sensitive topic indicators
  if (hasSensitiveTopics(response)) {
    issues.push('Response contains sensitive topics');
    if (confidence < 80) {
      shouldEscalate = true;
      escalationReason = 'Sensitive topic with low confidence';
    }
  }

  return {
    safe: issues.length === 0,
    confidence,
    issues,
    shouldEscalate,
    escalationReason,
  };
}

/**
 * Check for uncertainty indicators in response
 */
function hasUncertaintyIndicators(response: string): boolean {
  const uncertaintyPhrases = [
    "i'm not sure",
    "i don't know",
    "i'm uncertain",
    "i cannot",
    "i'm unable",
    "unclear",
    "ambiguous",
    "might be",
    "could be",
    "possibly",
    "perhaps",
  ];

  const lowerResponse = response.toLowerCase();
  return uncertaintyPhrases.some((phrase) => lowerResponse.includes(phrase));
}

/**
 * Check for potential hallucination indicators
 */
function hasPotentialHallucination(response: string, toolsUsed: string[]): boolean {
  // If no tools were used but response claims specific facts, flag it
  if (toolsUsed.length === 0) {
    const specificClaims = [
      'according to',
      'the data shows',
      'statistics show',
      'research indicates',
      'studies prove',
    ];

    const lowerResponse = response.toLowerCase();
    return specificClaims.some((claim) => lowerResponse.includes(claim));
  }

  return false;
}

/**
 * Check for sensitive topics
 */
function hasSensitiveTopics(response: string): boolean {
  const sensitiveKeywords = [
    'medical',
    'legal',
    'financial',
    'personal',
    'private',
    'confidential',
    'health',
    'diagnosis',
    'treatment',
    'investment',
    'tax',
  ];

  const lowerResponse = response.toLowerCase();
  return sensitiveKeywords.some((keyword) => lowerResponse.includes(keyword));
}

/**
 * Validate response format and structure
 */
export function validateResponseFormat(response: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for empty response
  if (!response || response.trim().length === 0) {
    errors.push('Response is empty');
  }

  // Check for excessive length
  if (response.length > 10000) {
    errors.push('Response exceeds maximum length');
  }

  // Check for suspicious patterns
  if (response.includes('<?php') || response.includes('<script>')) {
    errors.push('Response contains suspicious code patterns');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get safety recommendation
 */
export function getSafetyRecommendation(
  safetyCheck: SafetyCheckResult
): string {
  if (!safetyCheck.safe) {
    if (safetyCheck.shouldEscalate) {
      return `Escalate: ${safetyCheck.escalationReason}`;
    }
    return `Review: ${safetyCheck.issues.join(', ')}`;
  }

  if (safetyCheck.confidence < 70) {
    return 'Provide with confidence disclaimer';
  }

  return 'Safe to send';
}


/**
 * Pricing Calculation Library
 * 
 * Provides pricing heuristics and confidence scoring for project estimates.
 * Used by the AI chat pricing suggestion tool.
 */

// Base prices for different project types (in USD)
export const BASE_PRICES = {
  site: { low: 2500, high: 5000 },
  web_app: { low: 5000, high: 15000 },
  ecom: { low: 8000, high: 20000 },
  automation: { low: 3000, high: 10000 },
} as const;

// Integration complexity modifiers
export const INTEGRATION_MODIFIERS: Record<string, number> = {
  stripe: 1.2,
  oauth: 1.15,
  cms: 1.1,
  crm: 1.25,
  gcal: 1.1,
  slack: 1.05,
  zapier: 1.08,
  shopify: 1.15,
  hubspot: 1.2,
};

// Feature complexity modifiers (per feature)
export const FEATURE_COMPLEXITY = {
  low: 0.03,
  medium: 0.05,
  high: 0.08,
} as const;

export interface PricingParams {
  projectType: 'site' | 'web_app' | 'ecom' | 'automation';
  features: string[];
  integrations?: string[];
  timeline?: 'rush' | 'standard';
  notes?: string;
}

export interface PricingResult {
  lowUSD: number;
  highUSD: number;
  confidence: number;
  factors: string[];
  breakdown: {
    basePrice: { low: number; high: number };
    featureMultiplier: number;
    integrationMultiplier: number;
    timelineMultiplier: number;
  };
}

/**
 * Calculate pricing estimate based on project parameters
 */
export function calculatePricing(params: PricingParams): PricingResult {
  const base = BASE_PRICES[params.projectType];
  let featureMultiplier = 1;
  let integrationMultiplier = 1;
  let timelineMultiplier = 1;
  const factors: string[] = [];

  // Feature complexity calculation
  if (params.features && params.features.length > 0) {
    // Average complexity per feature
    const avgComplexity = params.features.length * FEATURE_COMPLEXITY.medium;
    featureMultiplier = 1 + avgComplexity;
    factors.push(`${params.features.length} features (+${(avgComplexity * 100).toFixed(0)}%)`);
  }

  // Integration modifiers
  if (params.integrations && params.integrations.length > 0) {
    params.integrations.forEach((integration) => {
      const modifier = INTEGRATION_MODIFIERS[integration] || 1;
      integrationMultiplier *= modifier;
      factors.push(`${integration} integration (+${((modifier - 1) * 100).toFixed(0)}%)`);
    });
  }

  // Timeline modifier (rush = 30% premium)
  if (params.timeline === 'rush') {
    timelineMultiplier = 1.3;
    factors.push('Rush timeline (+30%)');
  }

  // Calculate final multiplier
  const totalMultiplier = featureMultiplier * integrationMultiplier * timelineMultiplier;

  // Calculate price range
  const lowUSD = Math.round(base.low * totalMultiplier);
  const highUSD = Math.round(base.high * totalMultiplier);

  // Calculate confidence score
  // Higher confidence with more information provided
  let confidence = 0.5; // Base confidence

  // Add confidence for features (max +0.25)
  if (params.features && params.features.length > 0) {
    confidence += Math.min(0.25, params.features.length * 0.05);
  }

  // Add confidence for integrations (max +0.15)
  if (params.integrations && params.integrations.length > 0) {
    confidence += Math.min(0.15, params.integrations.length * 0.05);
  }

  // Add confidence for timeline specification (max +0.05)
  if (params.timeline) {
    confidence += 0.05;
  }

  // Cap confidence at 0.95 (always leave room for uncertainty)
  confidence = Math.min(0.95, confidence);

  return {
    lowUSD,
    highUSD,
    confidence,
    factors,
    breakdown: {
      basePrice: base,
      featureMultiplier,
      integrationMultiplier,
      timelineMultiplier,
    },
  };
}

/**
 * Format pricing result for display
 */
export function formatPricingResult(result: PricingResult): string {
  const confidencePercent = Math.round(result.confidence * 100);
  const confidenceLabel =
    result.confidence >= 0.8
      ? 'High confidence'
      : result.confidence >= 0.6
        ? 'Medium confidence'
        : 'Low confidence';

  return `
**Estimated Price Range:** $${result.lowUSD.toLocaleString()} - $${result.highUSD.toLocaleString()}

**Confidence:** ${confidenceLabel} (${confidencePercent}%)

**Factors:**
${result.factors.map((f) => `- ${f}`).join('\n')}

**Note:** This is an estimate based on the information provided. Actual pricing may vary based on specific requirements, design complexity, and additional features discovered during the discovery phase.
`.trim();
}

/**
 * Get confidence explanation
 */
export function getConfidenceExplanation(confidence: number): string {
  if (confidence >= 0.8) {
    return 'We have enough information to provide a reliable estimate.';
  } else if (confidence >= 0.6) {
    return 'We have a reasonable estimate, but more details would help refine it.';
  } else {
    return 'We need more information to provide an accurate estimate. Please share more details about your project.';
  }
}

/**
 * Validate pricing parameters
 */
export function validatePricingParams(params: PricingParams): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!params.projectType) {
    errors.push('Project type is required');
  }

  if (!Object.keys(BASE_PRICES).includes(params.projectType)) {
    errors.push(`Invalid project type: ${params.projectType}`);
  }

  if (!params.features || params.features.length === 0) {
    errors.push('At least one feature is required');
  }

  if (params.features && params.features.length > 20) {
    errors.push('Maximum 20 features allowed');
  }

  if (params.integrations) {
    const invalidIntegrations = params.integrations.filter(
      (i) => !Object.keys(INTEGRATION_MODIFIERS).includes(i)
    );
    if (invalidIntegrations.length > 0) {
      errors.push(`Invalid integrations: ${invalidIntegrations.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}


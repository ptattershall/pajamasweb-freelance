/**
 * Pricing Tool Test Script
 * 
 * Tests the pricing calculation logic with various scenarios.
 * Run with: npx ts-node scripts/test-pricing.ts
 */

import {
  calculatePricing,
  formatPricingResult,
  getConfidenceExplanation,
  validatePricingParams,
} from '@/lib/pricing';

interface TestCase {
  name: string;
  params: Parameters<typeof calculatePricing>[0];
}

const testCases: TestCase[] = [
  {
    name: 'Simple brochure site',
    params: {
      projectType: 'site',
      features: ['home page', 'about page', 'contact form'],
    },
  },
  {
    name: 'Web app with auth and Stripe',
    params: {
      projectType: 'web_app',
      features: ['user authentication', 'dashboard', 'payment processing', 'admin panel'],
      integrations: ['stripe', 'oauth'],
    },
  },
  {
    name: 'E-commerce with multiple integrations',
    params: {
      projectType: 'ecom',
      features: [
        'product catalog',
        'shopping cart',
        'checkout',
        'user accounts',
        'order tracking',
        'inventory management',
      ],
      integrations: ['stripe', 'cms', 'crm'],
    },
  },
  {
    name: 'Automation with rush timeline',
    params: {
      projectType: 'automation',
      features: ['workflow automation', 'notifications', 'reporting'],
      integrations: ['slack', 'zapier'],
      timeline: 'rush',
    },
  },
  {
    name: 'Complex web app',
    params: {
      projectType: 'web_app',
      features: [
        'user auth',
        'real-time notifications',
        'file uploads',
        'advanced search',
        'analytics',
        'API',
        'mobile responsive',
      ],
      integrations: ['stripe', 'oauth', 'crm', 'slack'],
      timeline: 'standard',
    },
  },
];

function runTests() {
  console.log('🧪 Running Pricing Tool Tests\n');
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
    console.log('-'.repeat(80));

    try {
      // Validate params
      const validation = validatePricingParams(testCase.params);
      if (!validation.valid) {
        console.log('❌ FAILED - Validation errors:');
        validation.errors.forEach((error) => console.log(`   - ${error}`));
        failed++;
        return;
      }

      // Calculate pricing
      const result = calculatePricing(testCase.params);

      // Display results
      console.log(`\n💰 Pricing Result:`);
      console.log(`   Low:  $${result.lowUSD.toLocaleString()}`);
      console.log(`   High: $${result.highUSD.toLocaleString()}`);
      console.log(`   Range: $${(result.highUSD - result.lowUSD).toLocaleString()}`);

      console.log(`\n📊 Confidence: ${(result.confidence * 100).toFixed(0)}%`);
      console.log(`   Explanation: ${getConfidenceExplanation(result.confidence)}`);

      console.log(`\n📈 Breakdown:`);
      console.log(`   Base Price: $${result.breakdown.basePrice.low.toLocaleString()} - $${result.breakdown.basePrice.high.toLocaleString()}`);
      console.log(`   Feature Multiplier: ${result.breakdown.featureMultiplier.toFixed(2)}x`);
      console.log(`   Integration Multiplier: ${result.breakdown.integrationMultiplier.toFixed(2)}x`);
      console.log(`   Timeline Multiplier: ${result.breakdown.timelineMultiplier.toFixed(2)}x`);

      console.log(`\n🎯 Factors:`);
      result.factors.forEach((factor) => console.log(`   - ${factor}`));

      console.log(`\n✅ PASSED`);
      passed++;
    } catch (error) {
      console.log(`❌ FAILED - Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

  if (failed === 0) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests();


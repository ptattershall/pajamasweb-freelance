# Phase 3: Sales Estimator Tool - Setup Guide

## Prerequisites

- Phase 1 and Phase 2 completed and working
- Node.js 20+
- Chat API running locally

## Step 1: Verify Files Created

Check that these files exist:
- ✅ `lib/pricing.ts` - Pricing calculations
- ✅ `lib/tools/pricing-suggestion.ts` - Tool definitions
- ✅ `scripts/test-pricing.ts` - Test suite
- ✅ `app/api/chat/route.ts` - Updated with tools

## Step 2: Run Tests

### 2.1 Run Pricing Tests
```bash
npx tsx scripts/test-pricing.ts
```

Expected output:
```
🧪 Running Pricing Tool Tests

📋 Test 1: Simple brochure site
💰 Pricing Result:
   Low:  $2,875
   High: $5,750
✅ PASSED

[... 4 more tests ...]

📊 Test Results: 5 passed, 0 failed
✅ All tests passed!
```

### 2.2 Verify All Tests Pass
- ✅ Simple brochure site
- ✅ Web app with auth and Stripe
- ✅ E-commerce with multiple integrations
- ✅ Automation with rush timeline
- ✅ Complex web app

## Step 3: Test in Chat

### 3.1 Start Dev Server
```bash
npm run dev
```

### 3.2 Test Pricing Queries

Open `http://localhost:3000/chat` and try:

**Query 1: Simple pricing question**
```
User: "How much does a website cost?"
Expected: AI shows pricing ranges for different project types
```

**Query 2: Specific project**
```
User: "I need a web app with user authentication and Stripe payments. 
What would that cost?"
Expected: AI calculates and shows $8,280 - $24,840 estimate
```

**Query 3: Complex project**
```
User: "E-commerce site with Stripe, CRM, and CMS integration. 
6 features needed. What's the price?"
Expected: AI calculates and shows estimate with high confidence
```

**Query 4: Rush timeline**
```
User: "I need this done in 2 weeks. How much extra?"
Expected: AI explains 30% rush premium
```

### 3.3 Verify Tool Execution

In browser DevTools:
1. Open **Network** tab
2. Send a pricing question
3. Click `/api/chat` request
4. In **Response**, verify:
   - ✅ Tool is called
   - ✅ Pricing calculated
   - ✅ Confidence shown
   - ✅ Factors listed

## Step 4: Customize Pricing (Optional)

### 4.1 Adjust Base Prices

Edit `lib/pricing.ts`:
```typescript
export const BASE_PRICES = {
  site: { low: 2500, high: 5000 },      // Adjust these
  web_app: { low: 5000, high: 15000 },
  ecom: { low: 8000, high: 20000 },
  automation: { low: 3000, high: 10000 },
};
```

### 4.2 Add/Remove Integrations

Edit `lib/pricing.ts`:
```typescript
export const INTEGRATION_MODIFIERS: Record<string, number> = {
  stripe: 1.2,
  // Add new integrations here
  // Remove integrations you don't support
};
```

### 4.3 Update Tool Schema

Edit `lib/tools/pricing-suggestion.ts`:
```typescript
integrations: z.array(
  z.enum(['stripe', 'oauth', 'cms', 'crm', 'gcal', 'slack', 'zapier', 'shopify', 'hubspot'])
  // Add new integrations to enum
)
```

### 4.4 Re-run Tests
```bash
npx tsx scripts/test-pricing.ts
```

## Step 5: Monitor Performance

### 5.1 Check Response Times

In browser DevTools:
1. Open **Network** tab
2. Send pricing question
3. Check `/api/chat` response time
4. Should be <500ms total

### 5.2 Check Tool Execution

In browser console:
```javascript
// Should see tool execution logs
console.log('Tool called: pricingSuggestion');
console.log('Result: $X - $Y');
```

## Step 6: Production Deployment

### 6.1 Verify All Tests Pass
```bash
npx tsx scripts/test-pricing.ts
```

### 6.2 Build Project
```bash
npm run build
```

### 6.3 Deploy
```bash
npm run start
```

## Troubleshooting

### Issue: Tool not being called
**Solution:**
1. Check chat API has tools defined
2. Verify tool names match in schema
3. Check browser console for errors
4. Verify OpenAI API key is set

### Issue: Incorrect pricing
**Solution:**
1. Check BASE_PRICES in lib/pricing.ts
2. Check INTEGRATION_MODIFIERS
3. Run test script to verify calculations
4. Check feature multiplier logic

### Issue: Confidence too low
**Solution:**
1. Check confidence calculation in calculatePricing()
2. Verify feature/integration counts
3. Adjust confidence thresholds if needed
4. Re-run tests

### Issue: Tool errors
**Solution:**
1. Check Zod schema validation
2. Verify input parameters
3. Check error handling in tool execute
4. Check browser console for errors

## Testing Checklist

- [ ] All 5 tests pass
- [ ] Chat API includes pricing tools
- [ ] Pricing questions trigger tool
- [ ] Estimates are reasonable
- [ ] Confidence scores make sense
- [ ] Response times acceptable
- [ ] No console errors
- [ ] Build succeeds

## Next Steps

After Phase 3 is working:
1. **Phase 4:** Implement Client-Specific Tools
2. **Phase 5:** Polish Chat UI
3. **Phase 6:** Add Guardrails and Safety

See `QUICK_START.md` for Phase 4 implementation guide.


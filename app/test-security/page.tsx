'use client'

/**
 * Security Testing Page
 * 
 * This page helps verify that all portal API routes are properly secured.
 * Access this page at: http://localhost:3000/test-security
 * 
 * IMPORTANT: Remove this file before deploying to production!
 */

import { useState } from 'react'

const API_ROUTES = [
  '/api/portal/dashboard',
  '/api/portal/invoices',
  '/api/portal/bookings',
  '/api/portal/profile',
  '/api/portal/contracts',
  '/api/portal/deliverables',
  '/api/portal/milestones',
  '/api/portal/chat-history',
]

interface TestResult {
  route: string
  status: number
  secured: boolean
  message: string
}

export default function SecurityTestPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const testRoute = async (route: string): Promise<TestResult> => {
    try {
      const response = await fetch(route)
      const secured = response.status === 401
      
      return {
        route,
        status: response.status,
        secured,
        message: secured 
          ? '✅ Properly secured (401 Unauthorized)' 
          : `❌ Not secured (returned ${response.status})`,
      }
    } catch (error) {
      return {
        route,
        status: 0,
        secured: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  const runTests = async () => {
    setTesting(true)
    setResults([])

    const testResults: TestResult[] = []
    
    for (const route of API_ROUTES) {
      const result = await testRoute(route)
      testResults.push(result)
      setResults([...testResults])
    }

    setTesting(false)
  }

  const allSecured = results.length > 0 && results.every(r => r.secured)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">🔒 API Security Test</h1>
          <p className="text-gray-600 mb-6">
            This page tests that all portal API routes properly reject unauthenticated requests.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Important:</strong> Delete this file (<code>app/test-security/page.tsx</code>) before deploying to production!
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">How it works:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Make sure you are <strong>logged out</strong> of the portal</li>
              <li>Click "Run Security Tests" below</li>
              <li>Each API route should return <strong>401 Unauthorized</strong></li>
              <li>If any route returns a different status, it's not properly secured</li>
            </ol>
          </div>

          <button
            onClick={runTests}
            disabled={testing}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-6"
          >
            {testing ? 'Testing...' : 'Run Security Tests'}
          </button>

          {results.length > 0 && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${allSecured ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold text-lg mb-2">
                  {allSecured ? '✅ All Routes Secured!' : '❌ Security Issues Found'}
                </h3>
                <p className="text-sm">
                  {allSecured 
                    ? 'All API routes properly reject unauthenticated requests.' 
                    : 'Some routes are not properly secured. Check the results below.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg mb-3">Test Results:</h3>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.secured 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <code className="text-sm font-mono">{result.route}</code>
                        <p className="text-sm mt-1">{result.message}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        result.secured 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-2">Next Steps:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>If all tests pass, your API routes are properly secured ✅</li>
              <li>Test the authenticated flow by signing in and accessing the portal</li>
              <li>See <code>docs/features/05-client-portal/TESTING_AND_DEPLOYMENT.md</code> for full testing guide</li>
              <li><strong>Delete this test page before production deployment!</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


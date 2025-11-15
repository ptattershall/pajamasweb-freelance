/**
 * Rate Limiting Utility
 * Provides different rate limiting strategies for various endpoints
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

// Initialize Redis client
const redis = Redis.fromEnv();

// Different rate limiters for different endpoints
export const rateLimiters = {
  // Chat endpoint: 10 messages per hour per user
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
  }),

  // API endpoints: 100 requests per minute per user
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
  }),

  // Auth endpoints: 5 attempts per 15 minutes per IP
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
  }),

  // File upload: 20 uploads per hour per user
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
  }),

  // Strict: 10 requests per minute (for sensitive operations)
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
  }),
};

/**
 * Get client IP from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

/**
 * Check rate limit for a user
 */
export async function checkRateLimit(
  userId: string,
  limiter: Ratelimit
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  try {
    const { success, remaining, reset } = await limiter.limit(userId);
    return {
      success,
      remaining: Math.max(0, remaining),
      resetTime: reset,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if rate limiter fails
    return { success: true, remaining: 0, resetTime: 0 };
  }
}

/**
 * Check rate limit for IP (for unauthenticated endpoints)
 */
export async function checkIpRateLimit(
  ip: string,
  limiter: Ratelimit
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  try {
    const { success, remaining, reset } = await limiter.limit(`ip:${ip}`);
    return {
      success,
      remaining: Math.max(0, remaining),
      resetTime: reset,
    };
  } catch (error) {
    console.error('IP rate limit check error:', error);
    // Fail open - allow request if rate limiter fails
    return { success: true, remaining: 0, resetTime: 0 };
  }
}

/**
 * Format rate limit response headers
 */
export function getRateLimitHeaders(
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
  };
}


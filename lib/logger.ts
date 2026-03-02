/**
 * Minimal logging utility. Logs to console and adds Sentry breadcrumbs
 * for context when errors are captured. Use in API routes and server code.
 */

import * as Sentry from '@sentry/nextjs';

type BreadcrumbLevel = 'debug' | 'info' | 'warning' | 'error';

function addBreadcrumb(
  level: BreadcrumbLevel,
  message: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    category: 'app',
    message,
    level,
    data: data ?? {},
  });
}

export const logger = {
  info(message: string, data?: Record<string, unknown>) {
    addBreadcrumb('info', message, data);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[info] ${message}`, data ?? '');
    }
  },

  warn(message: string, data?: Record<string, unknown>) {
    addBreadcrumb('warning', message, data);
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[warn] ${message}`, data ?? '');
    }
  },

  error(message: string, error?: unknown, data?: Record<string, unknown>) {
    addBreadcrumb('error', message, { ...data, error: String(error) });
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[error] ${message}`, error ?? '', data ?? '');
    }
    if (error instanceof Error) {
      Sentry.captureException(error, { extra: { message, ...data } });
    }
  },
};

// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || "https://984df65f4be33969053b7fee0c5d742d@o4509618162630656.ingest.us.sentry.io/4509618171412480",

  // Lower trace volume in production; use tracesSampler for more control if needed.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  enableLogs: true,

  // Review for GDPR: set to false if you must avoid sending IP/email to Sentry.
  sendDefaultPii: true,
});

import * as Sentry from "@sentry/nextjs";
import { sentryBeforeSend } from "./src/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  tracesSampleRate: 0.1,

  // We scrub manually in beforeSend instead — do not let Sentry attach
  // request cookies/headers/IP by default.
  sendDefaultPii: false,
  beforeSend: sentryBeforeSend,
});

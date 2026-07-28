import * as Sentry from "@sentry/nextjs";
import { sentryBeforeSend } from "./lib/sentry-scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,

  // Never record session replays / screenshots — the registration form
  // collects names, emails and free-text answers we don't want mirrored.
  sendDefaultPii: false,
  beforeSend: sentryBeforeSend,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

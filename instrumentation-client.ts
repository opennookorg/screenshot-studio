import { loadPosthog } from "@/lib/posthog";

// Local setups have no key, and starting PostHog without one logs an error.
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => void loadPosthog(), { timeout: 4000 });
  } else {
    setTimeout(() => void loadPosthog(), 2000);
  }
}

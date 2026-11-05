import type { PostHog } from "posthog-js";

let client: Promise<PostHog> | undefined;

export function loadPosthog(): Promise<PostHog> {
  client ??= import("posthog-js").then(({ default: posthog }) => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      ui_host: "https://us.posthog.com",
      defaults: "2026-01-30",
    });
    return posthog;
  });
  return client;
}

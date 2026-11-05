import { loadPosthog } from "@/lib/posthog";

if ("requestIdleCallback" in window) {
  requestIdleCallback(() => void loadPosthog(), { timeout: 4000 });
} else {
  setTimeout(() => void loadPosthog(), 2000);
}

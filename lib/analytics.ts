"use client";

import { track } from "@vercel/analytics";

export function trackEvent(name: string, properties?: Record<string, string | number | boolean>) {
  track(name, properties);
  console.info(`[analytics] ${name}`, properties ?? {});
}

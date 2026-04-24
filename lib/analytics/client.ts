"use client";

import type { AnalyticsEventName, AnalyticsPayload } from "./types";

function isBrowser() {
  return typeof window !== "undefined";
}

export async function trackEvent(
  name: AnalyticsEventName,
  payload: AnalyticsPayload = {},
) {
  if (!isBrowser()) {
    return;
  }

  try {
    const body = JSON.stringify({
      name,
      payload,
      path: window.location.pathname,
      href: window.location.href,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
      return;
    }

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Analytics should never block the product flow.
  }
}

"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/client";
import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/types";

interface TrackPageViewProps {
  eventName: AnalyticsEventName;
  payload?: AnalyticsPayload;
}

export default function TrackPageView({ eventName, payload }: TrackPageViewProps) {
  useEffect(() => {
    void trackEvent(eventName, payload);
  }, [eventName, payload]);

  return null;
}

"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEvent } from "@/lib/analytics/client";
import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/types";

type LinkProps = ComponentProps<typeof Link>;

interface TrackedLinkProps extends LinkProps {
  eventName: AnalyticsEventName;
  eventPayload?: AnalyticsPayload;
}

export default function TrackedLink({
  eventName,
  eventPayload,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        void trackEvent(eventName, eventPayload);
        onClick?.(event);
      }}
    />
  );
}

export type AnalyticsEventName =
  | "landing_viewed"
  | "cta_clicked"
  | "pricing_viewed"
  | "signup_started"
  | "signup_completed"
  | "wizard_step_completed"
  | "generation_started"
  | "generation_completed"
  | "generation_failed"
  | "paywall_viewed"
  | "upgrade_started"
  | "upgrade_completed"
  | "pdf_exported"
  | "project_opened"
  | "project_deleted";

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

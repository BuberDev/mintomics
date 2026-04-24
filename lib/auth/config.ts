function hasRealEnvValue(value: string | undefined) {
  if (!value) return false;
  return !value.includes("...") && !value.includes("_test_X") && !value.includes("_test_Z");
}

export function isClerkConfigured() {
  return hasRealEnvValue(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) && hasRealEnvValue(process.env.CLERK_SECRET_KEY);
}

export function isClerkPublishableKeyConfigured() {
  return hasRealEnvValue(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

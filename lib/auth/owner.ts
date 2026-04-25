import { getCurrentAuth, requireCurrentUserId } from "@/lib/auth/session";

export const LOCAL_OWNER_ID = "local-guest";

export async function resolveOwnerId() {
  const auth = await getCurrentAuth();
  return auth?.user.id ?? LOCAL_OWNER_ID;
}

export async function requireOwnerId(returnTo?: string | null) {
  return requireCurrentUserId(returnTo);
}

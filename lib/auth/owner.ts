import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth/config";

export const LOCAL_OWNER_ID = "local-guest";

export async function resolveOwnerId() {
  if (!isClerkConfigured()) {
    return LOCAL_OWNER_ID;
  }

  try {
    const { userId } = auth();
    return userId ?? LOCAL_OWNER_ID;
  } catch {
    return LOCAL_OWNER_ID;
  }
}

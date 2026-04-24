import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth/config";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  if (!isClerkConfigured()) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}

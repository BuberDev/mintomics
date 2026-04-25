import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { isClerkConfigured } from "@/lib/auth/config";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  if (!isClerkConfigured()) {
    return <>{children}</>;
  }

  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";
  const signInFallbackRedirectUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/generate";
  const signUpFallbackRedirectUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ?? "/generate?signup=1";

  return (
    <ClerkProvider
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={signInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
      appearance={{
        baseTheme: dark,
        elements: {
          footer: "hidden",
          userButtonPopoverFooter: "hidden",
          navbarMobileMenuRow: "hidden",
          watermark: "hidden",
        },
        variables: {
          colorPrimary: "white",
          colorBackground: "#0a0a0a",
          colorInputBackground: "#171717",
          colorInputText: "white",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

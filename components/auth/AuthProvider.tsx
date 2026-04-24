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

  return (
    <ClerkProvider
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

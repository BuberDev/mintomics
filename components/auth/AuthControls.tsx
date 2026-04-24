"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { isClerkPublishableKeyConfigured } from "@/lib/auth/config";
import { trackEvent } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

interface AuthControlsProps {
  mode?: "landing" | "app" | "mobile";
}

const isClerkEnabled = isClerkPublishableKeyConfigured();

export default function AuthControls({ mode = "landing" }: AuthControlsProps) {
  const pathname = usePathname();

  if (!isClerkEnabled) {
    return (
      <div className={cn("flex items-center gap-3", mode === "mobile" && "flex-col w-full items-stretch")}>
        <Link
          href="/generate"
          onClick={() => {
            void trackEvent("cta_clicked", { surface: "landing", label: "sign_in" });
          }}
          className={cn(
            "text-sm font-medium transition-colors",
            mode === "landing" ? "text-gray-300 hover:text-white" : 
            mode === "app" ? "rounded-lg border border-white/15 px-3 py-2 text-gray-300 hover:border-white/35 hover:text-white" :
            "rounded-xl border border-white/10 px-4 py-2.5 text-center text-white hover:bg-white/5"
          )}
        >
          Sign In
        </Link>
        <Link
          href="/generate"
          onClick={() => {
            void trackEvent("cta_clicked", { surface: "landing", label: "start_free" });
          }}
          className={cn(
            "rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100 text-center",
            mode === "mobile" && "w-full py-3 text-base"
          )}
        >
          Start Free
        </Link>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <div className={cn("flex items-center gap-4", mode === "mobile" && "flex-col w-full items-stretch")}>
          <Link
            href="/sign-in"
            onClick={() => {
              void trackEvent("cta_clicked", { surface: "landing", label: "sign_in" });
            }}
            className={cn(
              "text-sm font-medium transition-colors",
              mode === "landing" ? "text-gray-300 hover:text-white" : 
              mode === "app" ? "rounded-lg border border-white/15 px-3 py-2 text-gray-300 hover:border-white/35 hover:text-white" :
              "rounded-xl border border-white/10 px-4 py-2.5 text-center text-white hover:bg-white/5"
            )}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            onClick={() => {
              void trackEvent("cta_clicked", { surface: "landing", label: "start_free" });
            }}
            className={cn(
              "rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-gray-100 hover:scale-105 active:scale-95 text-center",
              mode === "mobile" && "w-full py-3 text-base"
            )}
          >
            Start Free
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className={cn("flex items-center gap-4", mode === "mobile" && "flex-col w-full items-stretch")}>
          {pathname !== "/generate" && (
            <Link
              href="/generate"
              onClick={() => {
                void trackEvent("cta_clicked", { surface: "app", label: "dashboard" });
              }}
              className={cn(
                "text-sm font-medium transition-colors",
                mode === "landing" ? "text-gray-300 hover:text-white" : 
                mode === "app" ? "rounded-lg border border-white/15 px-3 py-2 text-gray-300 hover:border-white/35 hover:text-white" :
                "rounded-xl border border-white/10 px-4 py-2.5 text-center text-white hover:bg-white/5"
              )}
            >
              Dashboard
            </Link>
          )}
          
          {pathname !== "/account" && (
            <Link
              href="/account"
              className={cn(
                "text-sm font-medium transition-colors",
                mode === "landing" ? "text-gray-300 hover:text-white" : 
                mode === "app" ? "rounded-lg border border-white/15 px-3 py-2 text-gray-300 hover:border-white/35 hover:text-white" :
                "rounded-xl border border-white/10 px-4 py-2.5 text-center text-white hover:bg-white/5"
              )}
            >
              Account
            </Link>
          )}

          <div className={cn(mode === "mobile" && "flex justify-center py-2")}>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "h-9 w-9", userButtonPopoverFooter: "hidden" } }} />
          </div>
        </div>
      </SignedIn>
    </>
  );
}

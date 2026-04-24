"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { isClerkPublishableKeyConfigured } from "@/lib/auth/config";

interface AuthControlsProps {
  mode?: "landing" | "app";
}

const isClerkEnabled = isClerkPublishableKeyConfigured();

export default function AuthControls({ mode = "landing" }: AuthControlsProps) {
  if (!isClerkEnabled) {
    return mode === "landing" ? (
      <Link
        href="/generate"
        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
      >
        Start Free →
      </Link>
    ) : (
      <Link
        href="/"
        className="rounded-lg border border-white/15 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-white/35 hover:text-white"
      >
        Auth Setup
      </Link>
    );
  }

  return (
    <>
      <SignedOut>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-gray-300 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
          >
            Start Free
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex items-center gap-3">
          <Link
            href="/generate"
            className={`text-sm transition-colors ${
              mode === "landing"
                ? "text-gray-300 hover:text-white"
                : "rounded-lg border border-white/15 px-3 py-2 text-gray-300 hover:border-white/35 hover:text-white"
            }`}
          >
            Dashboard
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </>
  );
}

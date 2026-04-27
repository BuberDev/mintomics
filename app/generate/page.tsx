import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireCurrentAuth } from "@/lib/auth/session";
import GenerateClient from "@/components/generate/GenerateClient";

export const runtime = "nodejs";
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-image-preview": "none",
      "max-snippet": 0,
      "max-video-preview": 0,
    },
  },
};

export default async function GeneratePage() {
  const auth = await requireCurrentAuth("/generate");

  if (!auth?.user) {
    redirect("/sign-in?redirect_url=%2Fgenerate");
  }

  return <GenerateClient />;
}

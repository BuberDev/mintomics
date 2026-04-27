import type { Metadata } from "next";
import ResetPasswordPage from "@/components/auth/ResetPasswordPage";

export const dynamic = "force-dynamic";
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

export default function Page() {
  return <ResetPasswordPage />;
}

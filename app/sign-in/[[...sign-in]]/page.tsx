import type { Metadata } from "next";
import AuthFlowPage from "@/components/auth/AuthFlowPage";

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

export default function SignInPage() {
  return <AuthFlowPage mode="sign-in" />;
}

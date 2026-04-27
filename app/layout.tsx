import type { Metadata } from "next";
import AuthProvider from "@/components/auth/AuthProvider";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Mintomics | Elite Tokenomics Design & Simulation Tool",
  description:
    "The world's most advanced tokenomics design platform. Create investor-ready token allocations, vesting schedules, and emission curves in 60 seconds. AI-powered simulation and red flag analysis for Web3 founders.",
  keywords: [
    "tokenomics design",
    "tokenomics tool",
    "web3 tokenomics",
    "token allocation simulator",
    "vesting schedule generator",
    "crypto emission modeling",
    "token engineering platform",
    "defi tokenomics",
    "investor ready tokenomics",
    "mintomics ai",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Mintomics | Elite Tokenomics Design",
    description: "Design professional tokenomics for your Web3 project in under a minute.",
    url: SITE_URL,
    siteName: "Mintomics",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mintomics | Professional Tokenomics",
    description: "Design, simulate, and export investor-ready tokenomics.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-title" content="Mintomics" />
      </head>
      <body className="overflow-x-hidden font-sans">
        <JsonLd />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

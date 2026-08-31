import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { ServiceWorker } from "@/components/layout/service-worker";
import { AudioProvider } from "@/hooks/use-audio";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const DESCRIPTION =
  "A youth-first crime prevention app for Singapore. See what is happening, play the decision, act on it, and design what comes next.";

export const metadata: Metadata = {
  title: {
    default: "SIDEQUEST",
    template: "%s | SIDEQUEST",
  },
  description: DESCRIPTION,
  applicationName: "SIDEQUEST",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SIDEQUEST",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "SIDEQUEST",
    description: DESCRIPTION,
    siteName: "SIDEQUEST",
    type: "website",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Users must be able to zoom. Locking scale fails WCAG 1.4.4.
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG" className={`${jakarta.variable} ${grotesk.variable}`}>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-quest-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {/*
          The audio provider wraps everything, and costs almost nothing to do
          so: the engine itself is behind a dynamic import that only resolves
          when somebody turns sound on, so Home, Updates and Safe never
          download it. What is mounted here is the preference store and a
          route watcher that keeps Safe silent.
        */}
        <AudioProvider>{children}</AudioProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}

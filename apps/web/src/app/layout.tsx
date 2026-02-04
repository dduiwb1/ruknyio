import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { AppProviders } from "@/providers";
import { PWAPrompt } from "@/components/pwa-prompt";
import Script from 'next/script';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ركني - مركزك الرقمي للأعمال",
  description: "أنشئ حضورك الرقمي مع الملفات الشخصية والمتاجر والفعاليات",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ركني",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "ركني",
    title: "ركني - مركزك الرقمي للأعمال",
    description: "أنشئ حضورك الرقمي مع الملفات الشخصية والمتاجر والفعاليات",
  },
  twitter: {
    card: "summary_large_image",
    title: "ركني - مركزك الرقمي للأعمال",
    description: "أنشئ حضورك الرقمي مع الملفات الشخصية والمتاجر والفعاليات",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* PWA Meta Tags */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexArabic.variable} antialiased`}
        style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
      >

        <AppProviders>
          {children}
          <PWAPrompt />
        </AppProviders>
        
      </body>
    </html>
  );
}

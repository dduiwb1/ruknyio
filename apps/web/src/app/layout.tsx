import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic, Courgette } from "next/font/google";
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

const courgette = Courgette({
  variable: "--font-courgette",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rukny.io"),
  title: {
    default: "ركني | Rukny",
    template: "%s | ركني",
  },
  description: "صفحتك، متجرك، رابطك - كل شيء في مكان واحد",
  manifest: "/manifest.json",
  keywords: ["ركني", "متجر إلكتروني", "صفحة شخصية", "رابط حيوي", "bio link", "rukny"],
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
    locale: "ar_SA",
    siteName: "ركني",
    title: "ركني | Rukny",
    description: "صفحتك، متجرك، رابطك - كل شيء في مكان واحد",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "ركني - Rukny",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ركني | Rukny",
    description: "صفحتك، متجرك، رابطك - كل شيء في مكان واحد",
    images: ["/api/og"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexArabic.variable} ${courgette.variable} antialiased`}
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

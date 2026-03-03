import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { getUserOptional } from '@/lib/dal';
import './globals.css';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'ركني | منصة إدارة المتاجر',
    template: '%s | ركني',
  },
  description: 'منصة ركني لإدارة المتاجر الإلكترونية',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserOptional();

  return (
    <html lang="ar" dir="rtl" className={ibmPlexSansArabic.variable}>
      <body className={`${ibmPlexSansArabic.className} antialiased`}>
        <QueryProvider>
          <AuthProvider initialUser={user}>
            <ToastProvider position="bottom-right">
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

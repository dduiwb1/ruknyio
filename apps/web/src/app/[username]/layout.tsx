import { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  
  // TODO: Fetch actual user data from API
  // const user = await fetch(`${process.env.API_URL}/profiles/${username}`).then(res => res.json());
  
  const title = `@${username} | Rukny`;
  const description = `تصفح الملف الشخصي لـ @${username} على Rukny`;
  const url = `https://rukny.io/${username}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Rukny',
      type: 'profile',
      images: [
        {
          url: `/api/og/${username}`,
          width: 1200,
          height: 630,
          alt: `${username}'s profile`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og/${username}`],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function ProfileLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen" dir="rtl">
      {children}
    </div>
  );
}

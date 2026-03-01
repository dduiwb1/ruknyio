import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-white px-4 py-12"
    >
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

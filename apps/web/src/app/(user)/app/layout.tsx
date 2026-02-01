/**
 * Force all /app/* routes to be dynamic (no static prerender).
 * Fixes Next.js InvariantError: workUnitAsyncStorage during build.
 */
export const dynamic = 'force-dynamic';

export default function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

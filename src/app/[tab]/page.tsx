import PageClient from '../page-client';

/**
 * Dynamic route handler for /[tab]
 * REQUIRED Next.js 16 signature
 */
export default async function Page({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await params;

  return <PageClient initialTab={tab} />;
}

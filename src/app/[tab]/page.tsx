import TabClient from './TabClient';

// All tabs served by this dynamic route. Required for static export
// (the bundled Android build pre-renders one page per tab).
const TABS = ['apk', 'sms', 'downloads', 'url', 'spam', 'file', 'breach', 'ransomware'];

export function generateStaticParams() {
  return TABS.map((tab) => ({ tab }));
}

export const dynamicParams = false;

type Props = {
  params: Promise<{ tab: string }>;
};

export default function DynamicTabRoute({ params }: Props) {
  return <TabClient params={params} />;
}

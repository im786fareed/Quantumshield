import TrustSearch from '@/components/TrustSearch';
import PageWrapper from '../_shared/PageWrapper';
import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Trust Search — Verify Before You Trust | QuantumShield',
  description:
    'Verify any phone number, website, email, UPI ID, app or organization against real authoritative sources before you call, click or pay. Evidence-based trust verdicts, no ads, no sponsored results.',
  path: '/trust-search',
});

export default function TrustSearchPage() {
  return (
    <PageWrapper>
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <TrustSearch />
      </div>
    </PageWrapper>
  );
}

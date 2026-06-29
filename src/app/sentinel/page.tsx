'use client';
import SentinelHub from '@/components/SentinelHub';
import PageWrapper from '../_shared/PageWrapper';

export default function SentinelPage() {
  return (
    <PageWrapper>
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <SentinelHub />
      </div>
    </PageWrapper>
  );
}

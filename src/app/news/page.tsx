'use client';

import LatestNews from '@/components/LatestNews';
import PageWrapper from '../_shared/PageWrapper';

export default function newsPage() {
  return (
    <PageWrapper>
      <LatestNews lang="en" />
    </PageWrapper>
  );
}

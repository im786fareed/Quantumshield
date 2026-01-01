'use client';

import UrlChecker from '@/components/UrlChecker';
import PageWrapper from '../_shared/PageWrapper';

export default function urlPage() {
  return (
    <PageWrapper>
      <UrlChecker lang="en" />
    </PageWrapper>
  );
}

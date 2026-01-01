'use client';

import DownloadScanner from '@/components/DownloadScanner';
import PageWrapper from '../_shared/PageWrapper';

export default function downloadsPage() {
  return (
    <PageWrapper>
      <DownloadScanner lang="en" />
    </PageWrapper>
  );
}

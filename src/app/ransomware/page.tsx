'use client';

import RansomwareDetector from '@/components/RansomwareDetector';
import PageWrapper from '../_shared/PageWrapper';

export default function ransomwarePage() {
  return (
    <PageWrapper>
      <RansomwareDetector lang="en" />
    </PageWrapper>
  );
}

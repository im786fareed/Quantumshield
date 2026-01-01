'use client';

import DeviceSecurityScanner from '@/components/DeviceSecurityScanner';
import PageWrapper from '../_shared/PageWrapper';

export default function devicescanPage() {
  return (
    <PageWrapper>
      <DeviceSecurityScanner lang="en" />
    </PageWrapper>
  );
}

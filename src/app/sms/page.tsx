'use client';

import SMSGuardian from '@/components/SMSGuardian';
import PageWrapper from '../_shared/PageWrapper';

export default function smsPage() {
  return (
    <PageWrapper>
      <SMSGuardian lang="en" />
    </PageWrapper>
  );
}

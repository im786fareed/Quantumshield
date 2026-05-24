'use client';

import PhoneNumberChecker from '@/components/PhoneNumberChecker';
import PageWrapper from '../_shared/PageWrapper';

export default function PhoneGuardPage() {
  return (
    <PageWrapper>
      <PhoneNumberChecker lang="en" />
    </PageWrapper>
  );
}

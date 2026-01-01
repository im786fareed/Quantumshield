'use client';

import DataBreachChecker from '@/components/DataBreachChecker';
import PageWrapper from '../_shared/PageWrapper';

export default function breachPage() {
  return (
    <PageWrapper>
      <DataBreachChecker lang="en" />
    </PageWrapper>
  );
}

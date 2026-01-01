'use client';

import FileScanner from '@/components/FileScanner';
import PageWrapper from '../_shared/PageWrapper';

export default function filePage() {
  return (
    <PageWrapper>
      <FileScanner lang="en" />
    </PageWrapper>
  );
}

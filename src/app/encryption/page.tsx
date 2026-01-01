'use client';

import FileEncryption from '@/components/FileEncryption';
import PageWrapper from '../_shared/PageWrapper';

export default function encryptionPage() {
  return (
    <PageWrapper>
      <FileEncryption lang="en" />
    </PageWrapper>
  );
}

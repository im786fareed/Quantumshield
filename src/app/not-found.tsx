'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white px-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <ShieldAlert className="w-16 h-16 text-red-400" />
        </div>

        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>

        <p className="text-gray-300 mb-6">
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Go back to Home
        </Link>

        <p className="mt-6 text-sm text-gray-400">
          QuantumShield protects you — even from broken links.
        </p>
      </div>
    </div>
  );
}

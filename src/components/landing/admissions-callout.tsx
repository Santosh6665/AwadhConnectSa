
'use client';

import Link from 'next/link';
import { Megaphone } from 'lucide-react';

export default function AdmissionsCallout() {
  return (
    <div className="bg-blue-50 border-t border-b border-blue-200">
      <div className="container mx-auto py-3 px-4">
        <div className="flex items-center justify-center space-x-2">
          <Megaphone className="h-5 w-5 text-blue-700" />
          <p className="text-sm font-medium text-blue-800">
            Admissions for the 2025-2026 session are now open.{' '}
            <Link href="/admission" className="font-bold underline hover:text-blue-600">
              Apply Now!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

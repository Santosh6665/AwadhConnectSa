
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function AdmissionsCallout() {
  return (
    <section id="admissions" className="container mx-auto px-4">
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-headline text-2xl font-bold">Apply for Admission</h3>
            <p>Admissions for the 2025-2026 session are now open.</p>
          </div>
          <Link href="/admission">
            <Button variant="secondary" size="lg">
              Apply Now!
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}

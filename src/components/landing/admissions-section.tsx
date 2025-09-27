import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

const admissionSteps = [
  "Submit the online application form.",
  "Schedule an entrance assessment.",
  "Family interview with the admissions office.",
  "Receive admission decision within 7 working days.",
];

export default function AdmissionsSection() {
  return (
    <section id="admissions" className="container mx-auto px-4">
        <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="p-8">
                    <CardHeader className="p-0 mb-4">
                        <p className="text-primary font-semibold font-body">Admissions Open</p>
                        <CardTitle className="text-3xl md:text-4xl font-headline">Join Our Family for 2025-26</CardTitle>
                    </CardHeader>
                    <CardDescription className="mb-6">
                        We are excited to welcome new students to our community. Our admission process is designed to be straightforward and transparent, ensuring a smooth journey for prospective families.
                    </CardDescription>
                    <ul className="space-y-3 mb-8">
                    {admissionSteps.map((step, index) => (
                        <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <span>{step}</span>
                        </li>
                    ))}
                    </ul>
                    <Button size="lg" asChild>
                        <Link href="/apply">Apply Now</Link>
                    </Button>
                </div>
                <div className="hidden md:block">
                  <div className="relative w-full h-full min-h-[400px] rounded-r-lg overflow-hidden">
                     <img
                        src="https://picsum.photos/seed/admissions/800/600"
                        alt="Happy students"
                        className="object-cover w-full h-full"
                        data-ai-hint="happy students"
                      />
                  </div>
                </div>
            </div>
      </Card>
    </section>
  );
}

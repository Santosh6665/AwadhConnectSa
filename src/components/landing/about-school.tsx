import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function AboutSchool() {
  return (
    <section id="about" className="container mx-auto px-4">
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
            <div className="relative w-full h-64 md:h-full min-h-[300px]">
              <Image
                src="/about-school.jpg"
                alt="About the school"
                fill
                className="object-cover"
              />
            </div>
          <div className="p-8">
            <CardHeader className="p-0">
              <p className="text-primary font-semibold font-body">About Our School</p>
              <CardTitle className="text-3xl font-headline">School Building</CardTitle>
            </CardHeader>
            <CardDescription className="mt-4 space-y-4">
              <p>
                Founded in 2012, Awadh Inter College started as a small institution with a grand vision: to provide high-quality education to the local community and empower the youth with knowledge and values. Over the decades, we have grown in both size and stature, becoming a premier center for learning in the region.
              </p>
              <p>
                Our journey has been marked by a relentless pursuit of academic excellence, a commitment to holistic student development, and a spirit of innovation. We have continuously adapted our curriculum and infrastructure to meet the evolving needs of education, ensuring our students are well-prepared for the challenges of the future.
              </p>
            </CardDescription>
            <Button asChild className="mt-6">
              <Link href="#">Read More</Link>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}

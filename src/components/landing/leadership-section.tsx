import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '../ui/button';
import Link from 'next/link';

const leadership = [
  {
    name: "Mr. Shivam Srivastav",
    title: "Principal",
    message: "Welcome to Awadh Inter College, a place where we believe in nurturing the future. Our commitment is to provide a safe, positive, and intellectually stimulating environment that will empower students to become creative problem solvers, critical thinkers, and inspired learners prepared for the challenges of the twenty-first century.",
    imageId: "principal"
  },
  {
    name: "Mr. Pratap Lal Srivastav",
    title: "Founder",
    message: "The Awad Inter College School Management System (SMS) is initiated and conceptualized by the Founder of Awad Inter College, who envisioned a digital platform to streamline administrative, academic, and communication processes. The Founder’s mission is to modernize the institution’s operations...",
    imageId: "founder"
  },
  {
    name: "Mrs. Asha Srivastav",
    title: "Director",
    message: "As the Director of Awadh Inter College, it is my pleasure to welcome you to our vibrant community. We are dedicated to fostering an environment of academic rigor, innovation, and holistic development. Our goal is to empower every student to reach their full potential and become a leader in their chosen field.",
    imageId: "director"
  }
];

export default function LeadershipSection() {
  const imageMap = new Map(PlaceHolderImages.map(i => [i.id, i]));

  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold">Words from Our Leadership</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Guiding our vision for a brighter future.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {leadership.map((leader) => {
          const image = imageMap.get(leader.imageId);
          return (
            <Card key={leader.name} className="text-center bg-card flex flex-col">
              <CardContent className="pt-6 flex flex-col flex-grow">
                {image && (
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-primary/20">
                    <Image
                      src={image.imageUrl}
                      alt={leader.name}
                      width={128}
                      height={128}
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                    />
                  </div>
                )}
                <CardHeader className="p-0">
                    <CardTitle className="font-headline text-xl">{leader.name}</CardTitle>
                    <p className="text-primary font-semibold">{leader.title}</p>
                </CardHeader>
                <CardDescription className="mt-4 text-sm flex-grow">"{leader.message}"</CardDescription>
                <Button variant="link" asChild className="mt-4">
                  <Link href="#">Read More</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

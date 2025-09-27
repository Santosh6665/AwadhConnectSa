import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const leadership = [
  {
    name: "Dr. Ananya Sharma",
    title: "Principal",
    message: "Our vision is to foster a learning environment that encourages curiosity, critical thinking, and a passion for lifelong learning.",
    imageId: "principal"
  },
  {
    name: "Mr. Rajendra Verma",
    title: "Founder",
    message: "We built this institution on the principles of integrity, excellence, and service to the community. We continue to uphold these values.",
    imageId: "founder"
  },
  {
    name: "Mrs. Sunita Singh",
    title: "Director",
    message: "We are committed to providing a world-class education that prepares our students to be global citizens and leaders of tomorrow.",
    imageId: "director"
  }
];

export default function LeadershipSection() {
  const imageMap = new Map(PlaceHolderImages.map(i => [i.id, i]));

  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold">From Our Leadership</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Guiding principles and vision from the leaders of our institution.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {leadership.map((leader) => {
          const image = imageMap.get(leader.imageId);
          return (
            <Card key={leader.name} className="text-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
              <CardContent className="pt-6">
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
                <CardDescription className="mt-4 italic">"{leader.message}"</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

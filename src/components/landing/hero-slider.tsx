
'use client';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '../ui/button';
import Link from 'next/link';

// Define an array with your local image paths
const heroImages = [
  { id: 'hero-1', imageUrl: '/hero-1.jpg', description: 'Students in a classroom' },
  { id: 'hero-2', imageUrl: '/hero-2.jpg', description: 'School building' },
  { id: 'hero-3', imageUrl: '/hero-3.jpg', description: 'Students playing sports' },
  { id: 'hero-4', imageUrl: '/hero-4.jpg', description: 'Library' },
  { id: 'hero-5', imageUrl: '/hero-5.jpg', description: 'Students in a classroom' },

];

export default function HeroSlider() {
  return (
    <section className="w-full">
      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
          }),
        ]}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {heroImages.map((image, index) => (
            <CarouselItem key={image.id}>
              <div className="relative h-[40vh] md:h-[60vh] w-full">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg">
                      Awadh Inter College
                    </h1>
                    <p className="mt-4 text-lg md:text-2xl font-body drop-shadow-md max-w-3xl mx-auto">
                      Learning with Excellence, Living with Purpose.
                    </p>
                    <Button asChild size="lg" className="mt-8">
                      <Link href="/admission">Apply for Admission</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
      </Carousel>
    </section>
  );
}

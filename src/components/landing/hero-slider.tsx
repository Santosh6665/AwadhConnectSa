'use client';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Autoplay from "embla-carousel-autoplay";

export default function HeroSlider() {
  const heroImages = PlaceHolderImages.filter((img) => img.id.startsWith('hero-'));

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
          {heroImages.map((image) => (
            <CarouselItem key={image.id}>
              <div className="relative h-[60vh] md:h-[80vh] w-full">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={image.imageHint}
                  priority={heroImages.indexOf(image) === 0}
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg">
                      Awadh Inter College
                    </h1>
                    <p className="mt-4 text-lg md:text-2xl font-body drop-shadow-md max-w-3xl mx-auto">
                      Learning with Excellence, Living with Purpose.
                    </p>
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


import Image from 'next/image';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';

const galleryImages = [
    { id: 'gallery-1', imageUrl: '/hero-1.jpg', description: 'Students in a classroom' },
    { id: 'gallery-2', imageUrl: '/hero-2.jpg', description: 'School building' },
    { id: 'gallery-3', imageUrl: '/hero-3.jpg', description: 'Students playing sports' },
    { id: 'gallery-4', imageUrl: '/hero-4.jpg', description: 'Library' },
    { id: 'gallery-5', imageUrl: '/hero-5.jpg', description: 'Students in a classroom' },
];

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold">School Gallery</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                A glimpse into the vibrant life at Awadh Inter College.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {galleryImages.map((image) => (
            <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

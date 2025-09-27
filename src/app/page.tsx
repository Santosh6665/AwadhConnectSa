import Header from '@/components/landing/header';
import HeroSlider from '@/components/landing/hero-slider';
import NoticesPreview from '@/components/landing/notices-preview';
import EventsPreview from '@/components/landing/events-preview';
import AdmissionsSection from '@/components/landing/admissions-section';
import LeadershipSection from '@/components/landing/leadership-section';
import ContactSection from '@/components/landing/contact-section';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSlider />
        <div className="space-y-12 md:space-y-24 my-12 md:my-24">
          <NoticesPreview />
          <EventsPreview />
          <AdmissionsSection />
          <LeadershipSection />
          <ContactSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}

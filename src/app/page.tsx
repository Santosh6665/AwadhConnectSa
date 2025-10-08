import Header from '@/components/landing/header';
import HeroSlider from '@/components/landing/hero-slider';
import NoticesPreview from '@/components/landing/notices-preview';
import ContactSection from '@/components/landing/contact-section';
import Footer from '@/components/landing/footer';
import AdmissionsCallout from '@/components/landing/admissions-callout';
import WhyChooseUs from '@/components/landing/why-choose-us';
import Academics from '@/components/landing/academics';
import AboutSchool from '@/components/landing/about-school';
import QuickLinks from '@/components/landing/quick-links';
import VisionMission from '@/components/landing/vision-mission';
import LeadershipSection from '@/components/landing/leadership-section';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSlider />
        <div className="space-y-16 md:space-y-28 my-16 md:my-28">
          <AdmissionsCallout />
          <WhyChooseUs />
          <Academics />
          <AboutSchool />
          <QuickLinks />
          <VisionMission />
          <LeadershipSection />
          <NoticesPreview />
          <ContactSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}

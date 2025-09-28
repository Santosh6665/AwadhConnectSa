import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  HeartHandshake,
  Computer,
  Presentation,
  Video,
  Wifi,
  Zap,
  Users,
  Wind,
  Droplets,
  Trophy,
  BarChart,
  Target,
  GraduationCap,
  Sparkles,
  BookOpen
} from 'lucide-react';

const features = [
  {
    icon: HeartHandshake,
    title: 'Support for Underprivileged',
    description: 'Free education for poor and underprivileged children.',
  },
  {
    icon: Computer,
    title: 'Modern Computer Lab',
    description: 'State-of-the-art computer lab and dedicated computer classes.',
  },
  {
    icon: Presentation,
    title: 'Smart Classrooms',
    description: 'Interactive learning with smart classrooms equipped with projectors.',
  },
  {
    icon: Video,
    title: 'CCTV Surveillance',
    description: 'Continuous monitoring through a campus-wide CCTV network.',
  },
  {
    icon: Wifi,
    title: 'Wi-Fi Enabled Campus',
    description: 'Seamless internet connectivity throughout the campus.',
  },
  {
    icon: Zap,
    title: 'Uninterrupted Power Supply',
    description: 'Reliable power with solar energy and generator backup.',
  },
  {
    icon: Users,
    title: 'Experienced Teachers',
    description: 'High-quality teaching by our team of trained and experienced educators.',
  },
  {
    icon: Wind,
    title: 'Healthy Environment',
    description: 'Clean, safe, and well-ventilated classrooms.',
  },
  {
    icon: Droplets,
    title: 'Hygienic Facilities',
    description: 'Separate and clean washrooms for both boys and girls.',
  },
  {
    icon: Trophy,
    title: 'Co-Curricular Activities',
    description: 'Special arrangements for sports and cultural activities.',
  },
  {
    icon: Users,
    title: 'Parent-Teacher Meetings',
    description: 'Monthly PTMs to ensure strong parent-teacher collaboration.',
  },
  {
    icon: BarChart,
    title: 'Continuous Assessment',
    description: 'Weekly tests are conducted for continuous academic improvement.',
  },
  {
    icon: Target,
    title: 'Proven Success',
    description: 'A consistent 100% success rate in board examinations.',
  },
  {
    icon: GraduationCap,
    title: 'Navodaya Preparation',
    description: 'Free Navodaya Entrance Exam preparation for Class 5th students.',
  },
  {
    icon: Sparkles,
    title: 'Holistic Development',
    description: 'Focusing on both academic excellence and co-curricular activities.',
  },
];

export default function WhyChooseUs() {
  return (
    <section id="academics" className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Choose Awadh Inter College?</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          A commitment to holistic education and student success.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {features.map((feature, index) => (
          <Card key={index} className="bg-card">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardDescription className="px-6 pb-4">
              {feature.description}
            </CardDescription>
          </Card>
        ))}
        <Card className="sm:col-span-2 lg:col-span-1 xl:col-span-1 bg-primary text-primary-foreground">
             <CardHeader>
                <div className="bg-primary-foreground/20 p-3 rounded-lg w-fit">
                    <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">Proven Success</CardTitle>
             </CardHeader>
             <CardDescription className="px-6 pb-4 text-primary-foreground/80">
                A consistent 100% success rate in board examinations.
             </CardDescription>
        </Card>
      </div>
    </section>
  );
}

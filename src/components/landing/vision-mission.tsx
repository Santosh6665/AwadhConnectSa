import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Goal } from 'lucide-react';

export default function VisionMission() {
  return (
    <section className="bg-muted/50 dark:bg-muted/20 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-background">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                    <Eye className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl">Our Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To be a leading institution in providing quality education, empowering students with knowledge, skills, and values to become responsible global citizens and leaders of tomorrow.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                    <Goal className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To create a dynamic and inclusive learning environment that fosters academic excellence, critical thinking, and holistic development through innovative teaching and a commitment to lifelong learning.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

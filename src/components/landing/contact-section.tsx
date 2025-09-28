import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold">Contact Us</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          We'd love to hear from you. Reach out with any questions.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="text-center bg-card">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <MapPin className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline pt-4">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>Ghosiyari bazar, bansi, Siddharth Nagar, 272148</p>
          </CardContent>
        </Card>
        <Card className="text-center bg-card">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <Phone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline pt-4">Phone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="tel:+916393071946" className="text-muted-foreground hover:text-primary transition-colors">
              +91 6393071946
            </a>
          </CardContent>
        </Card>
        <Card className="text-center bg-card">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline pt-4">Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="mailto:info@awadhcollege.edu" className="text-muted-foreground hover:text-primary transition-colors">
              info@awadhcollege.edu
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

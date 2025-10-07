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
      <div className="mt-12 rounded-lg overflow-hidden shadow-lg">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3556.764952044813!2d82.92007227499648!3d27.05519655519894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3996b7b2585f9e2b%3A0x8a7f4e7c938159f8!2sAwadh%20Inter%20College!5e0!3m2!1sen!2sin!4v1759082269389!5m2!1sen!2sin"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>
  );
}

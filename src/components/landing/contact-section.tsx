import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Building } from 'lucide-react';

const contactInfo = [
  {
    department: 'Admin Office',
    icon: Building,
    phone: '+91 123 456 7890',
    email: 'admin@awadhconnect.edu',
  },
  {
    department: 'IT Support',
    icon: Phone,
    phone: '+91 123 456 7891',
    email: 'support@awadhconnect.edu',
  },
  {
    department: 'Academics',
    icon: Mail,
    phone: '+91 123 456 7892',
    email: 'academics@awadhconnect.edu',
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="bg-muted/50 dark:bg-muted/20 py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Get in Touch</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            We're here to help. Reach out to the right department for your inquiries.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {contactInfo.map((contact) => (
            <Card key={contact.department} className="text-center bg-background">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <contact.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline pt-4">{contact.department}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href={`tel:${contact.phone}`} className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>{contact.phone}</span>
                </a>
                <a href={`mailto:${contact.email}`} className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>{contact.email}</span>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}


import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';

const contactDetails = [
    {
        icon: MapPin,
        title: "Address",
        value: "Ghosiyari bazar, bansi, Siddharth Nagar, 272148",
    },
    {
        icon: Phone,
        title: "Phone",
        value: "+91 6393071946",
        href: "tel:+916393071946",
    },
    {
        icon: Mail,
        title: "Email",
        value: "info@awadhcollege.edu",
        href: "mailto:info@awadhcollege.edu",
    }
]

export default function ContactSection() {
  return (
    <section id="contact" className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold">Get in Touch</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          We'd love to hear from you. Reach out with any questions.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
            <div className="p-8 space-y-8">
                {contactDetails.map((item) => {
                    const Wrapper = item.href ? 'a' : 'div';
                    return (
                        <Wrapper key={item.title} href={item.href} className="flex items-start gap-4 group">
                             <div className="bg-primary/10 p-3 rounded-full">
                                <item.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-headline font-semibold text-lg">{item.title}</h3>
                                <p className="text-muted-foreground group-hover:text-primary transition-colors">{item.value}</p>
                            </div>
                        </Wrapper>
                    )
                })}
            </div>
            <div className="w-full h-64 md:h-full min-h-[300px]">
                <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.193630325444!2d82.92027227506927!3d27.055196555364116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3996b7b2585f9e2b%3A0x8a7f4e7c938159f8!2sAwadh%20Inter%20College!5e0!3m2!1sen!2sin!4v1759530438139!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>
      </Card>
    </section>
  );
}

import { Calculator, Smartphone, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  {
    icon: Calculator,
    title: 'Fair and transparent',
    description: 'No manual math required. Our smart algorithm calculates who owes what automatically.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Smartphone,
    title: 'Accessible Anywhere',
    description: 'Works on any device - phone, tablet, or computer. No app downloads required.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: DollarSign,
    title: 'Free to use',
    description: 'No hidden fees, no premium subscriptions. Split expenses completely free forever.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Use Splitsy?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for real-world expense splitting with features that actually matter
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="border-0 shadow-medium hover:shadow-strong transition-shadow duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${benefit.bgColor} mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-8 h-8 ${benefit.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
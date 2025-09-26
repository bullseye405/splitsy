import { Plus, Users, Receipt, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Plus,
    title: 'Create a group',
    description: 'Start by creating a group for your trip, event, or shared living space',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: Users,
    title: 'Add friends',
    description: 'Invite friends to join your group and start tracking expenses together',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: Receipt,
    title: 'Log expenses',
    description: 'Add expenses as they happen - meals, transport, accommodation, and more',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: CheckCircle,
    title: 'Settle debts',
    description: 'See who owes what and settle up fairly with minimal transactions',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our simple 4-step process
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step.bgColor} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile Layout - Horizontally Scrollable */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto pb-4 gap-6 snap-x snap-mandatory">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex-none w-72 text-center snap-center bg-card rounded-xl p-6 shadow-soft border">
                  <div className="relative mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step.bgColor} mb-4`}>
                      <Icon className={`w-8 h-8 ${step.color}`} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center mt-4 space-x-2">
            {steps.map((_, index) => (
              <div key={index} className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
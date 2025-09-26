import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { BenefitsSection } from './BenefitsSection';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
    </div>
  );
}
import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { BenefitsSection } from './BenefitsSection';
import { BillSplittingSection } from './BillSplittingSection';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <BillSplittingSection />
      <BenefitsSection />
    </div>
  );
}
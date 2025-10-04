import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { BenefitsSection } from './BenefitsSection';
import { BillSplittingSection } from './BillSplittingSection';

const ShowQuickSplitFeatureToggle =
  import.meta.env.VITE_SHOW_QUICK_SPLIT === 'true';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      {ShowQuickSplitFeatureToggle && <BillSplittingSection />}
      <BenefitsSection />
    </div>
  );
}

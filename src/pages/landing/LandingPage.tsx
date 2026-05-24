import { HeroSection } from "./HeroSection";
import { MockupScrollShowcase } from "./MockupScrollShowcase";
import { FiveWOneHSection } from "./FiveWOneHSection";
import { PricingSection } from "./PricingSection";
import { Testimonials } from "./Testimonials";
import { FAQSection } from "./FAQSection";
import { CtaBanner } from "./CtaBanner";
import { IntroOverlay } from "./IntroOverlay";
import { Footer, Navbar } from "../../components/layout";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-900 selection:bg-primary/30 selection:text-primary">
      <IntroOverlay />
      <Navbar />
      <main className="flex-1 overflow-x-clip">
        <HeroSection />
        <MockupScrollShowcase />
        <FiveWOneHSection />
        
        <div id="pricing" className="scroll-mt-16">
          <PricingSection />
        </div>
        
        <Testimonials />
        <FAQSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

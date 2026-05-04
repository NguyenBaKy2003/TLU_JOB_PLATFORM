import { CategoriesSection } from "@/presentation/components/home/CategoriesSection";
import { CtaSection } from "@/presentation/components/home/CtaSection";
import { FeaturesSection } from "@/presentation/components/home/FeaturesSection";
import { HeroSection } from "@/presentation/components/home/HeroSection";
import { HowItWorksSection } from "@/presentation/components/home/HowItWorksSection";
import { StatsSection } from "@/presentation/components/home/StatsSection";
import { TestimonialsSection } from "@/presentation/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
    </main>
  );
}
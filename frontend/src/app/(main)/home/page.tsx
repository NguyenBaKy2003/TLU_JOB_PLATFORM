// src/app/(main)/home/page.tsx  — hoặc src/app/page.tsx
// Page gọn: chỉ import và compose các section

import { CategoriesSection } from "@/presentation/components/home/CategoriesSection";
import { CtaSection } from "@/presentation/components/home/CtaSection";
import { FeaturesSection } from "@/presentation/components/home/FeaturesSection";
import { HeroSection } from "@/presentation/components/home/HeroSection";
import { HowItWorksSection } from "@/presentation/components/home/HowItWorksSection";
import { StatsSection } from "@/presentation/components/home/StatsSection";
import { TestimonialsSection } from "@/presentation/components/home/TestimonialsSection";



// ── Global keyframe animations (injected once) ────────────────────────────────

const GLOBAL_STYLES = `
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scrollDot {
    0%, 100% { transform: translateY(0);   opacity: 1; }
    50%      { transform: translateY(8px); opacity: 0.4; }
  }
`;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div >
        <HeroSection />
        <StatsSection />
        <CategoriesSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CtaSection />
      </div>
    </>
  );
}
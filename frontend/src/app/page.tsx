import { ChatbotButton } from "@/presentation/components/ai/ChatbotButton";
import { CategoriesSection } from "@/presentation/components/home/CategoriesSection";
import { CtaSection } from "@/presentation/components/home/CtaSection";
import { FeaturesSection } from "@/presentation/components/home/FeaturesSection";
import { HeroSection } from "@/presentation/components/home/HeroSection";
import { HowItWorksSection } from "@/presentation/components/home/HowItWorksSection";
import { RecommendationPanel } from "@/presentation/components/home/RecommendationPanel";
import { StatsSection } from "@/presentation/components/home/StatsSection";
import { TestimonialsSection } from "@/presentation/components/home/TestimonialsSection";
import { Footer } from "@/presentation/components/layout/Footer";
import { Header } from "@/presentation/components/layout/Header";

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <Header></Header>
      <HeroSection />

      <section className="max-w-[1232px] mx-auto px-4 py-10">
        <RecommendationPanel />
      </section>
      <StatsSection />
      <CategoriesSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
      <ChatbotButton></ChatbotButton>
      <Footer></Footer>
    </main>
  );
}
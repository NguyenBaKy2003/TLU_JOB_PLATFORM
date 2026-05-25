import { ChatbotButton } from "@/presentation/components/ai/ChatbotButton";
import { CategoriesSection } from "@/presentation/components/home/CategoriesSection";
import { HeroSection } from "@/presentation/components/home/HeroSection";
import { HowItWorksSection } from "@/presentation/components/home/HowItWorksSection";
import { RecommendationPanel } from "@/presentation/components/home/RecommendationPanel";
import { RecruiterBanner } from "@/presentation/components/home/RecruiterBanner";
import { FindJobsSection } from "@/presentation/components/home/FindJobsSection";
import { ChooseCompaniesSection } from "@/presentation/components/home/ChooseCompaniesSection";
import { Footer } from "@/presentation/components/layout/Footer";
import { Header } from "@/presentation/components/layout/Header";
import { MottoAndTeamSection } from "@/presentation/components/home/MottoAndTeamSection";
import { LocationAndCTASection } from "@/presentation/components/home/LocationAndCTASection";

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <Header></Header>
      <HeroSection />

      <section className="max-w-[1232px] mx-auto px-4 py-10">
        <RecommendationPanel />
      </section>
      <CategoriesSection />
      <RecruiterBanner/>
      <FindJobsSection/>
      <ChooseCompaniesSection/>
      <HowItWorksSection />
      <MottoAndTeamSection/>
      <LocationAndCTASection/>
      <ChatbotButton></ChatbotButton>
      <Footer></Footer>
    </main>
  );
}
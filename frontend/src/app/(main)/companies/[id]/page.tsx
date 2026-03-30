// src/app/(main)/companies/[id]/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { CompanyProfileCard }  from "@/presentation/components/company-detail/CompanyProfileCard";
import { CompanyTabs }         from "@/presentation/components/company-detail/CompanyTabs";
import { IntroTab }            from "@/presentation/components/company-detail/IntroTab";
import { TeamTab }             from "@/presentation/components/company-detail/TeamTab";
import { OverviewTab }         from "@/presentation/components/company-detail/OverviewTab";
import { JobsTab }             from "@/presentation/components/company-detail/JobsTab";
import { FPT_COMPANY }         from "@/presentation/components/company-detail/companyDetailMock";

// Section IDs dùng để scroll-spy
const SECTION_IDS = ["intro", "team", "overview", "jobs"] as const;
type SectionId = typeof SECTION_IDS[number];

export default function CompanyDetailPage() {
  // TODO: params.id → service.getCompany(id)
  const company = FPT_COMPANY;

  const [activeTab, setActiveTab] = useState<SectionId>("intro");
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    intro: null, team: null, overview: null, jobs: null,
  });

  // ── Scroll to section when tab clicked ───────────────────────────────────
  const handleTabChange = (id: string) => {
    const el = sectionRefs.current[id as SectionId];
    if (el) {
      // offset 120px để account cho sticky header + tabs
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setActiveTab(id as SectionId);
  };

  // ── Scroll-spy: update active tab based on scroll position ───────────────
  useEffect(() => {
    const onScroll = () => {
      for (const id of [...SECTION_IDS].reverse()) {
        const el = sectionRefs.current[id];
        if (el && el.getBoundingClientRect().top <= 140) {
          setActiveTab(id);
          return;
        }
      }
      setActiveTab("intro");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const setRef = (id: SectionId) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Cover banner ────────────────────────────────────────────── */}
      <div className="relative h-44 sm:h-56 bg-gradient-to-r from-slate-700 via-slate-600 to-blue-700 overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
      </div>

      {/* ── Profile card (overlaps banner) ──────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 mb-4">
        <CompanyProfileCard company={company} />
      </div>

      {/* ── Sticky tab navigation ────────────────────────────────────── */}
      <CompanyTabs active={activeTab} onChange={handleTabChange} />

      {/* ── Tab content sections ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-12">

        <section ref={setRef("intro")}>
          <IntroTab company={company} />
        </section>

        <div className="border-t border-gray-100" />

        <section ref={setRef("team")}>
          <TeamTab company={company} />
        </section>

        <div className="border-t border-gray-100" />

        <section ref={setRef("overview")}>
          <OverviewTab company={company} />
        </section>

        <div className="border-t border-gray-100" />

        <section ref={setRef("jobs")}>
          <JobsTab company={company} />
        </section>

      </div>
    </div>
  );
}
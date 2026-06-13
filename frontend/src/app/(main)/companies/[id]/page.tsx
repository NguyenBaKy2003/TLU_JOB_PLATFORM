"use client";
import { useState, useRef, useEffect } from "react";
import { use } from "react";
import { CompanyProfileCard } from "@/presentation/components/company-detail/CompanyProfileCard";
import { CompanyTabs } from "@/presentation/components/company-detail/CompanyTabs";
import { IntroTab } from "@/presentation/components/company-detail/IntroTab";
import { TeamTab } from "@/presentation/components/company-detail/TeamTab";
import { OverviewTab } from "@/presentation/components/company-detail/OverviewTab";
import { JobsTab } from "@/presentation/components/company-detail/JobsTab";
import type { CompanyProfile } from "@/domain/models/Company";
import { CompanyService } from "@/application/services/CompanyService";
import { CompanyRepository } from "@/infrastructure/repositories/CompanyRepository";

const SECTION_IDS = ["intro", "team", "overview", "jobs"] as const;
type SectionId = (typeof SECTION_IDS)[number];

const companyService = new CompanyService(new CompanyRepository());

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // ── Data fetching ────
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    companyService
      .getById(id)
      .then((data) => {
        if (!cancelled) setCompany(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Không tải được dữ liệu");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ── Tab / scroll logic ───────────────────────────
  const [activeTab, setActiveTab] = useState<SectionId>("intro");
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    intro: null,
    team: null,
    overview: null,
    jobs: null,
  });

  // Flag to suppress the scroll listener while programmatic scrolling is in
  // progress, so clicking a tab doesn't get immediately overridden by onScroll.
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTabChange = (id: string) => {
    const sid = id as SectionId;
    const el = sectionRefs.current[sid];

    // Set the tab immediately — don't wait for scroll to finish.
    setActiveTab(sid);

    if (el) {
      // Disable scroll-spy while smooth-scrolling.
      isScrollingRef.current = true;
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: "smooth" });

      // Re-enable scroll-spy after the animation completes (~800 ms is enough
      // for all realistic page heights with the default smooth-scroll speed).
      scrollTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  // Scroll-spy: update active tab when the user scrolls manually.
  useEffect(() => {
    const onScroll = () => {
      if (isScrollingRef.current) return;

      for (const sid of [...SECTION_IDS].reverse()) {
        const el = sectionRefs.current[sid];
        if (el && el.getBoundingClientRect().top <= 140) {
          setActiveTab(sid);
          return;
        }
      }
      setActiveTab("intro");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Clean up the debounce timer on unmount.
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const setRef = (sid: SectionId) => (el: HTMLElement | null) => {
    sectionRefs.current[sid] = el;
  };

  // ── Loading / error states ───────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-44 sm:h-56 bg-gray-200 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
          <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-[16px]">
          {error ?? "Không tìm thấy công ty"}
        </p>
      </div>
    );
  }

  // ── Main render ──────
  return (
    <div className="min-h-screen bg-[#DFEAFE]">
      {/* Cover */}
      <div className="relative h-44 sm:h-56 bg-gradient-to-r from-slate-700 via-slate-600 to-blue-700 overflow-hidden">
        {company.coverImageUrl && (
          <img
            src={company.coverImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
      </div>

      {/* Profile Card */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 mb-4">
        <CompanyProfileCard company={company} />
      </div>

      {/* Tabs */}
      <CompanyTabs active={activeTab} onChange={handleTabChange} />

      {/* Content Sections */}
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
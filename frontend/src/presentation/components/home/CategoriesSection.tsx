// src/app/(main)/home/_components/CategoriesSection.tsx
"use client";
import Link             from "next/link";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { useInView } from "./useInView";
import { FEATURED_CATEGORIES } from "@/app/(main)/home/_constants";

export function CategoriesSection() {
  const { ref, visible } = useInView();

  return (
    <section ref={ref} className="py-20 bg-sky-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          <p className="text-amber-500 text-xs font-bold uppercase tracking-[3px] mb-3">
            Lĩnh vực nổi bật
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800">
            Tìm đúng ngành nghề của bạn
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURED_CATEGORIES.map((cat, i) => (
            <Link key={i}
              href={`/jobs?category=${encodeURIComponent(cat.label)}`}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200
                bg-white hover:bg-sky-50 hover:border-blue-300
                p-5 transition-all duration-300 shadow-sm hover:shadow-md ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              style={{ transitionDelay: `${i * 60}ms`, transitionDuration: "600ms" }}>
              <div className="text-3xl mb-3">{cat.icon}</div>
              <p className="text-slate-700 font-semibold text-sm mb-0.5">{cat.label}</p>
              <p className="text-slate-400 text-xs">{cat.count} việc làm</p>
              <ArrowUpRight size={14}
                className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-500
                  group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          ))}
        </div>

        {/* View all */}
        <div className="text-center mt-8">
          <Link href="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
              border border-slate-200 text-slate-500 hover:text-blue-600 bg-white
              hover:border-blue-300 text-sm transition-all shadow-sm">
            Xem tất cả lĩnh vực <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
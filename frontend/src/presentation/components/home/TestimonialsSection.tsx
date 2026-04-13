// src/app/(main)/home/_components/TestimonialsSection.tsx
"use client";
import { TESTIMONIALS } from "@/app/(main)/home/_constants";
import { Star }        from "lucide-react";
import { useInView } from "./useInView";

export function TestimonialsSection() {
  const { ref, visible } = useInView();

  return (
    <section ref={ref} className="py-24 bg-sky-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          <p className="text-amber-500 text-xs font-bold uppercase tracking-[3px] mb-3">
            Câu chuyện thành công
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800">
            Hàng ngàn người đã tin tưởng Joblin
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i}
              className={`relative flex flex-col gap-4 p-6 rounded-2xl
                border border-slate-200 bg-white hover:bg-sky-50
                hover:border-blue-200 hover:shadow-md shadow-sm
                transition-all duration-700 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              style={{ transitionDelay: `${i * 120}ms` }}>

              {/* Quote mark */}
              <span className="text-5xl text-blue-200 font-serif leading-none select-none">
                "
              </span>

              <p className="text-slate-500 text-sm leading-relaxed -mt-3 flex-1">
                {t.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color}
                  flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-slate-700 text-sm font-semibold">{t.name}</p>
                  <p className="text-slate-400 text-[11px]">{t.role}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 absolute top-5 right-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={11} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
// src/app/(main)/home/_components/HowItWorksSection.tsx
"use client";
import Link                  from "next/link";
import { ChevronRight }      from "lucide-react";
import { useInView } from "./useInView";
import { HOW_IT_WORKS_STEPS } from "@/app/(main)/home/_constants";

export function HowItWorksSection() {
  const { ref, visible } = useInView();

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          <p className="text-amber-500 text-xs font-bold uppercase tracking-[3px] mb-3">
            Dành cho ứng viên
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">
            Chỉ 3 bước để có việc làm mới
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Quy trình đơn giản, minh bạch. Không phức tạp, không mất phí.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px
            bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />

          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <div key={i}
              className={`relative transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl
                bg-blue-100 border border-blue-200 mb-5 mx-auto shadow-sm">
                <span className="text-2xl font-black text-blue-600">{step.step}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 text-center leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Employer CTA banner */}
        <div
          className={`mt-16 p-8 rounded-3xl border border-blue-100
            bg-gradient-to-r from-sky-50 to-blue-50
            flex flex-col sm:flex-row items-center justify-between gap-6
            transition-all duration-700 shadow-sm ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          style={{ transitionDelay: "500ms" }}>
          <div>
            <p className="text-amber-500 text-xs font-bold uppercase tracking-[2px] mb-1">
              Dành cho nhà tuyển dụng
            </p>
            <h3 className="text-xl font-black text-slate-800 mb-1">
              Tìm nhân tài trong 72 giờ
            </h3>
            <p className="text-slate-400 text-sm">
              AI matching thông minh giúp bạn lọc đúng ứng viên từ pool 420,000 người.
            </p>
          </div>
          <Link href="/auth/employer/signup"
            className="shrink-0 flex items-center gap-2 px-6 py-3.5 bg-amber-400
              hover:bg-amber-300 text-slate-900 font-bold text-sm rounded-xl
              transition-colors shadow-md shadow-amber-200/40">
            Đăng tuyển miễn phí <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
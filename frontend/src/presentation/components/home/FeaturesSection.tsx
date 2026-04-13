// src/app/(main)/home/_components/FeaturesSection.tsx
"use client";
import Link from "next/link";
import {
  Zap, Shield, TrendingUp, Clock, ChevronRight,
} from "lucide-react";
import { useInView } from "./useInView";
import { FEATURES } from "@/app/(main)/home/_constants";

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  zap:      <Zap size={22} />,
  shield:   <Shield size={22} />,
  trending: <TrendingUp size={22} />,
  clock:    <Clock size={22} />,
};

export function FeaturesSection() {
  const { ref, visible } = useInView();

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center
          transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>

          {/* Left: text */}
          <div>
            <p className="text-amber-500 text-xs font-bold uppercase tracking-[3px] mb-4">
              Tại sao chọn Joblin
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-5 leading-snug">
              Nền tảng được xây dựng cho người đi làm hiện đại
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Không chỉ là job board. Joblin là đồng hành trong toàn bộ hành trình
              sự nghiệp — từ tìm việc đến phát triển bản thân.
            </p>
            <Link href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-400
                hover:bg-amber-300 text-slate-900 font-bold text-sm rounded-xl
                transition-colors shadow-md shadow-amber-200/50">
              Bắt đầu miễn phí <ChevronRight size={16} />
            </Link>
          </div>

          {/* Right: feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i}
                className={`p-5 rounded-2xl border border-slate-100 bg-slate-50
                  hover:bg-sky-50 hover:border-blue-200 transition-all duration-500
                  shadow-sm hover:shadow-md ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                style={{ transitionDelay: `${200 + i * 100}ms` }}>
                <div className="inline-flex items-center justify-center w-10 h-10
                  rounded-xl bg-blue-100 text-blue-600 mb-3">
                  {FEATURE_ICONS[f.iconKey]}
                </div>
                <h3 className="text-slate-800 font-bold text-sm mb-1.5">{f.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
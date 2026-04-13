// src/app/(main)/home/_components/CtaSection.tsx
"use client";
import Link                from "next/link";
import { Briefcase, ChevronRight } from "lucide-react";
import { useInView } from "./useInView";

export function CtaSection() {
  const { ref, visible } = useInView();

  return (
    <section ref={ref} className="py-24 bg-sky-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className={`relative transition-all duration-700 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}>
          {/* Background glow */}
          <div className="absolute inset-0 bg-blue-200/40 rounded-3xl blur-3xl" />

          <div className="relative px-8 py-16 rounded-3xl border border-blue-200
            bg-gradient-to-br from-white to-blue-50 shadow-xl shadow-blue-100/50">

            <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center
              justify-center mx-auto mb-6 shadow-xl shadow-amber-200/60">
              <Briefcase size={28} className="text-white" strokeWidth={2.5} />
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-4">
              Sẵn sàng tìm việc<br />
              <span className="text-blue-600">mơ ước?</span>
            </h2>

            <p className="text-slate-500 mb-10 max-w-lg mx-auto">
              Tham gia cùng hơn 420,000 ứng viên đang xây dựng sự nghiệp với Joblin.
              Hoàn toàn miễn phí.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup"
                className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900
                  font-bold rounded-xl transition-colors flex items-center
                  justify-center gap-2 shadow-md shadow-amber-200/50">
                Tạo tài khoản miễn phí <ChevronRight size={16} />
              </Link>
              <Link href="/jobs"
                className="px-8 py-4 border border-slate-200 text-slate-600 hover:text-blue-600
                  hover:border-blue-300 bg-white rounded-xl transition-colors flex items-center
                  justify-center gap-2">
                Khám phá việc làm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
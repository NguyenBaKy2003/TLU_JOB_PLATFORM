"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useInView } from "./useInView";
import { HOW_IT_WORKS } from "./constants";

export function HowItWorksSection() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 mb-4">
            <span className="text-purple-400 text-xs font-semibold">CÁCH THỨC HOẠT ĐỘNG</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Chỉ 3 bước để có việc làm mới
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Quy trình đơn giản, nhanh chóng và hiệu quả
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50" />

          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative text-center"
              >
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xs">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-white/50 text-[16px] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 text-center"
        >
          <p className="text-white/70">
            Dành cho nhà tuyển dụng?{" "}
            <Link href="/auth/employer/signup" className="text-blue-400 hover:underline inline-flex items-center gap-1">
              Đăng tuyển miễn phí
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Rocket } from "lucide-react";
import { useInView } from "./useInView";

export function CtaSection() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="py-20 bg-[#0f0f1e]">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-300" />
          <div className="relative rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-12 text-center overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-600/10 to-emerald-600/10 rounded-full blur-3xl" />
            
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-xl"
            >
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Sẵn sàng tìm việc mơ ước?
            </h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Tham gia cùng hơn 420,000 ứng viên đang xây dựng sự nghiệp với CareerUp
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Đăng ký miễn phí</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                Khám phá việc làm
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
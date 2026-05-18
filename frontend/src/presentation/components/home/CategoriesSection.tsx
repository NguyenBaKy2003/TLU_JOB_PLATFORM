"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useInView } from "./useInView";
import { FEATURED_CATEGORIES } from "./constants";

const colorMap: Record<string, string> = {
  blue: "from-blue-600/20 to-cyan-600/20 border-blue-500/30 hover:border-blue-500",
  purple: "from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-500",
  pink: "from-pink-600/20 to-rose-600/20 border-pink-500/30 hover:border-pink-500",
  emerald: "from-emerald-600/20 to-teal-600/20 border-emerald-500/30 hover:border-emerald-500",
  amber: "from-amber-600/20 to-orange-600/20 border-amber-500/30 hover:border-amber-500",
  rose: "from-rose-600/20 to-red-600/20 border-rose-500/30 hover:border-rose-500",
  indigo: "from-indigo-600/20 to-purple-600/20 border-indigo-500/30 hover:border-indigo-500",
  cyan: "from-cyan-600/20 to-blue-600/20 border-cyan-500/30 hover:border-cyan-500",
};

export function CategoriesSection() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="py-20 bg-[#0f0f1e]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 mb-4">
            <span className="text-blue-400 text-xs font-semibold">LĨNH VỰC NỔI BẬT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Khám phá việc làm theo ngành
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Hàng ngàn cơ hội việc làm đang chờ đón bạn trong các lĩnh vực hot nhất
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURED_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  href={`/jobs?category=${encodeURIComponent(cat.label)}`}
                  className={`block p-6 rounded-2xl bg-gradient-to-br ${colorMap[cat.color]} backdrop-blur-sm border transition-all duration-300 group`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-white/10 to-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-white mb-1">{cat.label}</p>
                  <p className="text-white/40 text-[16px]">{cat.count} việc làm</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all group"
          >
            <span>Xem tất cả lĩnh vực</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
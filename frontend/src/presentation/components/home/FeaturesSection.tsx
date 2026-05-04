"use client";
import { motion } from "framer-motion";
import { useInView } from "./useInView";
import { FEATURES } from "./constants";

const colorMap: Record<string, string> = {
  blue: "from-blue-600/20 to-cyan-600/20 border-blue-500/30",
  purple: "from-purple-600/20 to-pink-600/20 border-purple-500/30",
  pink: "from-pink-600/20 to-rose-600/20 border-pink-500/30",
  emerald: "from-emerald-600/20 to-teal-600/20 border-emerald-500/30",
  orange: "from-orange-600/20 to-amber-600/20 border-orange-500/30",
  indigo: "from-indigo-600/20 to-purple-600/20 border-indigo-500/30",
};

const iconColorMap: Record<string, string> = {
  blue: "from-blue-600 to-cyan-600",
  purple: "from-purple-600 to-pink-600",
  pink: "from-pink-600 to-rose-600",
  emerald: "from-emerald-600 to-teal-600",
  orange: "from-orange-600 to-amber-600",
  indigo: "from-indigo-600 to-purple-600",
};

export function FeaturesSection() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/20 border border-emerald-500/30 mb-4">
            <span className="text-emerald-400 text-xs font-semibold">TÍNH NĂNG NỔI BẬT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trải nghiệm tuyển dụng thế hệ mới
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Công nghệ tiên tiến giúp kết nối nhà tuyển dụng và ứng viên hiệu quả nhất
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${colorMap[feature.color]} backdrop-blur-sm border transition-all duration-300 group`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${iconColorMap[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
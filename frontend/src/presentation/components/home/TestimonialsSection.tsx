"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useInView } from "./useInView";
import { TESTIMONIALS } from "./constants";

export function TestimonialsSection() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/20 border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-xs font-semibold">KHÁCH HÀNG NÓI GÌ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Niềm tin từ người dùng
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Hàng ngàn người dùng đã tin tưởng và thành công cùng Joblin
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5 group-hover:text-white/10 transition" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-4">
                "{item.quote}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {item.avatar}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{item.name}</h4>
                  <p className="text-white/40 text-sm">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
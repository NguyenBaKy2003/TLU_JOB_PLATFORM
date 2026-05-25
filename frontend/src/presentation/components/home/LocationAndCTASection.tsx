"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useInView } from "./useInView";

// ── Location data ─────────────────────────────────────────────────────────────
// Place images in: public/locations/hanoi.jpg, danang.jpg, hochiminh.jpg, bacninh.jpg
const LOCATIONS = [
  { name: "Hà Nội",          jobs: 140, img: "/locations/location1.png"     },
  { name: "Đà Nẵng",         jobs: 50,  img: "/locations/location2.png"    },
  { name: "TP. Hồ Chí Minh", jobs: 12,  img: "/locations/location3.png" },
  { name: "Bắc Ninh",        jobs: 4,   img: "/locations/location4.png"   },
];

// ── Location Card ─────────────────────────────────────────────────────────────
function LocationCard({ loc, index, inView }: { loc: typeof LOCATIONS[0]; index: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ aspectRatio: "4/3" }}
    >
      {/* City photo */}
      <img
        src={loc.img}
        alt={loc.name}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        draggable={false}
      />

      {/* Persistent dark gradient bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white font-bold text-base leading-tight drop-shadow">{loc.name}</p>
            <p className="text-white/80 text-[16px]">{loc.jobs} jobs</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/45 transition-colors">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Location Section ──────────────────────────────────────────────────────────
function LocationSection() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="py-14 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Địa điểm văn phòng
          </h2>
          <Link
            href="/locations"
            className="inline-flex items-center gap-2 text-gray-800 font-semibold text-[16px] hover:text-blue-600 transition-colors"
          >
            Xem tất cả địa điểm <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {LOCATIONS.map((loc, i) => (
            <LocationCard key={loc.name} loc={loc} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────────────────────────
function CTASection() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="relative py-20 sm:py-24 bg-blue-700 overflow-hidden">
      {/* Decorative sparkles */}
      <svg className="absolute right-16 top-1/2 -translate-y-1/2 w-24 h-24 text-white/30 pointer-events-none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 L53 45 L95 50 L53 55 L50 95 L47 55 L5 50 L47 45 Z" fill="currentColor"/>
        <path d="M80 15 L82 30 L97 32 L82 34 L80 49 L78 34 L63 32 L78 30 Z" fill="currentColor" opacity="0.6"/>
      </svg>
      {/* Decorative X cross left */}
      <svg className="absolute left-16 bottom-12 w-14 h-14 text-white/25 pointer-events-none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <line x1="4" y1="4" x2="36" y2="36" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        <line x1="36" y1="4" x2="4" y2="36" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      </svg>

      <div className="relative max-w-2xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight"
        >
          Khám phá bước tiến{" "}
          <span className="text-orange-400">sự nghiệp</span>{" "}
          tiếp theo
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-white/70 text-[16px] leading-relaxed mb-10 max-w-lg mx-auto"
        >
          Bạn đã sẵn sàng cho bước tiến tiếp theo trong sự nghiệp? JobLink sẽ giúp bạn
          khám phá những cơ hội hấp dẫn được thiết kế riêng cho năng lực và định hướng của riêng bạn.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            href="/auth/register"
            className="inline-block px-10 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-colors text-[16px] shadow-lg"
          >
            Đăng ký ngay
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export function LocationAndCTASection() {
  return (
    <>
      <LocationSection />
      <CTASection />
    </>
  );
}
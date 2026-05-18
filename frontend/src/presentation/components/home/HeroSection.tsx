"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Sparkles, ArrowRight, Zap, Briefcase, Star } from "lucide-react";
import { CITIES, POPULAR_SEARCHES } from "./constants";
import { FloatingElements } from "./FloatingElements";

const ROTATING_WORDS = [
  { text: "CHẤT LƯỢNG", gradient: "from-blue-400 to-cyan-400" },
  { text: "PHÙ HỢP", gradient: "from-purple-400 to-pink-400" },
  { text: "UY TÍN", gradient: "from-emerald-400 to-teal-400" },
  { text: "NHANH CHÓNG", gradient: "from-orange-400 to-amber-400" },
];

export function HeroSection() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e]">
      <FloatingElements />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-500" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-white/80 text-[16px] font-medium">Nền tảng tuyển dụng #1 Việt Nam</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Tìm Việc Làm{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`bg-gradient-to-r ${ROTATING_WORDS[wordIndex].gradient} bg-clip-text text-transparent inline-block`}
            >
              {ROTATING_WORDS[wordIndex].text}
            </motion.span>
          </AnimatePresence>
          <br />
          <span className="text-white/90">Cùng Joblin</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/50 text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Kết nối trực tiếp với nhà tuyển dụng qua livestream, 
          phỏng vấn realtime và tìm kiếm công việc phù hợp nhất với bạn.
        </motion.p>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
            <div className="relative flex flex-col sm:flex-row bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
              <div className="flex-1 flex items-center gap-3 px-5 py-4 border-b sm:border-b-0 sm:border-r border-white/10">
                <Search className="w-5 h-5 text-white/60" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Tên công việc, kỹ năng..."
                  className="flex-1 outline-none bg-transparent text-white placeholder:text-white/40"
                />
              </div>
              <div className="flex items-center gap-2 px-5 py-4 border-b sm:border-b-0 sm:border-r border-white/10">
                <MapPin className="w-5 h-5 text-white/60" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-white cursor-pointer"
                >
                  <option value="" className="bg-[#1a1a2e]">Địa điểm</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city} className="bg-[#1a1a2e]">{city}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Tìm kiếm</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Popular searches */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-8"
        >
          <span className="text-white/40 text-[16px]">Phổ biến:</span>
          {POPULAR_SEARCHES.map((tag, i) => (
            <button
              key={i}
              onClick={() => setKeyword(tag)}
              className="px-3 py-1.5 text-[16px] text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all duration-200"
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-[#1a1a2e] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">U{i}</span>
                </div>
              ))}
            </div>
            <span className="text-white/60 text-[16px]">+420,000 người dùng</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white/60 text-[16px] ml-2">4.9/5 từ 10,000+ đánh giá</span>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white/50 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
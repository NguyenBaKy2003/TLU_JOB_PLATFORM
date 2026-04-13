// src/app/(main)/home/_components/HeroSection.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter }           from "next/navigation";
import { Search, MapPin, Zap } from "lucide-react";
import { CITIES, POPULAR_SEARCHES } from "@/app/(main)/home/_constants";

const ROTATING_WORDS = [
  "Phù hợp nhất",
  "Đúng lĩnh vực",
  "Lương tốt nhất",
  "Gần nhà bạn",
];

export function HeroSection() {
  const router              = useRouter();
  const [keyword, setKeyword] = useState("");
  const [city,    setCity]    = useState("");
  const [wIdx,    setWIdx]    = useState(0);
  const [fading,  setFading]  = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setWIdx(i => (i + 1) % ROTATING_WORDS.length);
        setFading(false);
      }, 300);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (city)    params.set("city",    city);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center
      overflow-hidden bg-gradient-to-br from-white via-sky-50 to-blue-100 pt-16">

      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(14,165,233,.06) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(14,165,233,.06) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full
        bg-sky-300/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full
        bg-blue-400/20 blur-3xl pointer-events-none" />

      {/* Floating dots */}
      <div className="absolute top-1/4 right-[8%] w-4 h-4 rounded-full bg-amber-400/70
        animate-bounce [animation-duration:3s]" />
      <div className="absolute top-1/3 left-[6%] w-2.5 h-2.5 rounded-full bg-sky-400/60
        animate-bounce [animation-duration:4s] [animation-delay:.5s]" />
      <div className="absolute bottom-1/4 left-[12%] w-3 h-3 rounded-full bg-blue-300/50
        animate-bounce [animation-duration:3.5s] [animation-delay:1s]" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
          border border-amber-400/40 bg-amber-50 text-amber-600 text-xs font-semibold
          mb-8 animate-[fadeInDown_0.6s_ease] shadow-sm">
          <Zap size={12} className="fill-amber-500" />
          Nền tảng tuyển dụng thông minh #1 Việt Nam
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-800
          leading-[1.05] tracking-tight mb-4 animate-[fadeInUp_0.7s_ease_0.1s_both]">
          Khám phá việc làm<br />
          <span className={`text-amber-500 transition-opacity duration-300 ${
            fading ? "opacity-0" : "opacity-100"
          }`}>
            {ROTATING_WORDS[wIdx]}
          </span>
        </h1>

        <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10
          animate-[fadeInUp_0.7s_ease_0.2s_both]">
          Hơn 18,000 cơ hội từ những công ty hàng đầu đang chờ bạn.
          Tìm việc nhanh, nộp đơn thông minh.
        </p>

        {/* Search box */}
        <div className="flex flex-col sm:flex-row gap-0 max-w-2xl mx-auto
          bg-white border border-slate-200 rounded-2xl overflow-hidden
          shadow-xl shadow-blue-100/60 animate-[fadeInUp_0.7s_ease_0.3s_both]">

          {/* Keyword input */}
          <div className="flex items-center gap-3 flex-1 px-5 py-4
            border-b sm:border-b-0 sm:border-r border-slate-100">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Tên công việc, kỹ năng..."
              className="flex-1 bg-transparent text-slate-700 placeholder:text-slate-300
                text-sm focus:outline-none"
            />
          </div>

          {/* City select */}
          <div className="flex items-center gap-2 px-5 py-4 sm:w-44">
            <MapPin size={15} className="text-slate-400 shrink-0" />
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="bg-transparent text-slate-600 text-sm focus:outline-none
                cursor-pointer flex-1 appearance-none"
            >
              <option value="" className="bg-white">Địa điểm</option>
              {CITIES.map(c => (
                <option key={c} value={c} className="bg-white">{c}</option>
              ))}
            </select>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900
              font-bold text-sm transition-colors shrink-0 flex items-center
              justify-center gap-2"
          >
            <Search size={16} /> Tìm kiếm
          </button>
        </div>

        {/* Popular searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5
          animate-[fadeInUp_0.7s_ease_0.4s_both]">
          <span className="text-slate-400 text-xs">Phổ biến:</span>
          {POPULAR_SEARCHES.map(tag => (
            <button key={tag}
              onClick={() => { setKeyword(tag); handleSearch(); }}
              className="px-3 py-1.5 text-xs text-slate-500 border border-slate-200
                rounded-full hover:border-amber-400/60 hover:text-amber-600
                hover:bg-amber-50 transition-all bg-white">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col
        items-center gap-2 animate-bounce [animation-duration:2s]">
        <div className="w-5 h-8 border border-slate-300 rounded-full flex items-start
          justify-center p-1">
          <div className="w-1 h-2 bg-slate-400 rounded-full animate-[scrollDot_2s_ease_infinite]" />
        </div>
      </div>
    </section>
  );
}
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, PenTool, TrendingUp, Megaphone,
  DollarSign, Monitor, Code2, Briefcase, Users,
} from "lucide-react";
import { useInView } from "./useInView";

// ── Data ──────────────
const CATEGORIES = [
  { label: "Thiết kế",            count: 235,  icon: PenTool,    active: false },
  { label: "Kinh doanh",          count: 756,  icon: TrendingUp, active: false },
  { label: "Marketing",           count: 140,  icon: Megaphone,  active: false  },
  { label: "Tài chính",           count: 325,  icon: DollarSign, active: false },
  { label: "Công nghệ",           count: 436,  icon: Monitor,    active: false },
  { label: "Kỹ thuật",            count: 542,  icon: Code2,      active: false },
  { label: "Quản trị kinh doanh", count: 211,  icon: Briefcase,  active: false },
  { label: "Nhân sự",             count: 346,  icon: Users,      active: false },
];

const COMPANIES = [
  { name: "Apple",
    logo: (
      <svg viewBox="0 0 814 1000" className="h-6 w-auto fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.8 0 663 0 541.8c0-207.3 135.3-317 268.4-317 70.1 0 128.4 46.4 172.5 46.4 42.2 0 109.2-49.9 190.5-49.9 30.8 0 110.6 2.6 168.3 87.3zm-174.5-67.4c-8.3-38.5-31.2-100.3-82.9-140.8-35.9-27.9-75.3-45.3-118.4-45.3-6.4 0-12.8.6-19.1 1.9 50.5 37.5 93.1 104.3 93.1 197.5 0 10.9-.9 21.8-2.6 32.7 7 1.3 14.1 2 21.3 2 44.3 0 88.6-21.5 108.6-48z"/>
      </svg>
    )
  },
  { name: "AT&T",
    logo: (
      <svg viewBox="0 0 100 100" className="h-6 w-6 fill-white" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="4"/>
        <ellipse cx="50" cy="50" rx="22" ry="48" fill="none" stroke="white" strokeWidth="3"/>
        <ellipse cx="50" cy="50" rx="48" ry="18" fill="none" stroke="white" strokeWidth="3"/>
        <line x1="2" y1="50" x2="98" y2="50" stroke="white" strokeWidth="3"/>
        <line x1="50" y1="2" x2="50" y2="98" stroke="white" strokeWidth="3"/>
      </svg>
    )
  },
  { name: "Meta",
    logo: (
      <svg viewBox="0 0 60 36" className="h-5 w-auto fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 18C7.5 12 10.5 7 14 7C17 7 19.5 9.5 22 14L30 27C32.5 31 35 33 38 33C41.5 33 44 29 44 24C44 19.5 42 16 38 16C36.5 16 35 17 33.5 18.5L30 15C32.5 12 35.5 10 38.5 10C45 10 52 15.5 52 24C52 32 47 36 38 36C33 36 29 33 25.5 27.5L22.5 22.5C20.5 19 18.5 17 16 17C13.5 17 11.5 19.5 11.5 24C11.5 28 13 30.5 16 30.5C17.5 30.5 19 29.5 20.5 28L24 31.5C21.5 34 19 35.5 15.5 35.5C9 35.5 4 30 4 24C4 11 8 4 14 4C19.5 4 23 7.5 27 14L30 19L32 16C30 13 28 10 26 8" />
      </svg>
    )
  },
  { name: "McDonald's",
   
  },
  { name: "SONY",
   
  },
];

// ── List Companies ────
function ListCompanies() {
  return (
    <div className="relative bg-blue-700 pb-14">
      {/* Wave bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,20 C480,60 960,0 1440,28 L1440,56 L0,56 Z" fill="white" />
      </svg>

      <div className="max-w-6xl mx-auto px-6 pt-10 pb-4">
        <p className="text-center text-white/70 text-[15px] mb-8 tracking-wide">
          Được tin tưởng bởi những doanh nghiệp hàng đầu
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
          {COMPANIES.map(({ name, logo }) => (
            <div key={name} className="flex items-center gap-2.5">
              {logo}
              <span className="text-white text-xl sm:text-2xl font-bold tracking-tight">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Categories Section 
export function CategoriesSection() {
  const { ref, inView } = useInView();

  return (
    <>
      <ListCompanies />

      <section ref={ref} className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
            className="flex items-center justify-between mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Khám Phá Theo{" "}
              <span className="text-blue-600">Ngành Nghề</span>
            </h2>
            <Link
              href="/jobs"
              className="hidden sm:inline-flex items-center gap-1.5 text-blue-600 font-semibold text-[16px] hover:text-blue-700 transition-colors"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                >
                  <Link
                    href={`/jobs?category=${encodeURIComponent(cat.label)}`}
                    className={`
                      flex flex-col p-5 sm:p-6 rounded-2xl border transition-all duration-200 group h-full
                      ${cat.active
                        ? "bg-blue-700 border-blue-700 shadow-lg"
                        : "bg-gray-50 border-gray-200 hover:border-blue-200 hover:bg-white hover:shadow-md"
                      }
                    `}
                  >
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5
                      ${cat.active ? "bg-white/20" : "bg-white border border-gray-100 shadow-sm"}`}
                    >
                      <Icon className={`w-5 h-5 ${cat.active ? "text-white" : "text-blue-600"}`} />
                    </div>

                    {/* Label */}
                    <p className={`font-bold text-base mb-2 leading-snug
                      ${cat.active ? "text-white" : "text-gray-900"}`}
                    >
                      {cat.label}
                    </p>

                    {/* Count */}
                    <p className={`text-[16px] flex items-center gap-1
                      ${cat.active ? "text-white/80" : "text-gray-500"}`}
                    >
                      {cat.count} việc làm
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile link */}
          <div className="sm:hidden text-center mt-8">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-[16px]"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useInView } from "./useInView";

// ── Brand Logos ───────────────────────────────────────────────────────────────
function MitsubishiLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,5 62,27 50,49 38,27" fill="#E60012"/>
      <polygon points="22,49 34,27 50,49 38,71" fill="#E60012"/>
      <polygon points="78,49 66,27 50,49 62,71" fill="#E60012"/>
    </svg>
  );
}

function VodafoneLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#E60000"/>
      <path d="M35 32 Q50 22 65 32 Q78 55 65 72 Q50 82 38 72 Q28 58 35 32Z" fill="white"/>
      <circle cx="50" cy="50" r="12" fill="#E60000"/>
    </svg>
  );
}

function PepsiLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="white" stroke="#ccc" strokeWidth="1"/>
      <path d="M4 50 Q30 35 96 52 A46 46 0 0 1 4 50Z" fill="#E32636"/>
      <path d="M4 50 Q30 65 96 52 A46 46 0 0 0 4 50Z" fill="#004B93"/>
      <path d="M50 4 Q80 30 80 52 Q30 35 4 50 A46 46 0 0 1 50 4Z" fill="#E32636"/>
    </svg>
  );
}

function AppleLogoBlack() {
  return (
    <svg viewBox="0 0 814 1000" className="w-9 h-9 fill-gray-900" xmlns="http://www.w3.org/2000/svg">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.8 0 663 0 541.8c0-207.3 135.3-317 268.4-317 70.1 0 128.4 46.4 172.5 46.4 42.2 0 109.2-49.9 190.5-49.9 30.8 0 110.6 2.6 168.3 87.3zm-174.5-67.4c-8.3-38.5-31.2-100.3-82.9-140.8-35.9-27.9-75.3-45.3-118.4-45.3-6.4 0-12.8.6-19.1 1.9 50.5 37.5 93.1 104.3 93.1 197.5 0 10.9-.9 21.8-2.6 32.7 7 1.3 14.1 2 21.3 2 44.3 0 88.6-21.5 108.6-48z"/>
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <rect x="2"  y="2"  width="20" height="20" fill="#F25022"/>
      <rect x="26" y="2"  width="20" height="20" fill="#7FBA00"/>
      <rect x="2"  y="26" width="20" height="20" fill="#00A4EF"/>
      <rect x="26" y="26" width="20" height="20" fill="#FFB900"/>
    </svg>
  );
}

function ShellLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L55 20 L70 10 L60 25 L78 22 L65 33 L82 38 L66 42 L78 55 L60 52 L62 70 L50 60 L38 70 L40 52 L22 55 L34 42 L18 38 L35 33 L22 22 L40 25 L30 10 L45 20 Z" fill="#F60"/>
      <path d="M50 5 L55 20 L70 10 L60 25 L78 22 L65 33 L82 38 L66 42 L78 55 L60 52 L62 70 L50 60 Z" fill="#DD1D21"/>
    </svg>
  );
}

function LGLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="none" stroke="#A50034" strokeWidth="5"/>
      <text x="18" y="62" fontFamily="Arial" fontWeight="bold" fontSize="42" fill="#A50034">LG</text>
    </svg>
  );
}

function MetaLogo() {
  return (
    <svg viewBox="0 0 60 36" className="w-12 h-8" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="metaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#0081FB"/>
          <stop offset="100%" stopColor="#00C5E7"/>
        </linearGradient>
      </defs>
      <path fill="url(#metaGrad)" d="M6 18C6 11.4 9.4 6 14 6c2.8 0 5.2 1.8 7.5 5.5L24 15l2.5-3.5C29 8 32 6 35 6c5.5 0 9 5.4 9 12s-3 12-9 12c-3 0-5.5-1.5-8-5.5L24 21l-3 3.5C18.5 28.5 16 30 13 30 7.5 30 6 24.6 6 18zm7 0c0 4 1.2 6.5 3.5 6.5 1.5 0 3-1 4.5-3.5L18 18l-1-3C15.5 12.5 14 11.5 12.5 11.5 10.2 11.5 13 14 13 18zm20 0c0-4-1.5-6.5-3.5-6.5-1.5 0-3 1-4.5 3.5L30 18l1 3c1.5 2.5 3 3.5 4.5 3.5C38 24.5 33 22 33 18z"/>
    </svg>
  );
}

// ── Company Data ──────────────────────────────────────────────────────────────
const COMPANIES = [
  { name: "Mitsubishi", jobs: 64,  logo: <MitsubishiLogo /> },
  { name: "Vodafone",   jobs: 50,  logo: <VodafoneLogo />   },
  { name: "Pepsi",      jobs: 50,  logo: <PepsiLogo />      },
  { name: "Apple",      jobs: 30,  logo: <AppleLogoBlack /> },
  { name: "Microsoft",  jobs: 56,  logo: <MicrosoftLogo />  },
  { name: "Shell",      jobs: 53,  logo: <ShellLogo />      },
  { name: "LG",         jobs: 42,  logo: <LGLogo />         },
  { name: "Meta",       jobs: 102, logo: <MetaLogo />       },
];

function CompanyCard({ company, index, inView }: { company: typeof COMPANIES[0]; index: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all relative group"
    >
      {/* Logo + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white shrink-0 p-1">
          {company.logo}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-base">{company.name}</p>
          <p className="text-gray-400 text-xs">{company.jobs} Jobs Available</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-xs leading-relaxed mb-4">
        Search and find your dream job is now easier than ever Just browse a job and apply if you need to
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">Full Time</span>
        <span className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">Remote</span>
        <Link
          href={`/companies/${company.name.toLowerCase()}`}
          className="ml-auto text-gray-400 hover:text-blue-600 transition-colors"
        >
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
}

export function ChooseCompaniesSection() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-[#dce9f5] relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute top-16 right-0 w-72 h-72 rounded-full bg-blue-200/40 translate-x-1/2 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10"
        >
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
              Chọn <span className="text-red-500">Công Ty</span> Mơ Ước Của Bạn
            </h2>
            <p className="text-gray-500 text-[16px] leading-relaxed">
              Bắt đầu hành trình sự nghiệp thăng hoa bằng cách khám phá những<br className="hidden sm:block" />
              doanh nghiệp hàng đầu đang săn đón những tài năng như bạn
            </p>
          </div>
          <Link
            href="/companies"
            className="shrink-0 self-start sm:self-center inline-flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-[16px] shadow-lg shadow-orange-200 whitespace-nowrap"
          >
            Xem tất cả công ty
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPANIES.map((company, i) => (
            <CompanyCard key={company.name} company={company} index={i} inView={inView} />
          ))}
        </div>

      </div>
    </section>
  );
}
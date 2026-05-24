"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Briefcase, DollarSign, Clock, Bookmark, Sparkles } from "lucide-react";
import { useInView } from "./useInView";

// ── Brand Logos (SVG inline) ──────────────────────────────────────────────────
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6.1C12.3 13 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.9 6.8-16.7z"/>
      <path fill="#FBBC05" d="M10.4 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.8-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6.1z"/>
      <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.6 2.2-7.9 2.2-6.3 0-11.7-3.5-13.6-8.4l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/>
    </svg>
  );
}

function YoutubeLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#FF0000"/>
      <polygon points="20,15 20,33 34,24" fill="white"/>
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 814 1000" className="w-full h-full fill-gray-900" xmlns="http://www.w3.org/2000/svg">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.8 0 663 0 541.8c0-207.3 135.3-317 268.4-317 70.1 0 128.4 46.4 172.5 46.4 42.2 0 109.2-49.9 190.5-49.9 30.8 0 110.6 2.6 168.3 87.3zm-174.5-67.4c-8.3-38.5-31.2-100.3-82.9-140.8-35.9-27.9-75.3-45.3-118.4-45.3-6.4 0-12.8.6-19.1 1.9 50.5 37.5 93.1 104.3 93.1 197.5 0 10.9-.9 21.8-2.6 32.7 7 1.3 14.1 2 21.3 2 44.3 0 88.6-21.5 108.6-48z"/>
    </svg>
  );
}

function WeChatLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#2DC100"/>
      <ellipse cx="18" cy="21" rx="10" ry="7.5" fill="white"/>
      <circle cx="14.5" cy="21" r="1.5" fill="#2DC100"/>
      <circle cx="19.5" cy="21" r="1.5" fill="#2DC100"/>
      <ellipse cx="32" cy="26" rx="8" ry="6" fill="white" opacity="0.9"/>
      <circle cx="29" cy="26" r="1.2" fill="#2DC100"/>
      <circle cx="33.5" cy="26" r="1.2" fill="#2DC100"/>
    </svg>
  );
}

function ATTLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="none" stroke="#00A8E0" strokeWidth="3"/>
      <ellipse cx="24" cy="24" rx="10" ry="22" fill="none" stroke="#00A8E0" strokeWidth="2.5"/>
      <ellipse cx="24" cy="24" rx="22" ry="8" fill="none" stroke="#00A8E0" strokeWidth="2.5"/>
    </svg>
  );
}

function TiktokLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="black"/>
      <path d="M33 10c0 4.4 3.6 8 8 8v5c-2.8 0-5.4-.9-7.5-2.5V30a11 11 0 1 1-11-11v5.5a5.5 5.5 0 1 0 5.5 5.5V10H33z" fill="white"/>
      <path d="M35.5 15.5c1.4 1 3.1 1.7 5 1.9" stroke="#69C9D0" strokeWidth="2" fill="none"/>
    </svg>
  );
}

// ── Job Data ──────────────────────────────────────────────────────────────────
const JOBS = [
  { title: "Senior UI/UX",  company: "Google Chrome",  logo: <GoogleLogo />,  location: "Peru",       type: "Full-Time", salary: "Negotiable", time: "2 days ago"      },
  { title: "Data Analyst",  company: "Youtube",         logo: <YoutubeLogo />, location: "Manchester", type: "Full-Time", salary: "Negotiable", time: "30 minutes ago"  },
  { title: "iOS Developer", company: "Apple",           logo: <AppleLogo />,   location: "Singapore",  type: "Full-Time", salary: "Negotiable", time: "30 minutes ago"  },
  { title: "Junior UI/UX",  company: "WeChat",          logo: <WeChatLogo />,  location: "Madrid",     type: "Full-Time", salary: "Negotiable", time: "4 days ago"      },
  { title: "Web Developer", company: "AT&T",            logo: <ATTLogo />,     location: "Napoli",     type: "Full-Time", salary: "Negotiable", time: "50 Minutes Ago"  },
  { title: "Data Engineer", company: "Tiktok",          logo: <TiktokLogo />,  location: "Milan",      type: "Full-Time", salary: "Negotiable", time: "50 Minutes Ago"  },
];

function JobCard({ job, index, inView }: { job: typeof JOBS[0]; index: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="bg-[#e8f0fb] rounded-2xl p-5 relative group cursor-pointer border border-transparent hover:border-blue-200 hover:shadow-md transition-all"
    >
      {/* Bookmark */}
      <button className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors">
        <Bookmark size={16} />
      </button>

      {/* Company */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm shrink-0">
          {job.logo}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{job.title}</p>
          <p className="text-gray-500 text-xs">{job.company}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <MapPin size={12} className="text-blue-500 shrink-0" />
          {job.location}
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Briefcase size={12} className="text-blue-500 shrink-0" />
          {job.type}
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <DollarSign size={12} className="text-blue-500 shrink-0" />
          {job.salary}
        </div>
      </div>

      {/* Footer badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2.5 py-1 text-xs text-gray-600 bg-white rounded-full border border-gray-200">Remote</span>
        <span className="px-2.5 py-1 text-xs font-semibold text-gray-800 bg-white rounded-full border border-gray-200">Priority slots available</span>
        <span className="ml-auto flex items-center gap-1 text-xs text-gray-500 shrink-0">
          <Clock size={11} className="text-gray-800" />
          {job.time}
        </span>
      </div>
    </motion.div>
  );
}

export function FindJobsSection() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-white relative overflow-hidden">
      {/* Decorative blob bottom-right */}
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-100/60 translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-16 right-32 w-40 h-40 rounded-full bg-blue-100/40 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 text-gray-900" />
            Việc Làm <span className="text-red-500 mx-1">Nổi Bật</span> Mới Nhất
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg mx-auto">
            Tìm kiếm công việc mơ ước giờ đây dễ dàng hơn bao giờ hết.<br />
            Chỉ cần lướt xem và ứng tuyển ngay vào vị trí bạn yêu thích
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {JOBS.map((job, i) => (
            <JobCard key={i} job={job} index={i} inView={inView} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/jobs"
            className="inline-block px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-orange-200"
          >
            Khám phá thêm
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
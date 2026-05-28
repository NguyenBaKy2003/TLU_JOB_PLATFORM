"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "./useInView";
import {
  LayoutDashboard, MessageSquare, Building2, Users,
  List, CalendarDays, Settings, HelpCircle, Bell,
  Plus, ChevronDown, ChevronRight,
} from "lucide-react";

// ── Mini Dashboard Mock ───────────────────────────────────────────────────────
function MiniDashboard() {
  // Bar chart data: [jobView, jobApplied]
  const bars = [
    { day: "Mon", view: 55, applied: 30 },
    { day: "Tue", view: 80, applied: 45 },
    { day: "Wed", view: 65, applied: 38 },
    { day: "Thu", view: 90, applied: 50 },
    { day: "Fri", view: 45, applied: 25 },
    { day: "Sat", view: 35, applied: 20 },
    { day: "Sun", view: 50, applied: 28 },
  ];
  const maxH = 80;
  const max = 90;

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full"
         style={{ fontSize: 10 }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[11px]">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-[7px] font-black">JH</span>
          </div>
          CareerUp
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-gray-500 text-[10px]">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[6px] font-bold">N</span>
            </div>
            <span className="font-medium text-gray-700">Nomad</span>
            <ChevronDown size={9} className="text-gray-400" />
          </div>
          <Bell size={12} className="text-gray-400" />
          <button className="flex items-center gap-1 bg-blue-600 text-white text-[9px] font-semibold px-2 py-1 rounded-md">
            <Plus size={9} /> Post a job
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-28 shrink-0 border-r border-gray-100 py-3 px-2">
          {[
            { icon: LayoutDashboard, label: "Dashboard",       active: true  },
            { icon: MessageSquare,   label: "Messages",        badge: 1      },
            { icon: Building2,       label: "Company Profile"               },
            { icon: Users,           label: "All Applicants"                },
            { icon: List,            label: "Job Listing"                   },
            { icon: CalendarDays,    label: "My Schedule"                   },
          ].map(({ icon: Icon, label, active, badge }) => (
            <div key={label}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg mb-0.5 cursor-pointer
                ${active ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <Icon size={10} />
              <span className={`text-[9px] font-medium truncate flex-1 ${active ? "text-blue-600" : ""}`}>{label}</span>
              {badge && (
                <span className="w-3.5 h-3.5 bg-blue-600 rounded-full text-white text-[7px] flex items-center justify-center">{badge}</span>
              )}
            </div>
          ))}
          <p className="text-[8px] text-gray-300 px-2 mt-2 mb-1 uppercase tracking-wide">Settings</p>
          {[
            { icon: Settings,   label: "Settings"    },
            { icon: HelpCircle, label: "Help Center" },
          ].map(({ icon: Icon, label }) => (
            <div key={label}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-400 hover:bg-gray-50 cursor-pointer"
            >
              <Icon size={10} />
              <span className="text-[9px] font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 p-3 bg-gray-50/50 min-w-0">
          {/* Greeting */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11px] font-bold text-gray-800">Good morning, Maria</p>
              <p className="text-[8px] text-gray-400">Here is your job listings statistic report from July 19 - July 25</p>
            </div>
            <p className="text-[8px] text-gray-400 shrink-0">Jul 19 - Jul 25</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {[
              { value: "76", label: "New candidates to review", color: "bg-violet-500" },
              { value: "3",  label: "Schedule for today",       color: "bg-blue-500"   },
              { value: "24", label: "Messages received",        color: "bg-sky-400"    },
            ].map(({ value, label, color }) => (
              <div key={label} className={`${color} rounded-lg p-2 flex items-center justify-between`}>
                <div>
                  <p className="text-white font-black text-base leading-none">{value}</p>
                  <p className="text-white/80 text-[8px] leading-tight mt-0.5">{label}</p>
                </div>
                <ChevronRight size={10} className="text-white/60" />
              </div>
            ))}
          </div>

          {/* Bottom: chart + stats */}
          <div className="grid grid-cols-5 gap-2">
            {/* Chart */}
            <div className="col-span-3 bg-white rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[9px] font-bold text-gray-700">Job statistics</p>
                  <p className="text-[7px] text-gray-400">Showing Job statistic Jul 19-25</p>
                </div>
                <div className="flex gap-0.5">
                  {["Week","Month","Year"].map((t, i) => (
                    <button key={t}
                      className={`text-[7px] px-1.5 py-0.5 rounded ${i===0 ? "bg-blue-600 text-white" : "text-gray-400"}`}
                    >{t}</button>
                  ))}
                </div>
              </div>
              {/* Tabs */}
              <div className="flex gap-2 mb-2 border-b border-gray-100 pb-1">
                {["Overview","Jobs View","Jobs Applied"].map((t, i) => (
                  <span key={t}
                    className={`text-[7px] pb-0.5 cursor-pointer ${i===0 ? "text-blue-600 border-b border-blue-600 font-semibold" : "text-gray-400"}`}
                  >{t}</span>
                ))}
              </div>
              {/* Bars */}
              <div className="flex items-end justify-between gap-1" style={{ height: maxH }}>
                {bars.map(({ day, view, applied }) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="flex items-end gap-px w-full justify-center" style={{ height: maxH - 12 }}>
                      <div className="w-2.5 rounded-sm bg-amber-400"
                           style={{ height: (view / max) * (maxH - 12) }} />
                      <div className="w-2.5 rounded-sm bg-violet-500"
                           style={{ height: (applied / max) * (maxH - 12) }} />
                    </div>
                    <span className="text-[7px] text-gray-400">{day}</span>
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex gap-3 mt-1.5">
                {[["bg-amber-400","Job View"],["bg-violet-500","Job Applied"]].map(([c,l]) => (
                  <div key={l} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-sm ${c}`} />
                    <span className="text-[7px] text-gray-400">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right stats */}
            <div className="col-span-2 flex flex-col gap-2">
              {/* Job Open */}
              <div className="bg-white rounded-lg p-2">
                <p className="text-[8px] text-gray-500 mb-0.5">Job Open</p>
                <p className="text-base font-black text-gray-800 leading-none">
                  12 <span className="text-[8px] font-normal text-gray-400">Jobs Opened</span>
                </p>
              </div>
              {/* Applicants Summary */}
              <div className="bg-white rounded-lg p-2">
                <p className="text-[8px] text-gray-500 mb-0.5">Applicants Summary</p>
                <p className="text-base font-black text-gray-800 leading-none mb-1.5">
                  67 <span className="text-[8px] font-normal text-gray-400">Applicants</span>
                </p>
                {/* Progress bar */}
                <div className="flex rounded-full overflow-hidden h-1.5 mb-1.5">
                  <div className="bg-blue-600"  style={{ width: "35%" }} />
                  <div className="bg-green-400" style={{ width: "25%" }} />
                  <div className="bg-sky-400"   style={{ width: "20%" }} />
                  <div className="bg-orange-400"style={{ width: "20%" }} />
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  {[
                    ["bg-blue-600","Full Time","45"],
                    ["bg-green-400","Internship","32"],
                    ["bg-sky-400","Part-Time","24"],
                    ["bg-orange-400","Contract","30"],
                    ["bg-cyan-400","Remote","22"],
                  ].map(([c,l,n]) => (
                    <div key={l} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${c}`} />
                      <span className="text-[7px] text-gray-500">{l} {n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Recruiter Banner ──────────────────────────────────────────────────────────
export function RecruiterBanner() {
  const { ref, inView } = useInView();

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-[#DFEAFE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative bg-blue-700 rounded-3xl overflow-hidden flex flex-col lg:flex-row items-center"
          style={{ minHeight: 320 }}
        >
          {/* Decorative corner fold top-left */}
          <div className="absolute top-0 left-0 w-16 h-16 bg-blue-900/30"
               style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />

          {/* Left text */}
          <div className="relative z-10 flex-1 px-8 sm:px-12 py-10 lg:py-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
              Bắt đầu đăng<br />
              tin tuyển dụng<br />
              ngay hôm nay
            </h2>
            <p className="text-white/70 text-[16px] mb-8">
              Đăng tin chỉ với $10.
            </p>
            <Link
              href="/auth/employer/register"
              className="inline-block px-7 py-3 bg-white text-blue-700 font-bold text-[16px] rounded-xl hover:bg-blue-50 transition-colors"
            >
              Đăng ký miễn phí
            </Link>
          </div>

          {/* Right: dashboard mockup */}
          <div className="relative z-10 w-full lg:w-[58%] px-4 pb-6 lg:pb-0 lg:pr-6 lg:pt-6 lg:-mb-2">
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:-mr-2"
            >
              <MiniDashboard />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
// src/app/(main)/home/_components/StatsSection.tsx
"use client";
import { Briefcase, Building2, Users, Zap } from "lucide-react";
import { STATS } from "@/app/(main)/home/_constants";
import { useInView } from "./useInView";

const ICONS: Record<string, React.ReactNode> = {
  briefcase: <Briefcase size={20} />,
  building:  <Building2 size={20} />,
  users:     <Users size={20} />,
  zap:       <Zap size={20} />,
};

export function StatsSection() {
  const { ref, visible } = useInView();

  return (
    <section ref={ref} className="bg-white border-t border-slate-100 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <div key={i}
              className={`text-center transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="inline-flex items-center justify-center w-12 h-12
                rounded-2xl bg-blue-100 text-blue-600 mb-3 mx-auto shadow-sm">
                {ICONS[s.iconKey]}
              </div>
              <p className="text-3xl font-black text-slate-800 mb-1">{s.value}</p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
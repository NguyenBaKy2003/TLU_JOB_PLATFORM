// src/presentation/components/companies/CompanyCard.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Briefcase, Star, Users,
  Building2, Heart, TrendingUp, BadgeCheck,
} from "lucide-react";
import { useState } from "react";
import type { CompanyProfile, CompanyPlanCode } from "@/domain/models/Company";
import { isPaidPlan } from "@/domain/models/Company";
import { PlanBadge } from "./PlanBadge";

// ── CompanyAvatar ─────────────────────────────────────────────────────────────

const LOGO_COLORS = [
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-violet-500 to-violet-700",
  "from-orange-500 to-orange-600",
  "from-rose-500 to-rose-700",
  "from-teal-500 to-teal-700",
];

function CompanyAvatar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const [imgError, setImgError] = useState(false);
  const color = LOGO_COLORS[(name?.charCodeAt(0) ?? 0) % LOGO_COLORS.length];

  if (logoUrl && !imgError) {
    return (
      <img src={logoUrl} alt={name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)} />
    );
  }
  return (
    <div className={`w-full h-full bg-gradient-to-br ${color}
      flex items-center justify-center text-white font-bold text-xl`}>
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── StarRating ────────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={11}
          className={i < Math.round(value)
            ? "text-amber-400 fill-amber-400"
            : "text-gray-200 fill-gray-200"} />
      ))}
    </div>
  );
}

// ── Props — nhận CompanyProfile trực tiếp ─────────────────────────────────────

interface Props {
  company: CompanyProfile;
  index?:  number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CompanyCard({ company, index = 0 }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved,   setIsSaved]   = useState(false);

  const hasPlan = isPaidPlan(company.planCode);
  const rating  = company.averageRating  ?? 0;
  const jobs    = company.activeJobCount ?? 0;

  const formatJobs = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/companies/${company.id}`} className="block group">
        <div className={`relative bg-white rounded-2xl transition-all duration-300 overflow-hidden
          ${hasPlan
            ? "border-[1.5px] border-violet-300 shadow-md shadow-violet-100/40"
            : isHovered
              ? "border border-blue-200 shadow-lg shadow-blue-100/50"
              : "border border-gray-100 shadow-sm"
          }`}>

          {/* Plan tint */}
          {hasPlan && <div className="absolute inset-0 bg-violet-50/20 pointer-events-none" />}
          {/* Plan stripe */}
          {hasPlan && <div className="absolute top-0 left-0 right-0 h-0.5 bg-violet-400" />}



          <div className="p-4 sm:p-5">
            {/* Plan badge */}
            {hasPlan && (
              <div className="mb-3">
                <PlanBadge planCode={company.planCode as CompanyPlanCode} size="sm" />
              </div>
            )}

            {/* Header */}
            <div className="flex gap-3 pr-8">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0
                shadow-sm transition-shadow ${isHovered ? "shadow-md" : ""}
                ${hasPlan ? "ring-2 ring-violet-200 ring-offset-1" : ""}`}>
                <CompanyAvatar name={company.name} logoUrl={company.logoUrl} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className={`text-base font-bold transition-colors line-clamp-1
                    ${hasPlan
                      ? "text-violet-900 group-hover:text-violet-700"
                      : "text-gray-900 group-hover:text-blue-600"
                    }`}>
                    {company.name}
                  </h3>
                  {company.verificationStatus === "VERIFIED" && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5
                      bg-blue-50 rounded-full border border-blue-100 shrink-0">
                      <BadgeCheck className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] font-semibold text-blue-600 hidden xs:inline">Đã xác thực</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {company.industry && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[100px]">{company.industry}</span>
                    </span>
                  )}
                  {company.sizeLabel && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3 shrink-0" />
                        {company.sizeLabel}
                      </span>
                    </>
                  )}
                </div>

                {company.city && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                    <span className="truncate">{company.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <StarRating value={rating} />
                <span className="text-xs text-gray-400">
                  {rating.toFixed(1)} ({company.reviewCount ?? 0} đánh giá)
                </span>
              </div>
            )}

            {/* Description */}
            {company.description && (
              <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                {company.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                  ${hasPlan ? "bg-violet-50" : "bg-blue-50"}`}>
                  <Briefcase className={`w-3.5 h-3.5 ${hasPlan ? "text-violet-600" : "text-blue-600"}`} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{formatJobs(jobs)}</div>
                  <div className="text-[10px] text-gray-500">Việc làm</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {rating > 0 ? rating.toFixed(1) : "—"}
                  </div>
                  <div className="text-[10px] text-gray-500">Đánh giá</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {company.foundedYear ?? "—"}
                  </div>
                  <div className="text-[10px] text-gray-500">Thành lập</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 rounded-b-2xl
              ${hasPlan ? "bg-violet-400" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`}
            initial={{ width: hasPlan ? "100%" : "0%" }}
            animate={{ width: hasPlan ? "100%" : isHovered ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
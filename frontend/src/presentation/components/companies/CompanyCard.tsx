"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight, MapPin, Briefcase, Star,
  Users, Building2, Heart, TrendingUp, BadgeCheck,
} from "lucide-react";
import { CompanyAvatar } from "./CompanyAvatar";
import { StarRating } from "./StarRating";
import type { Company } from "./types";
import { useState } from "react";

interface CompanyCardProps {
  company: Company;
  index?: number;
}

export function CompanyCard({ company, index = 0 }: CompanyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved]     = useState(false);

  const formatJobCount = (count: number) =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();

  const getTagColor = (tag: string) => {
    if (tag.includes("Đang tuyển") || tag.includes("Tuyển dụng"))
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (tag.includes("Top") || tag.includes("Best"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Link href={`/companies/${company.id}`} className="block group">
        <div className={`relative bg-white rounded-2xl transition-all duration-300 border
          ${isHovered
            ? "border-blue-200 shadow-lg shadow-blue-100/50"
            : "border-gray-100 shadow-sm"}`}
        >
          {/* Save button */}
          <button
            onClick={e => { e.preventDefault(); setIsSaved(s => !s); }}
            className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm
              rounded-full shadow-sm hover:shadow-md transition-all duration-200 group/save"
          >
            <Heart className={`w-4 h-4 transition-all duration-200 ${
              isSaved
                ? "fill-red-500 text-red-500 scale-110"
                : "text-gray-400 group-hover/save:text-red-500"
            }`} />
          </button>

          <div className="p-4 sm:p-5">

            {/* ── Header: logo + name block ────────────────────────── */}
            <div className="flex gap-3 pr-8">
              {/* Logo */}
              <div className="relative flex-shrink-0">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden
                  bg-gradient-to-br transition-all duration-300 shadow-sm
                  ${isHovered ? "from-blue-50 to-indigo-50" : "from-gray-50 to-gray-100"}`}>
                  <CompanyAvatar name={company.name} logoUrl={company.logoUrl} size={64} />
                </div>
                {company.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5
                    bg-emerald-500 rounded-full border-2 border-white">
                    <div className="absolute inset-0 rounded-full animate-ping
                      bg-emerald-500 opacity-75" />
                  </div>
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                {/* Name + verified */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-base font-bold text-gray-900
                    group-hover:text-blue-600 transition-colors line-clamp-1">
                    {company.name}
                  </h3>
                  {company.isVerified && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5
                      bg-blue-50 rounded-full border border-blue-100 flex-shrink-0">
                      <BadgeCheck className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] font-semibold text-blue-600 hidden xs:inline">
                        Đã xác thực
                      </span>
                    </span>
                  )}
                </div>

                {/* Industry + size */}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[100px]">
                      {company.industry || "Công nghệ"}
                    </span>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="w-3 h-3 shrink-0" />
                    {company.size || "50-200"}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                  <span className="truncate">{company.location}</span>
                </div>
              </div>
            </div>

            {/* ── Rating row ───────────────────────────────────────── */}
            <div className="flex items-center gap-2 mt-3">
              <StarRating value={company.rating} size="sm" />
              <span className="text-xs text-gray-400">
                ({company.reviewCount} đánh giá)
              </span>
            </div>

            {/* ── Description — visible on all sizes, 2 lines ──────── */}
            <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
              {company.description ||
                "Chúng tôi là công ty hàng đầu trong lĩnh vực công nghệ, chuyên cung cấp các giải pháp phần mềm và dịch vụ IT chất lượng cao."}
            </p>

            {/* ── Tags ─────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(company.tags || ["Đang tuyển dụng"]).slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full border
                    ${getTagColor(tag)}`}
                >
                  {tag.length > 16 ? `${tag.slice(0, 16)}…` : tag}
                </span>
              ))}
              {(company.tags?.length || 0) > 3 && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full
                  bg-gray-50 text-gray-500 border border-gray-200">
                  +{(company.tags?.length || 0) - 3}
                </span>
              )}
            </div>

            {/* ── Stats ────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100">

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center
                  justify-center flex-shrink-0">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 leading-tight">
                    {formatJobCount(company.jobCount)}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-tight">Việc làm</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center
                  justify-center flex-shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 leading-tight">
                    {company.rating > 0 ? company.rating.toFixed(1) : "—"}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-tight">Đánh giá</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center
                  justify-center flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 leading-tight">
                    {company.foundedYear ?? "—"}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-tight">Thành lập</div>
                </div>
              </div>

            </div>
          </div>

          {/* Hover progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r
              from-blue-500 to-indigo-500 rounded-b-2xl"
            initial={{ width: "0%" }}
            animate={{ width: isHovered ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
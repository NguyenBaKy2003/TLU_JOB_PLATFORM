"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight, MapPin, Briefcase, Star,
  Users, Building2, Heart, TrendingUp,
  BadgeCheck,
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

  const formatJobCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getTagColor = (tag: string) => {
    if (tag.includes("Đang tuyển") || tag.includes("Tuyển dụng"))
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (tag.includes("Top") || tag.includes("Best"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (tag.includes("IT") || tag.includes("Tech") || tag.includes("Đã xác thực"))
      return "bg-blue-50 text-blue-700 border-blue-200";
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
        <div
          className={`
            relative bg-white rounded-xl sm:rounded-2xl transition-all duration-300
            border ${isHovered
              ? "border-blue-200 shadow-lg shadow-blue-100/50"
              : "border-gray-100 shadow-sm"}
            hover:shadow-xl hover:shadow-blue-100/30
          `}
        >
          {/* Save Button */}
          <button
            onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved); }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2
              bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md
              transition-all duration-200 group/save"
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-200 ${
                isSaved
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-gray-400 group-hover/save:text-red-500"
              }`}
            />
          </button>

          <div className="p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:gap-4">

              {/* Logo */}
              <div className="flex justify-center sm:block mb-3 sm:mb-0">
                <div className="relative flex-shrink-0">
                  <div
                    className={`
                      w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br
                      ${isHovered ? "from-blue-50 to-indigo-50" : "from-gray-50 to-gray-100"}
                      transition-all duration-300 shadow-sm
                    `}
                  >
                    <CompanyAvatar
                      name={company.name}
                      logoUrl={company.logoUrl}
                      size={64}
                    />
                  </div>

                  {/* Online indicator */}
                  {company.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4
                      bg-emerald-500 rounded-full border-2 border-white">
                      <div className="absolute inset-0 rounded-full animate-ping
                        bg-emerald-500 opacity-75" />
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0 pr-0 sm:pr-2">

                {/* ── Row 1: name + verified badge ── */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  {/* Left: name + industry + size */}
                  <div className="min-w-0 text-center sm:text-left">
                    {/* name + verified inline */}
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900
                        group-hover:text-blue-600 transition-colors line-clamp-1">
                        {company.name}
                      </h3>
                      {company.isVerified && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5
                          bg-blue-50 rounded-full border border-blue-100 flex-shrink-0">
                          <BadgeCheck className="w-3 h-3 text-blue-600" />
                          <span className="text-[10px] font-semibold text-blue-600
                            hidden sm:inline">
                            Đã xác thực
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start
                      gap-2 mt-0.5">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Building2 className="w-3 h-3" />
                        <span>{company.industry || "Công nghệ"}</span>
                      </div>
                      <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{company.size || "50-200"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: star rating — has its own space, no overlap */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-0.5
                    pr-8 sm:pr-10">
                    <StarRating value={company.rating} size="sm" />
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      ({company.reviewCount} đánh giá)
                    </span>
                  </div>
                </div>

                {/* ── Row 2: location ── */}
                <div className="flex items-center justify-center sm:justify-start gap-1.5
                  mb-3 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{company.location}</span>
                </div>

                {/* ── Row 3: description (desktop only) ── */}
                <p className="hidden sm:block text-sm text-gray-600 line-clamp-2
                  mb-3 leading-relaxed">
                  {company.description ||
                    "Chúng tôi là công ty hàng đầu trong lĩnh vực công nghệ, chuyên cung cấp các giải pháp phần mềm và dịch vụ IT chất lượng cao."}
                </p>

                {/* ── Row 4: tags ── */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4
                  justify-center sm:justify-start">
                  {(company.tags || ["Đang tuyển dụng"]).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px]
                        font-medium rounded-full border transition-all duration-200
                        ${getTagColor(tag)}`}
                    >
                      {tag.length > 14 ? `${tag.slice(0, 14)}...` : tag}
                    </span>
                  ))}
                  {(company.tags?.length || 0) > 2 && (
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px]
                      font-medium rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                      +{(company.tags?.length || 0) - 2}
                    </span>
                  )}
                </div>

                {/* ── Row 5: stats ── */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">

                  {/* Việc làm */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50
                      flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">
                        {formatJobCount(company.jobCount)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500">Việc làm</div>
                    </div>
                  </div>

                  {/* Đánh giá */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50
                      flex items-center justify-center flex-shrink-0">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">
                        {company.rating > 0 ? company.rating.toFixed(1) : "—"}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500">Đánh giá</div>
                    </div>
                  </div>

                  {/* Năm thành lập */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50
                      flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">
                        {company.foundedYear ?? "—"}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500">Thành lập</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Arrow (desktop) */}
              <div className="hidden sm:flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center
                    transition-all duration-300 group-hover:bg-blue-500
                    ${isHovered ? "translate-x-1" : ""}
                  `}
                >
                  <ChevronRight
                    className={`w-4 h-4 transition-all duration-300
                      ${isHovered ? "text-white translate-x-0.5" : "text-gray-400"}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar on hover */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 sm:h-1
              bg-gradient-to-r from-blue-500 to-indigo-500
              rounded-b-xl sm:rounded-b-2xl"
            initial={{ width: "0%" }}
            animate={{ width: isHovered ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
// src/presentation/components/companies/CompanyCard.tsx
"use client";
import Link               from "next/link";
import { ChevronRight, MapPin, Briefcase, Star, DollarSign } from "lucide-react";
import { CompanyAvatar }  from "./CompanyAvatar";
import { StarRating }     from "./StarRating";
import type { Company }   from "./types";

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      href={`/companies/${company.id}`}
      className="flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-2xl
        hover:border-blue-200 hover:shadow-md transition-all group"
    >
      <CompanyAvatar   name={company.name}
      logoUrl={company.logoUrl} size={56} />

      <div className="flex-1 min-w-0">
        {/* Row 1: name + rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {company.name}
          </h3>
          <StarRating value={company.rating} />
        </div>

        {/* Row 2: location + tags */}
        <div className="flex items-center flex-wrap gap-2 mb-2">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} /> {company.location}
          </span>
          {company.tags.map(tag => (
            <span key={tag}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${
                tag === "Đang tuyển dụng"
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}>
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{company.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Briefcase size={12} className="text-gray-400" />
            <strong className="text-gray-700">{company.jobCount}</strong> Công việc
          </span>
          <span className="flex items-center gap-1">
            <Star size={12} className="text-gray-400" />
            <strong className="text-gray-700">{company.salaryCount}</strong> Đánh giá
          </span>
          <span className="flex items-center gap-1">
            <DollarSign size={12} className="text-gray-400" />
            <strong className="text-gray-700">{company.salaryCount}</strong> Salaries
          </span>
        </div>
      </div>

      <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-400 shrink-0 mt-1 transition-colors" />
    </Link>
  );
}
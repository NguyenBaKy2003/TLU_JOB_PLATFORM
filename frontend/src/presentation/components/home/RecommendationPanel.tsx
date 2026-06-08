"use client";

import { useQuery } from "@tanstack/react-query";
import { AISearchService } from "@/application/services/AISearchService";
import { AISearchRepository } from "@/infrastructure/repositories/AISearchRepository";
import { useAuth } from "@/application/contexts/AuthContext";
import { Sparkles, Building2, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";

const aiSearchService = new AISearchService(new AISearchRepository());

interface RecommendationPanelProps {
  className?: string;
}

export function RecommendationPanel({ className = "" }: RecommendationPanelProps) {
const { user, isAuthenticated } = useAuth();
const { data, isLoading } = useQuery({
  queryKey: ["ai", "recommendations", user?.id ?? "guest"],  
  queryFn: () => aiSearchService.getRecommendations(true),  
  enabled: isAuthenticated,                                   
  staleTime: 10 * 60 * 1000,
});

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <Loader2 size={16} className="animate-spin" />
        <span className="text-[16px]">Đang tải gợi ý...</span>
      </div>
    );
  }

  if (!data || (!data.jobs.length && !data.companies.length)) return null;
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-purple-500" />
        <h2 className="text-lg font-semibold text-gray-900">Gợi ý cho bạn</h2>
      </div>

      {/* Jobs */}
      {data.jobs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={14} className="text-blue-500" />
            <h3 className="text-[16px] font-medium text-gray-500">Công việc phù hợp</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.jobs.slice(0, 6).map((job) => (
              <Link
                key={job.jobPostId}
                href={`/jobs/${job.jobPostId}`}
                className="block p-4 bg-white border border-gray-200 rounded-xl
                  hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  {job.companyLogoUrl && (
                    <img
                      src={job.companyLogoUrl}
                      alt={job.companyName}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[16px] font-medium text-gray-900 truncate group-hover:text-blue-600">
                      {job.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">{job.companyName}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-400">{job.location}</span>
                      {job.salary && (
                        <span className="text-xs font-medium text-green-600">{job.salary}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">
                    {job.matchScore}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">{job.reason}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Companies */}
      {data.companies.length > 0 && (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Building2 size={14} className="text-green-500" />
      <h3 className="text-[16px] font-medium text-gray-500">Công ty nổi bật</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {data.companies.slice(0, 6).map((company, idx) => (
        <Link
          key={company.companyId ?? `${company.companyName}-${idx}`}
          href={company.companyId ? `/companies/${company.companyId}` : `/companies?name=${encodeURIComponent(company.companyName)}`}
          className="block p-4 bg-white border border-gray-200 rounded-xl
            hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt={company.companyName}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-[16px] font-medium text-gray-900 group-hover:text-green-600">
                {company.companyName}
              </h4>
              {company.industry && (
                <p className="text-xs text-gray-500 mt-0.5">{company.industry}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">
                  {company?.openJobs} vị trí đang tuyển
                </span>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  {company.matchScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Open positions */}
          {company.openPositions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {company.openPositions.slice(0, 3).map((pos) => (
                <span
                  key={pos}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                >
                  {pos}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2 italic">{company.reason}</p>
        </Link>
      ))}
    </div>
  </div>
)}
    </div>
  );
}
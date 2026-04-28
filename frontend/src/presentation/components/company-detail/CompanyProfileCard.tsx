// src/presentation/components/company-detail/CompanyProfileCard.tsx
"use client";
import { useState } from "react";
import { Globe, MapPin, Users, Mail, Phone, Bookmark, Share2, Bell, Building2, Calendar, CheckCircle } from "lucide-react";
import { CompanyAvatar } from "@/presentation/components/companies/CompanyAvatar";
import type { CompanyProfile } from "@/domain/models/Company";

interface Props {
  company: CompanyProfile;
}

export function CompanyProfileCard({ company }: Props) {
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);

  const isVerified = company.verificationStatus === "VERIFIED";

  const getSizeLabel = (size: string | null | undefined): string => {
    if (!size) return "Chưa cập nhật";
    const sizeMap: Record<string, string> = {
      STARTUP: "Startup (< 10)",
      SMALL: "Nhỏ (10-49)",
      MEDIUM: "Vừa (50-199)",
      LARGE: "Lớn (200-999)",
      ENTERPRISE: "Doanh nghiệp lớn (1000+)",
      CORPORATION: "Tập đoàn",
      UNKNOWN: "Chưa cập nhật",
    };
    return sizeMap[size] || size;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">

        <div className="w-20 h-20 rounded-2xl border-2 border-gray-100 overflow-hidden shrink-0 bg-white flex items-center justify-center shadow-sm">
          <CompanyAvatar name={company.name} logoUrl={company.logoUrl} size={72} className="rounded-xl" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full">
                    <CheckCircle size={10} /> Đã xác thực
                  </span>
                )}
              </div>
              {company.website && (
                <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-0.5">
                  <Globe size={12} /> {company.website}
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSaved(v => !v)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${
                  saved ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-colors">
                <Share2 size={16} />
              </button>
              <button
                onClick={() => setFollowing(v => !v)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  following
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                }`}
              >
                {following ? <><Bell size={14} /> Đang theo dõi</> : "Theo dõi"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Building2 size={14} />, label: "Lĩnh vực", value: company.industry || "Chưa cập nhật" },
              { icon: <Users size={14} />, label: "Quy mô", value: company.sizeLabel || getSizeLabel(company.size) },
              { icon: <Calendar size={14} />, label: "Thành lập", value: company.foundedYear ? `${company.foundedYear}` : "Chưa cập nhật" },
              { icon: <MapPin size={14} />, label: "Địa điểm", value: company.city || company.address || "Chưa cập nhật" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wide">
                  {icon} {label}
                </span>
                <span className="text-xs font-medium text-gray-800 truncate" title={value || undefined}>
                  {value || "—"}
                </span>
              </div>
            ))}
          </div>

          {(company.email || company.phone) && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4">
              {company.email && (
                <div className="flex items-center gap-1.5">
                  <Mail size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600">{company.email}</span>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600">{company.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
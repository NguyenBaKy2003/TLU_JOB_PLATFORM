"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "./useInView";
import { CompanyService }    from "@/application/services/CompanyService";
import { CompanyRepository } from "@/infrastructure/repositories/CompanyRepository";
import type { CompanyProfile } from "@/domain/models/Company";

const companyService = new CompanyService(new CompanyRepository());

// ── Company Logo ──────

function CompanyLogo({ name, src }: { name: string; src?: string | null }) {
  const [imgError, setImgError] = useState(false);
  const COLORS = [
    "from-blue-500 to-blue-700", "from-green-500 to-green-700",
    "from-purple-500 to-purple-700", "from-orange-500 to-orange-600",
    "from-red-500 to-red-700", "from-teal-500 to-teal-700",
    "from-pink-500 to-pink-700", "from-indigo-500 to-indigo-700",
  ];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];

  if (src && !imgError) {
    return (
      <img
        src={src} alt={name}
        className="w-full h-full object-cover rounded-full"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={`w-full h-full rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
      <span className="text-white font-bold text-base">{name?.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

// ── Skeleton ──────────

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-2/5" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-3/5" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

// ── Company Card ──────

function CompanyCard({
  company, index, inView,
}: { company: CompanyProfile; index: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm
        hover:shadow-md hover:border-blue-100 transition-all"
    >
      {/* Logo + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full border-2 border-gray-100 shrink-0 overflow-hidden">
          <CompanyLogo name={company.name} src={company.logoUrl} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-base truncate">{company.name}</p>
          <p className="text-gray-400 text-xs">
            {company.totalJobs != null ? `${company.totalJobs} việc làm` : "Đang cập nhật"}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-3">
        {company.description || "Khám phá cơ hội nghề nghiệp tại công ty hàng đầu. Tìm kiếm và ứng tuyển ngay hôm nay."}
      </p>

      {/* Tags + link */}
      <div className="flex items-center gap-2 flex-wrap">
        {company.sizeLabel && (
          <span className="px-2.5 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
            {company.sizeLabel}
          </span>
        )}
        {company.industry && (
          <span className="px-2.5 py-1 text-xs text-gray-600 bg-gray-100 rounded-full truncate max-w-[100px]">
            {company.industry}
          </span>
        )}
        <Link
          href={`/companies/${company.id}`}
          className="ml-auto text-gray-400 hover:text-blue-600 transition-colors shrink-0"
        >
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Section ───────────

export function ChooseCompaniesSection() {
  const { ref, inView } = useInView();

  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    companyService.search({ page: 0, pageSize: 8 })
      .then(res => setCompanies(res.content))
      .catch(() => setError("Không thể tải danh sách công ty"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-[#DFEAFE] relative overflow-hidden">
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
            className="shrink-0 self-start sm:self-center inline-flex items-center gap-2
              px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold
              rounded-xl transition-colors text-[16px] shadow-lg shadow-orange-200 whitespace-nowrap"
          >
            Xem tất cả công ty
          </Link>
        </motion.div>

        {/* Error */}
        {error && (
          <p className="text-center text-sm text-red-500 mb-8">{error}</p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : companies.map((company, i) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  index={i}
                  inView={inView}
                />
              ))
          }
        </div>

      </div>
    </section>
  );
}
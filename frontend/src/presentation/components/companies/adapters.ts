// src/presentation/components/companies/adapters.ts
import type { CompanyProfile } from "@/domain/models/Company";
import type { Company }        from "./types";

export function toCompanyCard(p: CompanyProfile): Company {
  return {
    id:          p.id,
    name:        p.name,
    description: p.description ?? "",
    location:    p.address ?? "",
    rating:      p.averageRating ?? 0,
    jobCount:    p.jobCount     ?? 0,
    salaryCount: p.reviewCount  ?? 0,
    logoUrl:     p.logoUrl,
    tags: [
      ...(p.isHiring ? ["Đang tuyển dụng"] : []),
      ...(p.industry ? [p.industry] : []),
    ],
  };
}
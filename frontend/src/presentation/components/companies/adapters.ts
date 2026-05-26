// src/presentation/components/companies/adapters.ts
import type { CompanyProfile } from "@/domain/models/Company";
import type { Company }        from "./types";

export function toCompanyCard(c: CompanyProfile): Company {
  return {
    id:          c.id,
    name:        c.name,
    industry:    c.industry    ?? null,
    location:    c.city        ?? null,
    description: c.description ?? null,
    logoUrl:     c.logoUrl     ?? null,
    size:        c.sizeLabel   ?? null,
    isVerified:  c.verificationStatus === "VERIFIED",
    jobCount:    c.activeJobCount  ?? 0,
    rating:      c.averageRating   ?? 0,
    reviewCount: c.reviewCount     ?? 0,
    foundedYear: c.foundedYear     ?? null,
    website:     c.website         ?? null,
  };
}
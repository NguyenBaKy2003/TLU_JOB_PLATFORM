// src/presentation/components/companies/adapters.ts

import type { CompanyProfile } from "@/domain/models/Company";
import type { Company } from "./types";

/**
 * Map CompanyProfile (domain) → Company (view model cho CompanyCard).
 */
export function toCompanyCard(c: CompanyProfile): Company {
  return {
    id:          c.id,
    name:        c.name,
    slug:        c.slug,
    logoUrl:     c.logoUrl,
    industry:    c.industry,
    size:        c.sizeLabel ?? c.size,
    location:    c.city ?? c.address,
    description: c.description,
    rating:      c.averageRating  ?? 0,
    reviewCount: c.reviewCount    ?? 0,
    jobCount:    c.activeJobCount ?? 0,
    foundedYear: c.foundedYear,
    isVerified:  c.verificationStatus === "VERIFIED",
    isOnline:    false,
    tags:        buildTags(c),
    planCode:    c.planCode ?? null,
  };
}

function buildTags(c: CompanyProfile): string[] {
  const tags: string[] = [];
  if ((c.activeJobCount ?? 0) > 0) tags.push(`${c.activeJobCount} việc làm`);
  if (c.industry) tags.push(c.industry);
  return tags;
}
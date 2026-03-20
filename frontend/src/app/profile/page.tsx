// app/profile/page.tsx
"use client";

import { CandidateService } from "@/application/services/CandidateService";
import { CandidateRepository } from "@/infrastructure/repositories/CandidateRepository";
import { DashboardLayout } from "@/presentation/components/layout/profile/DashboardLayout";
import { ProfilePageContent } from "@/presentation/components/profile/ProfilePageContent";
const service = new CandidateService(new CandidateRepository());
 

export default function ProfilePage() {
  return (
    <DashboardLayout
      activeHref="/profile"
      topbarTitle="Hồ Sơ Của Tôi"
      topbarSubtitle="Cập nhật hồ sơ để nhận được các gợi ý việc làm chính xác nhất."
    >
      <ProfilePageContent service={service}  />
    </DashboardLayout>
  );
}
// app/profile/page.tsx
"use client";

import { DashboardLayout } from "@/presentation/components/layout/profile/DashboardLayout";
import { ProfilePageContent } from "@/presentation/components/profile/ProfilePageContent";


export default function ProfilePage() {
  return (
    <DashboardLayout
      activeHref="/profile"
      topbarTitle="Hồ Sơ Của Tôi"
      topbarSubtitle="Cập nhật hồ sơ để nhận được các gợi ý việc làm chính xác nhất."
    >
      <ProfilePageContent   />
    </DashboardLayout>
  );
}
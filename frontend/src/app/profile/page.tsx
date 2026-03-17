import { mockUser } from "@/lib/mock-data";
import { DashboardLayout } from "@/presentation/components/layout/profile/DashboardLayout";
import { ProfilePageContent } from "@/presentation/components/profile/ProfilePageContent";

export default function ProfilePage() {
  return (
    <DashboardLayout
      activeHref="/profile"
      topbarTitle="Hồ Sơ Của Tôi"
      topbarSubtitle="Cập nhật hồ sơ để nhận được các gợi ý việc làm chính xác nhất."
      user={{
        name: "Minh Hằng",
        email: "hang020704@gmail.com",
      }}
    >
      <ProfilePageContent initialUser={mockUser} />
    </DashboardLayout>
  );
}
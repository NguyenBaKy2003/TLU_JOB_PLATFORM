import { DashboardLayout } from "@/presentation/components/layout/profile/DashboardLayout";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout requiredRole="CANDIDATE">
      {children}
    </DashboardLayout>
  );
}
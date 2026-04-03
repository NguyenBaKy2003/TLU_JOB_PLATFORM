// src/presentation/components/layout/employer/EmployerLayoutClient.tsx
"use client";
import { DashboardLayout } from "@/presentation/components/layout/profile/DashboardLayout";

export default function EmployerLayoutClient({ children }: { children: React.ReactNode }) {
  return <DashboardLayout requiredRole="EMPLOYER">{children}</DashboardLayout>;
}
"use client";
import AdminLayoutClient from "@/presentation/components/layout/admin/AdminLayoutClient";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
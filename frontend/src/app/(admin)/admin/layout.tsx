import AdminLayoutClient from "@/presentation/components/layout/admin/AdminLayoutClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
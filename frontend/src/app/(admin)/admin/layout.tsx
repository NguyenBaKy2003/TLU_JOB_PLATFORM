import { AdminAuthProvider } from "@/application/contexts/AdminAuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
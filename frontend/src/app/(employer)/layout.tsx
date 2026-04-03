import EmployerLayoutClient from "@/presentation/components/layout/employer/EmployerLayoutClient";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return <EmployerLayoutClient>{children}</EmployerLayoutClient>;
}
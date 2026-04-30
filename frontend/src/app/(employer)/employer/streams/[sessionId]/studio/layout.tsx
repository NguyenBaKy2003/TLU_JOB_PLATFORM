// app/(employer)/employer/streams/[sessionId]/studio/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Studio - Stream Manager",
  description: "Employer live stream studio - Quản lý phiên live stream",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Return children directly WITHOUT EmployerLayout
  // This overrides the parent (employer) layout
  return (
    <div className="min-h-screen bg-white-50">
      {children}
    </div>
  );
}
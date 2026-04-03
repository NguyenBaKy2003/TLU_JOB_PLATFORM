import { redirect } from "next/navigation";

// /home là public landing — nếu cần dashboard thì dùng route group
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Home page — coming soon</p>
    </div>
  );
}
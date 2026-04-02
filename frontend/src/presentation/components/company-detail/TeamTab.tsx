// src/presentation/components/company-detail/TeamTab.tsx
import { Linkedin, Instagram } from "lucide-react";
import type { CompanyDetail }  from "./companyDetailTypes";

function EmployeeAvatar({ name }: { name: string }) {
  const colors = [
    "from-blue-400 to-blue-600",   "from-purple-400 to-purple-600",
    "from-green-400 to-green-600", "from-orange-400 to-orange-600",
    "from-pink-400 to-pink-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color}
      flex items-center justify-center text-white font-bold text-lg mx-auto`}>
      {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
    </div>
  );
}

// Behance-like icon
function BehanceIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px] font-bold">
      Be
    </div>
  );
}

export function TeamTab({ company }: { company: CompanyDetail }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-6">Đội ngũ Nhân viên</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {company.employees?.map(emp => (
          <div key={emp.id} className="flex flex-col items-center text-center gap-2">
            <EmployeeAvatar name={emp.name} />
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">{emp.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{emp.role}</p>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-1.5">
              <button className="text-blue-600 hover:opacity-70 transition-opacity">
                <Linkedin size={14} fill="currentColor" />
              </button>
              <BehanceIcon />
              <button className="text-pink-500 hover:opacity-70 transition-opacity">
                <Instagram size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
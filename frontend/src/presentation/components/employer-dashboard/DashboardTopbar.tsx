// src/presentation/components/employer-dashboard/DashboardTopbar.tsx
"use client";
import { useState }         from "react";
import Link                 from "next/link";
import { Search, PlusSquare, Bell, X } from "lucide-react";

export function DashboardTopbar() {
  const [query,     setQuery]     = useState("");
  const [focused,   setFocused]   = useState(false);

  return (
    <header className="flex items-center gap-4 bg-white border-b border-gray-100 px-6 py-3.5 shrink-0">
      <h1 className="text-lg font-bold text-gray-900 mr-auto">Hoạt động</h1>

      {/* Search */}
      <div className={`flex items-center gap-2 bg-gray-50 border border-gray-200
        rounded-xl px-3 py-2 transition-all duration-200 ${focused ? "w-56" : "w-40"}`}>
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Tìm kiếm"
          className="flex-1 text-sm bg-transparent placeholder:text-gray-400
            focus:outline-none text-gray-700 min-w-0"
        />
        {query && (
          <button onClick={() => setQuery("")} tabIndex={-1}>
            <X size={13} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Post button */}
      <Link
        href="/employer/jobs/new"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
          text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
      >
        <PlusSquare size={15} /> Đăng tin
      </Link>

      {/* Bell */}
      <button className="relative w-9 h-9 flex items-center justify-center
        rounded-xl hover:bg-gray-100 transition-colors">
        <Bell size={18} className="text-gray-600" />
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white
          text-[9px] font-bold rounded-full flex items-center justify-center">30</span>
      </button>

      {/* Company avatar */}
      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
        <span className="text-blue-700 font-bold text-sm">FP</span>
      </div>
    </header>
  );
}
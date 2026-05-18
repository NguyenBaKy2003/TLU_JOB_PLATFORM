// src/presentation/components/settings/DevicesPanel.tsx
"use client";
import { Monitor, Smartphone, LogOut } from "lucide-react";
import { DeviceItem }                  from "./DeviceItem";
import { useToast }                    from "@/presentation/components/ui/toast";

export function DevicesPanel() {
  const toast = useToast();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <Monitor size={16} className="text-gray-400" />
        <h2 className="text-[16px] font-semibold text-gray-800">Thiết bị</h2>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Thiết bị hiện tại</p>
          <DeviceItem icon={<Monitor size={16} />} name="Macbook"
            detail="Chrome 134 · Web 10.9.44A" location="Hà Nội, Việt Nam" current />
        </div>
        <button
          onClick={() => toast.success("Đã đăng xuất", "Đã đăng xuất khỏi tất cả thiết bị khác.")}
          className="flex items-center gap-2 w-full text-[16px] font-semibold text-red-500
            hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors">
          <LogOut size={15} />
          Đăng xuất khỏi tất cả các thiết bị khác
        </button>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Thiết bị đang hoạt động</p>
          <DeviceItem icon={<Smartphone size={16} />} name="Chrome 134"
            detail="Web 10.9.44A" location="Hà Nội, Việt Nam"
            onLogout={() => toast.success("Đã đăng xuất", "Thiết bị đã bị đăng xuất.")} />
        </div>
      </div>
    </div>
  );
}
// components/stream/common/ErrorScreen.tsx
import React from "react";
import { Wifi } from "lucide-react";

interface ErrorScreenProps {
  message?: string;
  subMessage?: string;
  onBack?: () => void;
}

export function ErrorScreen({ 
  message = "Không thể kết nối",
  subMessage = "Vui lòng kiểm tra kết nối và thử lại",
  onBack 
}: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="text-red-500">
        <Wifi className="w-10 h-10" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{message}</h2>
        <p className="text-[16px] text-slate-500">{subMessage}</p>
      </div>
      {onBack && (
        <button
          onClick={onBack}
          className="bg-blue-500 text-white border-none rounded-[10px] px-7 py-2.5 text-[16px] font-medium cursor-pointer hover:bg-blue-600"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
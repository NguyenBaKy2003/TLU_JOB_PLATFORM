// components/stream/employer/StartScreen.tsx
import React from "react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { Radio } from "lucide-react";

interface StartScreenProps {
  session: LiveStreamSession;
  onStart: () => void;
  starting: boolean;
}

export function StartScreen({ session, onStart, starting }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-8 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
        <Radio className="w-8 h-8" />
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{session.title}</h1>
        <p className="text-sm text-slate-500">Bắt đầu stream khi bạn đã sẵn sàng</p>
      </div>

      <button
        onClick={onStart}
        disabled={starting}
        className={`inline-flex items-center gap-2.5 px-9 py-3.5 rounded-xl text-[15px] font-semibold border-none
          ${starting ? "bg-red-300 text-white cursor-default" : "bg-red-500 text-white cursor-pointer hover:bg-red-600"}
        `}
      >
        {starting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Đang khởi động...
          </>
        ) : (
          "Bắt đầu Live Stream"
        )}
      </button>
    </div>
  );
}
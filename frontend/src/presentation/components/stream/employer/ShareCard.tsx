// components/stream/employer/ShareCard.tsx
"use client";

import React, { useState } from "react";
import { Copy } from "lucide-react";

interface ShareCardProps {
  sessionId: string;
}

export function ShareCard({ sessionId }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/streams/${sessionId}`;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <p className="text-xs font-medium text-slate-500 mb-2">Link chia sẻ cho ứng viên</p>
      <div className="flex gap-2">
        <code className="flex-1 text-xs text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-200 truncate">
          {url}
        </code>
        <button
          onClick={copy}
          className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 text-xs flex items-center gap-1.5 font-medium"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Đã copy" : "Copy"}
        </button>
      </div>
    </div>
  );
}
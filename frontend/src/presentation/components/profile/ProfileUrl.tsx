"use client";

import React, { useState } from "react";
import { Copy, Check, QrCode } from "lucide-react";

interface ProfileUrlProps {
  url: string;
}

export function ProfileUrl({ url }: ProfileUrlProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${url}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 mb-1">Đường dẫn hồ sơ của bạn</h3>
      <p className="text-xs text-gray-400 mb-4">
        Chia sẻ hồ sơ của bạn thông qua đường dẫn duy nhất này.
      </p>

      <div className="flex flex-col items-center gap-3">
        {/* QR placeholder - integrate qrcode lib if needed */}
        <div className="w-20 h-20 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center">
          <QrCode size={36} className="text-gray-400" />
        </div>

        {/* URL */}
        <a
          href={`https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium truncate max-w-full text-center"
        >
          {url}
        </a>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl border-2 transition-all ${
            copied
              ? "border-green-200 text-green-600 bg-green-50"
              : "border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
          }`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Đã sao chép!" : "Sao chép liên kết"}
        </button>
      </div>
    </div>
  );
}
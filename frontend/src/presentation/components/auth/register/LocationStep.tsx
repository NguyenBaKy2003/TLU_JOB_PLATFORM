"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitButton } from "@/presentation/components/common/auth-ui";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationStepProps {
  onNext: (data: { location: string; postalCode: string; remote: boolean }) => void;
  onSkip: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LocationStep({ onNext, onSkip }: LocationStepProps) {
  const [location,   setLocation]   = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [remote,     setRemote]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) { setError("Vui lòng nhập vị trí của bạn."); return; }

    setLoading(true);
    try {
      // TODO: call API to save location
      await new Promise(r => setTimeout(r, 600)); // placeholder
      onNext({ location: location.trim(), postalCode: postalCode.trim(), remote });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[320px] mx-auto">
      {/* Logo */}
      <div className="text-center mb-3">
        <Link href="/">
          <img src="/Logo.svg" alt="Job" className="h-12 w-auto mx-auto" />
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
        Bạn đang ở đâu?
      </h2>
      <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
        Chúng tôi dùng thông tin này để gợi ý các công việc<br />
        gần bạn.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location */}
        <div className="relative">
          <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
            Vị trí
          </label>
          <input
            type="text"
            placeholder="Nhập vị trí của bạn"
            value={location}
            onChange={e => { setLocation(e.target.value); setError(""); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Remote checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remote}
            onChange={e => setRemote(e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded"
          />
          <span className="text-xs text-gray-600">
            Tôi quan tâm đến làm việc từ xa (Remote)
          </span>
        </label>

        {/* Postal Code */}
        <div className="relative">
          <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
            Mã bưu chính
          </label>
          <input
            type="text"
            placeholder="Nhập mã bưu chính"
            value={postalCode}
            onChange={e => setPostalCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center">{error}</p>
        )}

        <SubmitButton loading={loading}>Tiếp tục</SubmitButton>
      </form>

      <button
        type="button"
        onClick={onSkip}
        className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-3 transition-colors"
      >
        Bỏ qua
      </button>
    </div>
  );
}
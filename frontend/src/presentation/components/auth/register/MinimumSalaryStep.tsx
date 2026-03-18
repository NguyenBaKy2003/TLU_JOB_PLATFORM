"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitButton } from "@/presentation/components/common/auth-ui";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAY_CYCLES = [
  { value: "monthly",  label: "Hàng tháng" },
  { value: "yearly",   label: "Hàng năm" },
  { value: "weekly",   label: "Hàng tuần" },
  { value: "hourly",   label: "Theo giờ" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MinimumSalaryStepProps {
  onNext: (data: { salary: number; cycle: string }) => void;
  onSkip: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MinimumSalaryStep({ onNext, onSkip }: MinimumSalaryStepProps) {
  const [salary,  setSalary]  = useState("");
  const [cycle,   setCycle]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Format number with thousands separator
  const formatDisplay = (val: string) => {
    const digits = val.replace(/\D/g, "");
    return digits ? Number(digits).toLocaleString("vi-VN") : "";
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setSalary(raw);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salary) { setError("Vui lòng nhập mức lương mong muốn."); return; }
    if (!cycle)  { setError("Vui lòng chọn chu kỳ thanh toán."); return; }

    setLoading(true);
    try {
      // TODO: call API to save salary preference
      await new Promise(r => setTimeout(r, 600)); // placeholder
      onNext({ salary: Number(salary), cycle });
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
        Mức lương tối thiểu bạn<br />mong muốn là bao nhiêu?
      </h2>
      <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
        Chúng tôi sử dụng thông tin này để gợi ý các công<br />
        việc có mức lương tương đương hoặc cao hơn.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Salary input */}
        <div className="relative">
          <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
            Mức Lương Tối Thiểu
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Nhập Mức Lương"
            value={formatDisplay(salary)}
            onChange={handleSalaryChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Đơn vị tiền tệ VNĐ
          </p>
        </div>

        {/* Pay cycle */}
        <div className="relative">
          <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium z-10">
            Chu Kỳ Thanh Toán
          </label>
          <select
            value={cycle}
            onChange={e => { setCycle(e.target.value); setError(""); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
          >
            <option value="" disabled>Chọn Chu Kỳ</option>
            {PAY_CYCLES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {/* chevron */}
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center">{error}</p>
        )}

        <SubmitButton loading={loading}>Tiếp Tục</SubmitButton>
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
"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { SubmitButton } from "@/presentation/components/common/auth-ui";

// ─── Constants ────────────

const MAX_MB = 10;
const ACCEPTED_EXTS = ["pdf", "doc", "docx"];
const ACCEPTED_ACCEPT = ".pdf,.doc,.docx";

// ─── Types ─

export interface UploadCvStepProps {
  onComplete: (file: File | null) => void;
  onSkip: () => void;
}

// ─── Component ────────────

export function UploadCvStep({ onComplete, onSkip }: UploadCvStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── File validation ─────

  const validateFile = (f: File): boolean => {
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File quá lớn. Tối đa ${MAX_MB}MB.`);
      return false;
    }
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ACCEPTED_EXTS.includes(ext)) {
      setError("Chỉ chấp nhận PDF, DOC, DOCX.");
      return false;
    }
    setError("");
    return true;
  };

  const pick = (f: File) => {
    if (validateFile(f)) setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pick(f);
  }, []);

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  // ── Submit ──────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      onComplete(file);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Tải lên thất bại. Vui lòng thử lại.",
      );
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
        Tải lên hồ sơ của bạn
      </h2>
      <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
        Tải lên CV của bạn để tìm kiếm các cơ hội việc làm
        <br />
        phù hợp nhất với kinh nghiệm của bạn.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Label row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-800">
            Tải lên CV
          </span>
          <a href="#" className="text-[11px] text-blue-600 hover:underline">
            Bạn có thể điền mẫu hồ sơ tại đây.
          </a>
        </div>

        {/* Dropzone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          className={[
            "relative border-2 border-dashed rounded-xl",
            "flex flex-col items-center justify-center gap-2",
            "cursor-pointer transition-all select-none min-h-[120px] p-5",
            error
              ? "border-red-400 bg-red-50"
              : dragging
                ? "border-blue-500 bg-blue-50"
                : file
                  ? "border-blue-400 bg-blue-50/60"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
          ].join(" ")}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_ACCEPT}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pick(f);
            }}
            className="hidden"
          />

          {file ? (
            <>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-800 max-w-[200px] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setError("");
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:border-red-300 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                >
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Kéo & Thả hoặc chọn tập tin
                <br />
                <span className="text-gray-400">
                  (Định dạng PDF, tối đa {MAX_MB} MB)
                </span>
              </p>
            </>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-[11px] mt-1.5 text-center">{error}</p>
        )}

        {/* Outline pick button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full mt-3 py-2.5 border border-blue-500 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
        >
          Tải lên CV
        </button>

        {/* Submit */}
        <div className="mt-3">
          <SubmitButton loading={loading} disabled={!file}>
            Hoàn Tất
          </SubmitButton>
        </div>
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

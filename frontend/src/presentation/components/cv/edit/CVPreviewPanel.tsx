"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, AlertCircle, FileText, X } from "lucide-react";
import type { OnlineCVDetail } from "@/domain/models/Cv";
import { CvService }    from "@/application/services/CvService";
import { CvRepository } from "@/infrastructure/repositories/CvRepository";

const cvService = new CvService(new CvRepository());

interface Props {
  cv:          OnlineCVDetail;
  refreshKey?: number;
  onClose:     () => void;
}

export function CVPreviewPanel({ cv, refreshKey = 0, onClose }: Props) {
  const [pdfUrl,  setPdfUrl]  = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Revoke old blob URL to prevent memory leaks
  const revokePdf = useCallback(() => {
    if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
  }, [pdfUrl]);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await cvService.exportPdf(cv.id);
      revokePdf();
      const url  = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch {
      setError("Không thể tải preview");
    } finally {
      setLoading(false);
    }
  }, [cv.id]);

  useEffect(() => { loadPreview(); }, [loadPreview, refreshKey]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => { if (pdfUrl) window.URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#3D5A80]" />
          <h3 className="text-sm font-bold text-slate-800">Xem trước CV</h3>
          {loading && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Đang tải…</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={loadPreview}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-slate-200">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            <p className="text-sm text-slate-500">Đang tạo bản xem trước…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-slate-600">{error}</p>
            <button
              onClick={loadPreview}
              className="text-sm font-semibold text-[#3D5A80] bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : pdfUrl ? (
          /* Embed PDF — browser renders it identically to the downloaded file */
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
            aria-label="CV Preview"
          >
            {/* Fallback for browsers that don't support PDF embed (e.g. iOS Safari) */}
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
              <FileText className="w-10 h-10 text-slate-300" />
              <p className="text-sm text-slate-600 font-medium">
                Trình duyệt không hỗ trợ xem PDF trực tiếp.
              </p>
              <a
                href={pdfUrl}
                download={`${cv.title || "cv"}.pdf`}
                className="flex items-center gap-2 px-4 py-2 bg-[#3D5A80] text-white text-sm font-semibold rounded-xl hover:bg-[#2E4565] transition-colors"
              >
                Tải xuống để xem
              </a>
            </div>
          </object>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <FileText className="w-10 h-10 text-slate-300" />
            <p className="text-sm text-slate-400">Nhấn làm mới để xem preview</p>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="flex-shrink-0 px-4 py-1.5 bg-white/80 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400">
          Nhấn <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">Esc</kbd> để đóng · Preview 1:1 với file PDF tải xuống
        </p>
      </div>
    </div>
  );
}

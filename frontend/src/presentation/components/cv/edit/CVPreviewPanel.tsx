// src/presentation/components/cv/edit/CVPreviewPanel.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, AlertCircle, FileText } from "lucide-react";
import type { OnlineCVDetail } from "@/domain/models/Cv";
import { CvService } from "@/application/services/CvService";
import { CvRepository } from "@/infrastructure/repositories/CvRepository";

const cvService = new CvService(new CvRepository());

interface Props {
  cv: OnlineCVDetail;
  refreshKey?: number; // Tăng key này để force reload
}

export function CVPreviewPanel({ cv, refreshKey = 0 }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cvService.previewHtml(cv.id);
      setHtml(result);
    } catch (err) {
      setError("Không thể tải preview");
    } finally {
      setLoading(false);
    }
  }, [cv.id]);

  // Load khi mount và khi refreshKey thay đổi
  useEffect(() => {
    loadPreview();
  }, [loadPreview, refreshKey]);

  return (
    <aside className="w-80 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#3D5A80]" />
          <h3 className="text-[16px] font-semibold text-gray-800">Preview CV</h3>
        </div>
        
        <button
          onClick={loadPreview}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="Làm mới preview"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-[#3D5A80] animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-400">Đang tải preview...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-xs text-red-500 mb-2">{error}</p>
              <button
                onClick={loadPreview}
                className="text-xs text-[#3D5A80] hover:underline"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : html ? (
          <div className="bg-white shadow-lg" style={{ width: "210mm", minHeight: "297mm" }}>
            <iframe
              srcDoc={html}
              title="CV Preview"
              className="w-full border-0"
              style={{ minHeight: "297mm" }}
              sandbox="allow-same-origin"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-xs text-gray-400">Nhấn nút làm mới để xem preview</p>
          </div>
        )}
      </div>

      {/* Footer tip */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <p className="text-[10px] text-gray-400 text-center">
          Preview sẽ tự động cập nhật sau khi lưu
        </p>
      </div>
    </aside>
  );
}
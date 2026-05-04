"use client";

import { useState, useCallback }        from "react";
import { FileText, Download, Eye, Trash2,
         Star, StarOff, X, Loader2,
         ListVideo }                    from "lucide-react";
import { CandidateCV }                  from "@/domain/models/Candidate";
import { extractErrorMessage }          from "@/lib/extractErrorMessage";

// ─── Types ─

interface Props {
  cvList:        CandidateCV[];
  loading:       boolean;
  onView:        (cvId: string) => Promise<void>;
  onDownload:    (cvId: string, title: string) => Promise<void>;
  onDelete:      (cvId: string) => Promise<void>;
  onSetPrimary:  (cvId: string) => Promise<void>;
  onClose:       () => void;
}

// ─── Helpers ──────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function shortTitle(title: string): string {
  // Bỏ UUID prefix nếu có: "uuid_uuid_RealName" → "RealName"
  const parts = title.split("_");
  if (parts.length >= 3 && parts[0].length === 36) {
    return parts.slice(2).join("_").replace(/_/g, " ");
  }
  return title.replace(/_/g, " ");
}

// ─── Row component ────────

interface RowAction { id: string; type: "view" | "download" | "delete" | "primary"; }

function CVRow({
  cv,
  onView, onDownload, onDelete, onSetPrimary,
}: {
  cv: CandidateCV;
  onView:       (id: string) => Promise<void>;
  onDownload:   (id: string, title: string) => Promise<void>;
  onDelete:     (id: string) => Promise<void>;
  onSetPrimary: (id: string) => Promise<void>;
}) {
  const [busy,  setBusy]  = useState<RowAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (type: RowAction["type"], fn: () => Promise<void>) => {
    setBusy({ id: cv.id, type });
    setError(null);
    try { await fn(); }
    catch (e) { setError(extractErrorMessage(e)); }
    finally { setBusy(null); }
  };

  const isBusy = (t: RowAction["type"]) => busy?.type === t;

  return (
    <div className={`group relative flex items-start gap-3 p-4 rounded-xl border transition-all
      ${cv.primary
        ? "border-blue-200 bg-blue-50/40"
        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
      }`}>

      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
        ${cv.primary ? "bg-blue-100" : "bg-gray-100"}`}>
        <FileText size={18} className={cv.primary ? "text-blue-600" : "text-gray-500"} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-800 truncate">
            {shortTitle(cv.title)}
          </p>
          {cv.primary && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold text-blue-600
              bg-blue-100 rounded-full shrink-0">
              CV chính
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(cv.createdAt)}</p>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">

        {/* View */}
        <button
          onClick={() => run("view", () => onView(cv.id))}
          disabled={!!busy}
          title="Xem CV"
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50
            disabled:opacity-50 transition-colors"
        >
          {isBusy("view")
            ? <Loader2 size={15} className="animate-spin" />
            : <Eye size={15} />}
        </button>

        {/* Download */}
        <button
          onClick={() => run("download", () => onDownload(cv.id, cv.title))}
          disabled={!!busy}
          title="Tải xuống"
          className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50
            disabled:opacity-50 transition-colors"
        >
          {isBusy("download")
            ? <Loader2 size={15} className="animate-spin" />
            : <Download size={15} />}
        </button>

        {/* Set primary */}
        {!cv.primary && (
          <button
            onClick={() => run("primary", () => onSetPrimary(cv.id))}
            disabled={!!busy}
            title="Đặt làm CV chính"
            className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-yellow-50
              disabled:opacity-50 transition-colors"
          >
            {isBusy("primary")
              ? <Loader2 size={15} className="animate-spin" />
              : <Star size={15} />}
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => run("delete", () => onDelete(cv.id))}
          disabled={!!busy}
          title="Xóa CV"
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50
            disabled:opacity-50 transition-colors"
        >
          {isBusy("delete")
            ? <Loader2 size={15} className="animate-spin" />
            : <Trash2 size={15} />}
        </button>
      </div>
    </div>
  );
}

// ─── Modal ─

export default function CVListModal({
  cvList, loading, onView, onDownload, onDelete, onSetPrimary, onClose,
}: Props) {
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col
        max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ListVideo size={18} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Danh sách CV của tôi</h2>
            {!loading && (
              <span className="px-2 py-0.5 text-[10px] font-medium text-gray-500
                bg-gray-100 rounded-full">
                {cvList.length}/5
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600
              hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          ) : cvList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl">
                <FileText size={22} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">Chưa có CV nào</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cvList.map((cv) => (
                <CVRow
                  key={cv.id}
                  cv={cv}
                  onView={onView}
                  onDownload={onDownload}
                  onDelete={onDelete}
                  onSetPrimary={onSetPrimary}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60">
          <p className="text-[11px] text-gray-400 text-center">
            Tối đa 5 CV · Nhấn ⭐ để đặt làm CV chính khi ứng tuyển
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useCallback }        from "react";
import { createPortal }                 from "react-dom";
import {
  FileText, Download, Eye, Trash2,
  Star, X, Loader2, ListVideo,
  Pencil, Globe, Upload,
  ChevronLeft, ChevronRight,
}                                        from "lucide-react";
import { CandidateCV }                  from "@/domain/models/Candidate";
import { extractErrorMessage }          from "@/lib/extractErrorMessage";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 2;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  cvList:        CandidateCV[];
  loading:       boolean;
  onView:        (cvId: string) => Promise<void>;
  onDownload:    (cvId: string, title: string) => Promise<void>;
  onDelete:      (cvId: string) => Promise<void>;
  onSetPrimary:  (cvId: string) => Promise<void>;
  onEdit:        (cvId: string) => void;
  onViewOnline:  (cv: CandidateCV) => void;
  onClose:       () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// ─── Source badge ─────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: "UPLOADED" | "ONLINE" | string }) {
  if (source === "ONLINE") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px]
        font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full shrink-0">
        <Globe size={9} /> Online
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px]
      font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full shrink-0">
      <Upload size={9} /> Uploaded
    </span>
  );
}

// ─── Pagination Dots ──────────────────────────────────────────────────────────

function PaginationDots({
  total,
  current,
  onSelect,
}: {
  total:    number;
  current:  number;
  onSelect: (page: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 py-1">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Trang ${i + 1}`}
          className={`transition-all rounded-full
            ${i === current
              ? "w-4 h-1.5 bg-blue-500"
              : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
            }`}
        />
      ))}
    </div>
  );
}

// ─── Pagination Controls ──────────────────────────────────────────────────────

function PaginationControls({
  page,
  totalPages,
  totalItems,
  onPrev,
  onNext,
}: {
  page:       number;
  totalPages: number;
  totalItems: number;
  onPrev:     () => void;
  onNext:     () => void;
}) {
  if (totalPages <= 1) return null;

  const start = page * PAGE_SIZE + 1;
  const end   = Math.min((page + 1) * PAGE_SIZE, totalItems);

  return (
    <div className="flex items-center justify-between mt-2 px-0.5">
      <span className="text-[11px] text-gray-400">
        {start}–{end} / {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <PaginationDots
          total={totalPages}
          current={page}
          onSelect={(p) => (p < page ? onPrev() : onNext())}
        />
        <div className="flex gap-0.5 ml-1">
          <button
            onClick={onPrev}
            disabled={page === 0}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Trang trước"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={onNext}
            disabled={page >= totalPages - 1}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Trang sau"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

type ActionType = "view" | "download" | "delete" | "primary";

function CVRow({
  cv,
  onView, onDownload, onDelete, onSetPrimary,
  onEdit, onViewOnline,
}: {
  cv: CandidateCV;
  onView:        (id: string) => Promise<void>;
  onDownload:    (id: string, title: string) => Promise<void>;
  onDelete:      (id: string) => Promise<void>;
  onSetPrimary:  (id: string) => Promise<void>;
  onEdit:        (id: string) => void;
  onViewOnline:  (cv: CandidateCV) => void;
}) {
  const [busy,  setBusy]  = useState<ActionType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (type: ActionType, fn: () => Promise<void>) => {
    setBusy(type);
    setError(null);
    try   { await fn(); }
    catch (e) { setError(extractErrorMessage(e)); }
    finally   { setBusy(null); }
  };

  const isBusy     = (t: ActionType) => busy === t;
  const isOnline   = cv.source === "ONLINE";
  const isUploaded = cv.source === "UPLOADED";

  return (
    <div className={`relative flex items-start gap-3 p-4 rounded-xl border transition-all
      ${cv.primary
        ? "border-blue-200 bg-blue-50/40"
        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
      }`}>

      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
        ${cv.primary ? "bg-blue-100" : isOnline ? "bg-emerald-50" : "bg-violet-50"}`}>
        <FileText
          size={18}
          className={cv.primary ? "text-blue-600" : isOnline ? "text-emerald-600" : "text-violet-500"}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[15px] font-medium text-gray-800 truncate max-w-[160px]">
            {cv.title}
          </p>
          <SourceBadge source={cv.source ?? "UPLOADED"} />
          {cv.primary && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold text-blue-600
              bg-blue-100 rounded-full shrink-0">
              CV chính
            </span>
          )}
          {isOnline && (cv as any).status && (
            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full shrink-0
              ${(cv as any).status === "PUBLISHED"
                ? "text-green-700 bg-green-50"
                : "text-gray-500 bg-gray-100"}`}>
              {(cv as any).status === "PUBLISHED" ? "Đã xuất bản" : (cv as any).status}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(cv.createdAt)}</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">

        {/* ── UPLOADED actions ── */}
        {isUploaded && (
          <>
            <ActionBtn
              busy={isBusy("view")}
              disabled={!!busy}
              title="Xem CV"
              color="blue"
              icon={<Eye size={15} />}
              onClick={() => run("view", () => onView(cv.id))}
            />
            <ActionBtn
              busy={isBusy("download")}
              disabled={!!busy}
              title="Tải xuống"
              color="green"
              icon={<Download size={15} />}
              onClick={() => run("download", () => onDownload(cv.id, cv.title))}
            />
          </>
        )}

        {/* ── ONLINE actions ── */}
        {isOnline && (
          <>
            <ActionBtn
              busy={false}
              disabled={!!busy}
              title="Xem trước CV"
              color="blue"
              icon={<Eye size={15} />}
              onClick={() => onViewOnline(cv)}
            />
            <ActionBtn
              busy={false}
              disabled={!!busy}
              title="Chỉnh sửa CV"
              color="emerald"
              icon={<Pencil size={15} />}
              onClick={() => onEdit(cv.id)}
            />
          </>
        )}

        {/* Delete — both sources */}
        <ActionBtn
          busy={isBusy("delete")}
          disabled={!!busy}
          title="Xóa CV"
          color="red"
          icon={<Trash2 size={15} />}
          onClick={() => run("delete", () => onDelete(cv.id))}
        />
      </div>
    </div>
  );
}

// ─── Reusable action button ───────────────────────────────────────────────────

type BtnColor = "blue" | "green" | "emerald" | "yellow" | "red";

const colorMap: Record<BtnColor, string> = {
  blue:    "hover:text-blue-600   hover:bg-blue-50",
  green:   "hover:text-green-600  hover:bg-green-50",
  emerald: "hover:text-emerald-600 hover:bg-emerald-50",
  yellow:  "hover:text-yellow-500 hover:bg-yellow-50",
  red:     "hover:text-red-500    hover:bg-red-50",
};

function ActionBtn({
  busy, disabled, title, color, icon, onClick,
}: {
  busy:     boolean;
  disabled: boolean;
  title:    string;
  color:    BtnColor;
  icon:     React.ReactNode;
  onClick:  () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg text-gray-400 disabled:opacity-50 transition-colors
        ${colorMap[color]}`}
    >
      {busy
        ? <Loader2 size={15} className="animate-spin" />
        : icon}
    </button>
  );
}

// ─── Paginated Section ────────────────────────────────────────────────────────

function PaginatedSection({
  items, icon, label, color,
  onView, onDownload, onDelete, onSetPrimary, onEdit, onViewOnline,
}: {
  items:        CandidateCV[];
  icon:         React.ReactNode;
  label:        string;
  color:        "violet" | "emerald";
  onView:       (id: string) => Promise<void>;
  onDownload:   (id: string, title: string) => Promise<void>;
  onDelete:     (id: string) => Promise<void>;
  onSetPrimary: (id: string) => Promise<void>;
  onEdit:       (id: string) => void;
  onViewOnline: (cv: CandidateCV) => void;
}) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const safePage   = Math.min(page, Math.max(0, totalPages - 1));
  const pageItems  = items.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const handleDelete = useCallback(async (id: string) => {
    await onDelete(id);
    const newTotal = items.length - 1;
    const newPages = Math.ceil(newTotal / PAGE_SIZE);
    if (safePage >= newPages && safePage > 0) {
      setPage(safePage - 1);
    }
  }, [onDelete, items.length, safePage]);

  return (
    <section>
      <SectionHeader icon={icon} label={label} color={color} count={items.length} />
      <div className="flex flex-col gap-2 mt-2">
        {pageItems.map(cv => (
          <CVRow
            key={cv.id}
            cv={cv}
            onView={onView}
            onDownload={onDownload}
            onDelete={handleDelete}
            onSetPrimary={onSetPrimary}
            onEdit={onEdit}
            onViewOnline={onViewOnline}
          />
        ))}
      </div>
      <PaginationControls
        page={safePage}
        totalPages={totalPages}
        totalItems={items.length}
        onPrev={() => setPage(p => Math.max(0, p - 1))}
        onNext={() => setPage(p => Math.min(totalPages - 1, p + 1))}
      />
    </section>
  );
}

// ─── Section header helper ────────────────────────────────────────────────────

function SectionHeader({
  icon, label, color, count,
}: {
  icon:  React.ReactNode;
  label: string;
  color: "violet" | "emerald";
  count: number;
}) {
  const colors = {
    violet:  "text-violet-600 bg-violet-50 border-violet-200",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
  };
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px]
        font-semibold rounded-full border ${colors[color]}`}>
        {icon} {label}
      </span>
      <span className="text-[11px] text-gray-400">{count} CV</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function CVListModal({
  cvList, loading,
  onView, onDownload, onDelete, onSetPrimary,
  onEdit, onViewOnline, onClose,
}: Props) {

  const uploaded = cvList.filter(cv => cv.source !== "ONLINE");
  const online   = cvList.filter(cv => cv.source === "ONLINE");

  // Dùng createPortal để render thẳng vào <body>,
  // thoát hoàn toàn khỏi stacking context của sidebar và Header.
  // z-[200] đảm bảo nổi trên mọi thứ (Header z-40, dropdown z-50).
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4
        bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col
        max-h-[82vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ListVideo size={18} className="text-blue-600" />
            <h2 className="text-[16px] font-semibold text-gray-900">Danh sách CV của tôi</h2>
            {!loading && (
              <span className="px-2 py-0.5 text-[10px] font-medium text-gray-500
                bg-gray-100 rounded-full">
                {cvList.length}
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          ) : cvList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl">
                <FileText size={22} className="text-gray-400" />
              </div>
              <p className="text-[15px] text-gray-400">Chưa có CV nào</p>
            </div>
          ) : (
            <>
              {uploaded.length > 0 && (
                <PaginatedSection
                  items={uploaded}
                  icon={<Upload size={12} />}
                  label="CV tải lên"
                  color="violet"
                  onView={onView}
                  onDownload={onDownload}
                  onDelete={onDelete}
                  onSetPrimary={onSetPrimary}
                  onEdit={onEdit}
                  onViewOnline={onViewOnline}
                />
              )}

              {online.length > 0 && (
                <PaginatedSection
                  items={online}
                  icon={<Globe size={12} />}
                  label="CV online"
                  color="emerald"
                  onView={onView}
                  onDownload={onDownload}
                  onDelete={onDelete}
                  onSetPrimary={onSetPrimary}
                  onEdit={onEdit}
                  onViewOnline={onViewOnline}
                />
              )}
            </>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
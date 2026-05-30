"use client";

import { Upload, Trash2, FileText, AlertCircle,
         RefreshCw, List }              from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { CandidateCV, UploadCVPayload } from "@/domain/models/Candidate";
import { extractErrorMessage }          from "@/lib/extractErrorMessage";
import CVListModal                      from "./CVListModal";

type UploadPhase = "idle" | "uploading" | "error" | "success";

interface LocalFile {
  name:      string;
  sizeKB:    string;
  progress:  number;
  phase:     UploadPhase;
  errorMsg:  string | null;
  isPrimary: boolean;
}

interface Props {
  primaryCV?:    CandidateCV | null;
  cvList:        CandidateCV[];
  cvListLoading: boolean;
  onUpload:      (data: UploadCVPayload & { setAsPrimary?: boolean }) => Promise<void>;
  onDelete:      (cvId: string) => Promise<void>;
  onView:        (cvId: string) => Promise<void>;
  onDownload:    (cvId: string, title: string) => Promise<void>;
  onSetPrimary:  (cvId: string) => Promise<void>;
  onRefreshList: () => Promise<void>;
  /** ONLINE CV: điều hướng tới CV builder */
  onEdit:        (cvId: string) => void;
  /** ONLINE CV: xem trước qua slug hoặc previewHtml */
  onViewOnline:  (cv: CandidateCV) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CVUploadCard({
  primaryCV, cvList, cvListLoading,
  onUpload, onDelete, onView, onDownload, onSetPrimary, onRefreshList,
  onEdit, onViewOnline,
}: Props) {
  const fileRef                             = useRef<HTMLInputElement>(null);
  const [dragging,       setDragging]       = useState(false);
  const [local,          setLocal]          = useState<LocalFile | null>(null);
  const [deleting,       setDeleting]       = useState(false);
  const [pendingFile,    setPendingFile]    = useState<File | null>(null);
  const [showPrimaryAsk, setShowPrimaryAsk] = useState(false);
  const [showList,       setShowList]       = useState(false);

  const showSuccess      = local?.phase === "success" || (!local && !!primaryCV);
  const displayName      = local?.phase === "success" ? local.name : primaryCV?.title ?? null;
  const showPrimaryBadge = local?.phase === "success" ? local.isPrimary : !!primaryCV?.primary;

  // ── Upload ────────────────────────────────────────────────────────────────

  const doUpload = useCallback(async (file: File, setAsPrimary: boolean) => {
    setShowPrimaryAsk(false);
    setPendingFile(null);
    setLocal({ name: file.name, sizeKB: formatSize(file.size), progress: 0, phase: "uploading", errorMsg: null, isPrimary: false });

    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(p + 10, 80);
      setLocal((prev) => prev ? { ...prev, progress: p } : prev);
    }, 150);

    try {
      await onUpload({ file, title: file.name.replace(/\.[^/.]+$/, ""), setAsPrimary });
      clearInterval(tick);
      setLocal((prev) => prev ? { ...prev, progress: 100, phase: "success", isPrimary: setAsPrimary } : prev);
    } catch (e) {
      clearInterval(tick);
      setLocal((prev) => prev ? { ...prev, phase: "error", errorMsg: extractErrorMessage(e, "Tải lên thất bại") } : prev);
    }
  }, [onUpload]);

  const handleFile = (file: File) => {
    if (primaryCV || local?.phase === "success") { setPendingFile(file); setShowPrimaryAsk(true); }
    else doUpload(file, true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  };

  // ── Delete primary CV ─────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (local?.phase === "success") { setLocal(null); return; }
    if (primaryCV && onDelete) {
      setDeleting(true);
      try { await onDelete(primaryCV.id); } finally { setDeleting(false); }
    }
  };

  // ── Open list modal ───────────────────────────────────────────────────────

  const handleOpenList = async () => {
    setShowList(true);
    await onRefreshList();
  };

  // ── Shared modal (dùng ở cả 2 render branch) ─────────────────────────────

  const listModal = showList && (
    <CVListModal
      cvList={cvList}
      loading={cvListLoading}
      onView={onView}
      onDownload={onDownload}
      onDelete={onDelete}
      onSetPrimary={onSetPrimary}
      onEdit={onEdit}
      onViewOnline={onViewOnline}
      onClose={() => setShowList(false)}
    />
  );

  // ── Render: hỏi primary ───────────────────────────────────────────────────

  if (showPrimaryAsk && pendingFile) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-[16px] font-semibold text-gray-900 mb-1">Đặt làm CV chính?</h3>
        <p className="text-xs text-gray-500 mb-4">
          Bạn có muốn đặt <span className="font-medium text-gray-700">{pendingFile.name}</span> làm CV chính không?
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={() => doUpload(pendingFile, true)}
            className="w-full py-2.5 text-[16px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Có, đặt làm CV chính
          </button>
          <button onClick={() => doUpload(pendingFile, false)}
            className="w-full py-2.5 text-[16px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Không, giữ CV cũ làm chính
          </button>
          <button onClick={() => { setShowPrimaryAsk(false); setPendingFile(null); }}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Hủy
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Success / Existing ────────────────────────────────────────────

  if (showSuccess) {
    return (
      <>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="text-[16px] font-semibold text-blue-600">CV đã tải lên</h3>
            <button
              onClick={handleOpenList}
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600
                hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
            >
              <List size={13} />
              Xem tất cả ({cvList.length})
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">Tải tệp lên thành công!</p>

          <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 bg-blue-50/30">
            <div className="flex justify-end mb-1">
              <button onClick={handleDelete} disabled={deleting}
                className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors">
                {deleting
                  ? <span className="w-3.5 h-3.5 border-2 border-gray-300/40 border-t-gray-500 rounded-full animate-spin block" />
                  : <Trash2 size={14} />}
              </button>
            </div>
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <p className="text-xs font-medium text-gray-700 text-center truncate max-w-[160px]">{displayName}</p>
              {showPrimaryBadge && (
                <span className="px-2 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-100 rounded-full">
                  CV chính
                </span>
              )}
            </div>
          </div>

          <button onClick={() => fileRef.current?.click()}
            className="mt-3 w-full py-2.5 text-[16px] font-medium text-blue-600 bg-white
              border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
            Thay đổi tệp
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
        </div>

        {listModal}
      </>
    );
  }

  // ── Render: Upload / Error / Idle ─────────────────────────────────────────

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-[16px] font-semibold text-gray-900">Tải CV của bạn lên</h3>
          {cvList.length > 0 && (
            <button
              onClick={handleOpenList}
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600
                hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
            >
              <List size={13} />
              Xem tất cả ({cvList.length})
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4">Bạn có thể đính kèm một tệp CV riêng tại đây.</p>

        {local?.phase === "uploading" && (
          <div className="mb-4 bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-700 truncate flex-1 mr-2">{local.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{local.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${local.progress}%` }} />
            </div>
          </div>
        )}

        {local?.phase === "error" && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={13} className="text-red-500 shrink-0" />
              <p className="text-xs font-semibold text-red-600">Lỗi</p>
            </div>
            <p className="text-xs text-red-500 mb-3 pl-5">{local.errorMsg}</p>
            <div className="bg-white border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-700 truncate flex-1 mr-2">{local.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{local.sizeKB}</span>
                  <button onClick={() => setLocal(null)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-base leading-none">×</button>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${local.progress}%` }} />
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium
                  text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                <RefreshCw size={12} /> Thử lại
              </button>
            </div>
          </div>
        )}

        {local?.phase !== "uploading" && (
          <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)} onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed
              rounded-xl p-6 cursor-pointer transition-colors ${
                dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}>
            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
              <Upload size={18} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Kéo & Thả hoặc Chọn tệp<br />
              <span className="text-[10px]">PDF, DOC, DOCX · Tối đa 10 MB</span>
            </p>
          </div>
        )}

        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />

        <button onClick={() => fileRef.current?.click()} disabled={local?.phase === "uploading"}
          className="mt-3 w-full py-2.5 text-[16px] font-medium text-white bg-blue-600
            rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {local?.phase === "uploading" ? "Đang tải lên..." : "Tải lên CV"}
        </button>
      </div>

      {listModal}
    </>
  );
}
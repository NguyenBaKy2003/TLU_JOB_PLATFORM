"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, FileText, Loader2, Globe, Star,
  Upload, ExternalLink, CheckCircle2, AlertCircle,
} from "lucide-react";
import { useRouter }              from "next/navigation";
import { extractErrorMessage }    from "@/lib/extractErrorMessage";
import { CandidateService }       from "@/application/services/CandidateService";
import { CandidateRepository }    from "@/infrastructure/repositories/CandidateRepository";
import type { ApplicableCV }      from "@/domain/models/Candidate";

const candidateService = new CandidateService(new CandidateRepository());

const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_CV_SIZE_MB = 10;
const MAX_CV_BYTES   = MAX_CV_SIZE_MB * 1024 * 1024;

// ── Helpers ───────────────────────────────────────────────────────────────────

function displayTitle(raw: string): string {
  const parts = raw.split("_");
  if (parts.length >= 3 && /^[0-9a-f-]{36}$/i.test(parts[0])) {
    return parts.slice(2).join(" ").replace(/_/g, " ");
  }
  return raw.replace(/_/g, " ");
}

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Upload zone ───────────────────────────────────────────────────────────────

interface UploadZoneProps {
  onUploaded: (cv: ApplicableCV) => void;
  onError:    (msg: string) => void;
}

function UploadZone({ onUploaded, onError }: UploadZoneProps) {
  const fileRef               = useRef<HTMLInputElement>(null);
  const [file,   setFile]     = useState<File | null>(null);
  const [status, setStatus]   = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [errMsg, setErrMsg]   = useState("");
  const [isDrag, setIsDrag]   = useState(false);

  const validate = (f: File): string | null => {
    if (!ALLOWED_CV_TYPES.includes(f.type))
      return "Chỉ chấp nhận PDF, DOC, DOCX";
    if (f.size > MAX_CV_BYTES)
      return `Tệp tối đa ${MAX_CV_SIZE_MB}MB (hiện tại ${formatBytes(f.size)})`;
    return null;
  };

  const startUpload = async (f: File) => {
    const err = validate(f);
    if (err) { setErrMsg(err); setStatus("error"); onError(err); return; }

    setFile(f);
    setStatus("uploading");
    setErrMsg("");
    try {
      const cv = await candidateService.uploadCV({ file: f, setAsPrimary: false });
      // Chuyển CandidateCV → ApplicableCV shape để thêm vào danh sách
      const applicable: ApplicableCV = {
        id:      cv.id,
        title:   cv.title,
        type:    "UPLOADED",
        fileUrl: cv.fileUrl ?? "",
        primary: cv.primary ?? false,
      };
      setStatus("done");
      onUploaded(applicable);
    } catch (e) {
      const msg = extractErrorMessage(e, "Tải CV lên thất bại");
      setErrMsg(msg);
      setStatus("error");
      onError(msg);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    startUpload(files[0]);
  };

  // Drag & drop
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDrag(true);  };
  const onDragLeave = ()                    => setIsDrag(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setIsDrag(false);
    handleFiles(e.dataTransfer.files);
  };

  if (status === "done" && file) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border
        border-emerald-200 bg-emerald-50">
        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-700 truncate">{file.name}</p>
          <p className="text-xs text-emerald-500">{formatBytes(file.size)} · Đã tải lên</p>
        </div>
        <button
          onClick={() => { setFile(null); setStatus("idle"); }}
          className="text-emerald-400 hover:text-emerald-600 transition-colors"
          title="Tải lên tệp khác"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => status !== "uploading" && fileRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-2
        px-4 py-5 rounded-xl border-2 border-dashed cursor-pointer
        transition-all select-none
        ${status === "uploading"
          ? "border-blue-300 bg-blue-50 cursor-wait"
          : isDrag
            ? "border-blue-400 bg-blue-50 scale-[1.01]"
            : status === "error"
              ? "border-red-300 bg-red-50 hover:border-red-400"
              : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
        }`}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {status === "uploading" ? (
        <>
          <Loader2 size={22} className="text-blue-500 animate-spin" />
          <p className="text-sm font-medium text-blue-600">Đang tải lên...</p>
        </>
      ) : status === "error" ? (
        <>
          <AlertCircle size={22} className="text-red-400" />
          <p className="text-sm font-medium text-red-600 text-center">{errMsg}</p>
          <p className="text-xs text-red-400">Nhấn để thử lại</p>
        </>
      ) : (
        <>
          <Upload size={22} className={isDrag ? "text-blue-500" : "text-gray-400"} />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {isDrag ? "Thả tệp vào đây" : "Kéo thả hoặc nhấn để chọn"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX · Tối đa {MAX_CV_SIZE_MB}MB</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── CV list item ───────────────────────────────────────────────────────────────

function CvListItem({
  cv, selected, onSelect,
}: {
  cv: ApplicableCV; selected: boolean; onSelect: () => void;
}) {
  const isOnline = cv.type === "ONLINE";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border
        text-left transition-all shrink-0
        ${selected
          ? "border-blue-400 bg-blue-50/60 ring-2 ring-blue-500/20"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
    >
      {/* Radio */}
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
        shrink-0 transition-colors ${selected ? "border-blue-500" : "border-gray-300"}`}>
        {selected && <span className="w-2 h-2 rounded-full bg-blue-500" />}
      </span>

      {/* Icon */}
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
        ${selected ? "bg-blue-100" : "bg-gray-100"}`}>
        {isOnline
          ? <Globe size={15} className={selected ? "text-blue-600" : "text-gray-400"} />
          : <FileText size={15} className={selected ? "text-blue-600" : "text-gray-400"} />
        }
      </span>

      {/* Info */}
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-sm font-medium truncate
            ${selected ? "text-blue-700" : "text-gray-700"}`}>
            {displayTitle(cv.title)}
          </span>
          {cv.primary && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5
              text-[10px] font-semibold text-yellow-700 bg-yellow-100 rounded-full shrink-0">
              <Star size={9} /> CV chính
            </span>
          )}
        </span>
        <span className="text-xs text-gray-400 block mt-0.5">
          {isOnline ? "CV online" : "File PDF/Word"}
        </span>
      </span>
    </button>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

interface ApplyModalProps {
  jobTitle: string;
  onClose:  () => void;
  onSubmit: (cvUrl: string, coverLetter: string, expectedSalary: string) => Promise<void>;
}

export function ApplyModal({ jobTitle, onClose, onSubmit }: ApplyModalProps) {
  const router = useRouter();

  const [cvList,         setCvList]         = useState<ApplicableCV[]>([]);
  const [cvLoading,      setCvLoading]      = useState(true);
  const [cvError,        setCvError]        = useState<string | null>(null);
  const [selectedCvId,   setSelectedCvId]   = useState<string>("");
  const [coverLetter,    setCoverLetter]    = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [submitting,     setSubmitting]     = useState(false);
  const [submitError,    setSubmitError]    = useState<string | null>(null);

  // ── Load CV list ──

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCvLoading(true); setCvError(null);
      try {
        const list = await candidateService.listApplicableCVs();
        if (cancelled) return;
        setCvList(list);
        const primary = list.find(cv => cv.primary);
        setSelectedCvId(primary?.id ?? list[0]?.id ?? "");
      } catch (e) {
        if (!cancelled)
          setCvError(extractErrorMessage(e, "Không tải được danh sách CV."));
      } finally {
        if (!cancelled) setCvLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Khi upload xong, thêm CV mới vào đầu danh sách và chọn nó ──

  const handleUploaded = (newCv: ApplicableCV) => {
    setCvList(prev => [newCv, ...prev]);
    setSelectedCvId(newCv.id);
    setSubmitError(null);
  };

  // ── Submit ──

  const handleSubmit = async () => {
    if (!selectedCvId) { setSubmitError("Vui lòng chọn CV để ứng tuyển."); return; }

    const selected = cvList.find(cv => cv.id === selectedCvId);
    const cvUrl = selected?.type === "ONLINE"
      ? selected.slug ?? ""
      : selected?.fileUrl ?? "";

    if (!cvUrl) {
      setSubmitError("CV đã chọn không hợp lệ. Vui lòng chọn CV khác.");
      return;
    }

    setSubmitting(true); setSubmitError(null);
    try {
      await onSubmit(cvUrl, coverLetter, expectedSalary);
    } catch (e) {
      setSubmitError(extractErrorMessage(e, "Nộp đơn thất bại. Vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Redirect sang /cv để tạo CV online, giữ intent ──

  const handleCreateOnlineCV = () => {
    router.push("/cv?from=apply");
  };

  const inputCls = `w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
    placeholder:text-gray-300 transition-all bg-white`;

  const isEmpty   = !cvLoading && !cvError && cvList.length === 0;
  const hasError  = !cvLoading && cvError;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg
        max-h-[90dvh] flex flex-col
        animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Ứng tuyển vị trí</h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{jobTitle}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl
              text-gray-400 hover:bg-gray-100 transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 flex flex-col gap-4">

          {/* ── Chọn CV ── */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Chọn CV <span className="text-red-500">*</span>
            </label>

            {cvLoading ? (
              <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200
                rounded-xl text-sm text-gray-400">
                <Loader2 size={14} className="animate-spin shrink-0" />
                Đang tải danh sách CV...
              </div>
            ) : hasError ? (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2.5 rounded-xl
                border border-red-100">{cvError}</p>
            ) : (
              <>
                {/* Danh sách CV có sẵn */}
                {cvList.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-0.5 mb-3">
                    {cvList.map(cv => (
                      <CvListItem
                        key={cv.id}
                        cv={cv}
                        selected={cv.id === selectedCvId}
                        onSelect={() => setSelectedCvId(cv.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Divider */}
                {cvList.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400 shrink-0">hoặc</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                )}

                {/* Trạng thái rỗng */}
                {isEmpty && (
                  <p className="text-sm text-gray-400 text-center mb-3">
                    Bạn chưa có CV nào. Tải lên hoặc tạo CV online bên dưới.
                  </p>
                )}

                {/* Upload CV mới */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-gray-500">
                    Tải CV mới lên
                  </p>
                  <UploadZone
                    onUploaded={handleUploaded}
                    onError={msg => setSubmitError(msg)}
                  />
                </div>

                {/* Tạo CV online → /cv */}
                <button
                  type="button"
                  onClick={handleCreateOnlineCV}
                  className="mt-2 cursor-pointer w-full flex items-center justify-center gap-2
                    py-2.5 rounded-xl border border-dashed border-violet-200
                    bg-violet-50 text-violet-700 text-sm font-medium
                    hover:bg-violet-100 hover:border-violet-300 transition-all"
                >
                  <Globe size={15} />
                  Tạo CV online
                  <ExternalLink size={13} className="text-violet-400" />
                </button>
              </>
            )}
          </div>

          {/* ── Mức lương ── */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Mức lương kỳ vọng
              <span className="text-gray-400 font-normal ml-1">(tuỳ chọn)</span>
            </label>
            <input
              type="text"
              placeholder="VD: 15 - 20 triệu VND"
              value={expectedSalary}
              onChange={e => setExpectedSalary(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* ── Thư giới thiệu ── */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Thư giới thiệu
              <span className="text-gray-400 font-normal ml-1">(tuỳ chọn)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Giới thiệu ngắn về bản thân và lý do bạn phù hợp..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              className={inputCls + " resize-none"}
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl
              border border-red-100">
              {submitError}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-2 px-6 py-4 shrink-0 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 border
              border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || cvLoading || !selectedCvId}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600
              rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors
              flex items-center justify-center gap-2"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white
                rounded-full animate-spin" />
            )}
            {submitting ? "Đang gửi..." : "Nộp đơn"}
          </button>
        </div>
      </div>
    </div>
  );
}
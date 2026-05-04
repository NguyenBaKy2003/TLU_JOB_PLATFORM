"use client";

import { useState, useEffect }    from "react";
import { X, FileText, Loader2, ChevronDown, Star } from "lucide-react";
import { extractErrorMessage }     from "@/lib/extractErrorMessage";
import { CandidateService }        from "@/application/services/CandidateService";
import { CandidateRepository }     from "@/infrastructure/repositories/CandidateRepository";
import type { CandidateCV }        from "@/domain/models/Candidate";

// ─── Service singleton ────

const candidateService = new CandidateService(new CandidateRepository());

// ─── Props ─

interface ApplyModalProps {
  jobTitle:  string;
  onClose:   () => void;
  /**
   * cvUrl  = fileUrl của CV đã chọn (S3 URL)
   * coverLetter, expectedSalary giữ nguyên như cũ
   */
  onSubmit:  (cvUrl: string, coverLetter: string, expectedSalary: string) => Promise<void>;
}

// ─── Helpers ──────────────

function displayTitle(raw: string): string {
  // Bỏ UUID prefix nếu có: "uuid_uuid_RealName" → "RealName"
  const parts = raw.split("_");
  if (parts.length >= 3 && /^[0-9a-f-]{36}$/i.test(parts[0])) {
    return parts.slice(2).join(" ").replace(/_/g, " ");
  }
  return raw.replace(/_/g, " ");
}

// ─── Component ────────────

export function ApplyModal({ jobTitle, onClose, onSubmit }: ApplyModalProps) {
  const [cvList,         setCvList]         = useState<CandidateCV[]>([]);
  const [cvLoading,      setCvLoading]      = useState(true);
  const [cvError,        setCvError]        = useState<string | null>(null);

  const [selectedCvId,   setSelectedCvId]   = useState<string>("");
  const [coverLetter,    setCoverLetter]    = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");

  const [submitting,     setSubmitting]     = useState(false);
  const [submitError,    setSubmitError]    = useState<string | null>(null);

  // ── Load CV list on mount ─────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCvLoading(true);
      setCvError(null);
      try {
        const list = await candidateService.listCVs();
        if (cancelled) return;
        setCvList(list);
        // Tự động chọn CV primary nếu có, nếu không thì chọn CV đầu tiên
        const primary = list.find(cv => cv.primary);
        setSelectedCvId(primary?.id ?? list[0]?.id ?? "");
      } catch (e) {
        if (!cancelled) setCvError(extractErrorMessage(e, "Không tải được danh sách CV."));
      } finally {
        if (!cancelled) setCvLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Submit ─────────────
  const handleSubmit = async () => {
    if (!selectedCvId) {
      setSubmitError("Vui lòng chọn CV để ứng tuyển.");
      return;
    }

    const selectedCv = cvList.find(cv => cv.id === selectedCvId);
    if (!selectedCv?.fileUrl) {
      setSubmitError("CV đã chọn không có file hợp lệ. Vui lòng chọn CV khác.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(selectedCv.fileUrl, coverLetter, expectedSalary);
    } catch (e) {
      setSubmitError(extractErrorMessage(e, "Nộp đơn thất bại. Vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const inputCls = `w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
    placeholder:text-gray-300 transition-all bg-white`;

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6
        animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* ── Header ──── */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Ứng tuyển vị trí</h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl
              text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4">

          {/* ── Chọn CV ────── */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Chọn CV <span className="text-red-500">*</span>
            </label>

            {cvLoading ? (
              <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200
                rounded-xl text-sm text-gray-400">
                <Loader2 size={14} className="animate-spin shrink-0" />
                Đang tải danh sách CV...
              </div>
            ) : cvError ? (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2.5 rounded-xl
                border border-red-100">
                {cvError}
              </p>
            ) : cvList.length === 0 ? (
              <div className="px-3 py-3 border border-dashed border-gray-200 rounded-xl
                text-center">
                <p className="text-sm text-gray-400">Bạn chưa có CV nào.</p>
                <a
                  href="/candidate/profile"
                  className="text-xs text-blue-600 hover:underline mt-0.5 inline-block"
                >
                  Tải CV lên ngay →
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {cvList.map((cv) => {
                  const isSelected = cv.id === selectedCvId;
                  return (
                    <button
                      key={cv.id}
                      type="button"
                      onClick={() => setSelectedCvId(cv.id)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border
                        text-left transition-all
                        ${isSelected
                          ? "border-blue-400 bg-blue-50/60 ring-2 ring-blue-500/20"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {/* Radio indicator */}
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center
                        justify-center shrink-0 transition-colors
                        ${isSelected ? "border-blue-500" : "border-gray-300"}`}>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </span>

                      {/* CV icon */}
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center
                        shrink-0 ${isSelected ? "bg-blue-100" : "bg-gray-100"}`}>
                        <FileText
                          size={15}
                          className={isSelected ? "text-blue-600" : "text-gray-400"}
                        />
                      </span>

                      {/* Info */}
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-sm truncate font-medium
                            ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                            {displayTitle(cv.title)}
                          </span>
                          {cv.primary && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5
                              text-[10px] font-semibold text-yellow-700 bg-yellow-100
                              rounded-full shrink-0">
                              <Star size={9} />
                              CV chính
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-gray-400 truncate block mt-0.5">
                          {cv.type === "UPLOADED" ? "File PDF/Word" : "CV online"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Mức lương kỳ vọng ─────────── */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
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

          {/* ── Thư giới thiệu ────────────── */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Thư giới thiệu
              <span className="text-gray-400 font-normal ml-1">(tuỳ chọn)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Giới thiệu ngắn về bản thân và lý do bạn phù hợp với vị trí này..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              className={inputCls + " resize-none"}
            />
          </div>

          {/* ── Submit error ── */}
          {submitError && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl
              border border-red-100">
              {submitError}
            </p>
          )}

          {/* ── Actions  */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 border
                border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || cvLoading || cvList.length === 0}
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
    </div>
  );
}
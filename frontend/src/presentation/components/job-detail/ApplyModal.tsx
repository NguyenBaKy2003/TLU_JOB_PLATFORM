"use client";

import { useState, useEffect }    from "react";
import { X, FileText, Loader2, Globe, Star } from "lucide-react";
import { extractErrorMessage }     from "@/lib/extractErrorMessage";
import { CandidateService }        from "@/application/services/CandidateService";
import { CandidateRepository }     from "@/infrastructure/repositories/CandidateRepository";
import type { ApplicableCV }       from "@/domain/models/Candidate";

const candidateService = new CandidateService(new CandidateRepository());

interface ApplyModalProps {
  jobTitle: string;
  onClose:  () => void;
  onSubmit: (cvUrl: string, coverLetter: string, expectedSalary: string) => Promise<void>;
}

function displayTitle(raw: string): string {
  const parts = raw.split("_");
  if (parts.length >= 3 && /^[0-9a-f-]{36}$/i.test(parts[0])) {
    return parts.slice(2).join(" ").replace(/_/g, " ");
  }
  return raw.replace(/_/g, " ");
}

export function ApplyModal({ jobTitle, onClose, onSubmit }: ApplyModalProps) {
  const [cvList,         setCvList]         = useState<ApplicableCV[]>([]);
  const [cvLoading,      setCvLoading]      = useState(true);
  const [cvError,        setCvError]        = useState<string | null>(null);
  const [selectedCvId,   setSelectedCvId]   = useState<string>("");
  const [coverLetter,    setCoverLetter]    = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [submitting,     setSubmitting]     = useState(false);
  const [submitError,    setSubmitError]    = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCvLoading(true); setCvError(null);
      try {
        // ← listApplicableCVs thay vì listCVs
        const list = await candidateService.listApplicableCVs();
        if (cancelled) return;
        setCvList(list);
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

  const handleSubmit = async () => {
    if (!selectedCvId) { setSubmitError("Vui lòng chọn CV để ứng tuyển."); return; }

    const selected = cvList.find(cv => cv.id === selectedCvId);

    // CV online dùng slug làm cvUrl, uploaded dùng fileUrl
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

  const inputCls = `w-full px-3 py-2.5 text-[14px] border border-gray-200 rounded-xl
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
    placeholder:text-gray-300 transition-all bg-white`;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      {/* max-h + overflow để modal không vỡ khi nhiều CV */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg
        max-h-[90dvh] flex flex-col
        animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* ── Header — không scroll ── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Ứng tuyển vị trí</h2>
            <p className="text-[13px] text-gray-500 mt-0.5 line-clamp-1">{jobTitle}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl
              text-gray-400 hover:bg-gray-100 transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* ── Body — scroll khi nội dung dài ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 flex flex-col gap-4">

          {/* Chọn CV */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Chọn CV <span className="text-red-500">*</span>
            </label>

            {cvLoading ? (
              <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200
                rounded-xl text-[13px] text-gray-400">
                <Loader2 size={14} className="animate-spin shrink-0" />
                Đang tải danh sách CV...
              </div>
            ) : cvError ? (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2.5 rounded-xl
                border border-red-100">{cvError}</p>
            ) : cvList.length === 0 ? (
              <div className="px-3 py-3 border border-dashed border-gray-200 rounded-xl text-center">
                <p className="text-[13px] text-gray-400">Bạn chưa có CV nào sẵn sàng.</p>
                <a href="/candidate/profile"
                  className="text-xs text-blue-600 hover:underline mt-0.5 inline-block">
                  Tải CV lên hoặc tạo CV online →
                </a>
              </div>
            ) : (
              // max-h riêng cho list CV — scroll độc lập nếu quá nhiều CV
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-0.5">
                {cvList.map(cv => {
                  const isSelected = cv.id === selectedCvId;
                  const isOnline   = cv.type === "ONLINE";
                  return (
                    <button key={cv.id} type="button"
                      onClick={() => setSelectedCvId(cv.id)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border
                        text-left transition-all shrink-0
                        ${isSelected
                          ? "border-blue-400 bg-blue-50/60 ring-2 ring-blue-500/20"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>

                      {/* Radio */}
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center
                        justify-center shrink-0 transition-colors
                        ${isSelected ? "border-blue-500" : "border-gray-300"}`}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      </span>

                      {/* Icon */}
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                        ${isSelected ? "bg-blue-100" : "bg-gray-100"}`}>
                        {isOnline
                          ? <Globe size={15} className={isSelected ? "text-blue-600" : "text-gray-400"} />
                          : <FileText size={15} className={isSelected ? "text-blue-600" : "text-gray-400"} />}
                      </span>

                      {/* Info */}
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[13px] font-medium truncate
                            ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                            {displayTitle(cv.title)}
                          </span>
                          {cv.primary && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5
                              text-[10px] font-semibold text-yellow-700 bg-yellow-100
                              rounded-full shrink-0">
                              <Star size={9} /> CV chính
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-gray-400 block mt-0.5">
                          {isOnline ? "CV online" : "File PDF/Word"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mức lương */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Mức lương kỳ vọng
              <span className="text-gray-400 font-normal ml-1">(tuỳ chọn)</span>
            </label>
            <input type="text" placeholder="VD: 15 - 20 triệu VND"
              value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)}
              className={inputCls} />
          </div>

          {/* Thư giới thiệu */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Thư giới thiệu
              <span className="text-gray-400 font-normal ml-1">(tuỳ chọn)</span>
            </label>
            <textarea rows={4}
              placeholder="Giới thiệu ngắn về bản thân và lý do bạn phù hợp..."
              value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
              className={inputCls + " resize-none"} />
          </div>

          {submitError && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
              {submitError}
            </p>
          )}
        </div>

        {/* ── Footer — không scroll ── */}
        <div className="flex gap-2 px-6 py-4 shrink-0 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-[14px] font-medium text-gray-600 border
              border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Huỷ
          </button>
          <button onClick={handleSubmit}
            disabled={submitting || cvLoading || cvList.length === 0}
            className="flex-1 py-2.5 text-[14px] font-semibold text-white bg-blue-600
              rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors
              flex items-center justify-center gap-2">
            {submitting && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {submitting ? "Đang gửi..." : "Nộp đơn"}
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState }            from "react";
import { X, CheckCircle2 }     from "lucide-react";
import { extractErrorMessage }  from "@/lib/extractErrorMessage";

interface ApplyModalProps {
  jobTitle:  string;
  onClose:   () => void;
  onSubmit:  (cvUrl: string, coverLetter: string, expectedSalary: string) => Promise<void>;
}

export function ApplyModal({ jobTitle, onClose, onSubmit }: ApplyModalProps) {
  const [cvUrl,          setCvUrl]          = useState("");
  const [coverLetter,    setCoverLetter]    = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  const inputCls = `w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
    placeholder:text-gray-300 transition-all`;

  const handleSubmit = async () => {
    if (!cvUrl.trim()) { setError("Vui lòng nhập link CV."); return; }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(cvUrl.trim(), coverLetter, expectedSalary);
    } catch (e) {
      setError(extractErrorMessage(e, "Nộp đơn thất bại. Vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6
        animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Ứng tuyển vị trí</h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{jobTitle}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl
              text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4">

          {/* CV URL */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Link CV <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={cvUrl}
              onChange={e => setCvUrl(e.target.value)}
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Google Drive, Dropbox hoặc link trực tiếp đến file PDF
            </p>
          </div>

          {/* Expected Salary */}
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

          {/* Cover Letter */}
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

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 border
                border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Huỷ
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600
                rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors
                flex items-center justify-center gap-2">
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
"use client";
import { useState } from "react";
import {
  Sparkles, CheckCircle, AlertTriangle,
  Loader2, Wand2, Shield, Copy,
  ChevronUp, ChevronDown,
} from "lucide-react";
import { useToast } from "@/presentation/components/ui/toast";
import { AiService } from "@/application/services/AiService";
import { AiRepository } from "@/infrastructure/repositories/AiRepository";
import type { JdOptimizationResult, JdGuidelineCheckResult } from "@/domain/models/Ai";
import { extractErrorMessage } from "@/lib/extractErrorMessage";

const aiService = new AiService(new AiRepository());

// ── Constants (module-level) ──────────────────────────────────────────────────

const VIOLATION_LABELS: Record<string, string> = {
  DISCRIMINATION:      "Phân biệt đối xử",
  MISLEADING_SALARY:   "Lương không rõ ràng",
  ILLEGAL_REQUIREMENT: "Yêu cầu bất hợp pháp",
  TOXIC_LANGUAGE:      "Ngôn ngữ thiếu tôn trọng",
  UNREALISTIC_DEMAND:  "Yêu cầu không thực tế",
  SPAM:                "Nội dung spam",
  CONTACT_INFO:        "Thông tin liên hệ không hợp lệ",
  DUPLICATE:           "Bài đăng trùng lặp",
  INAPPROPRIATE:       "Nội dung không phù hợp",
  MISLEADING_INFO:     "Thông tin sai lệch",
};

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; label: string; iconColor: string }> = {
  PASS:      { bg: "bg-green-50",  text: "text-green-700",  label: "Đạt chuẩn",              iconColor: "text-green-500"  },
  CLEAN:     { bg: "bg-green-50",  text: "text-green-700",  label: "Đạt chuẩn",              iconColor: "text-green-500"  },
  WARNING:   { bg: "bg-amber-50",  text: "text-amber-700",  label: "Cần xem xét",            iconColor: "text-amber-500"  },
  VIOLATION: { bg: "bg-red-50",    text: "text-red-700",    label: "Vi phạm",                iconColor: "text-red-500"    },
  ERROR:     { bg: "bg-red-50",    text: "text-red-700",    label: "Lỗi nghiêm trọng",       iconColor: "text-red-500"    },
  CRITICAL:  { bg: "bg-red-100",   text: "text-red-800",    label: "Vi phạm nghiêm trọng",   iconColor: "text-red-600"    },
};

const SEVERE_LEVELS = ["VIOLATION", "CRITICAL", "ERROR"];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  form: {
    title: string;
    description: string;
    requirements: string;
    benefits: string;
    level: string;
    category: string;
  };
  onApplyOptimized: (result: JdOptimizationResult) => void;
}

type Tab = "optimize" | "check";

// ── Main component ────────────────────────────────────────────────────────────

export default function AiJobAssistant({ form, onApplyOptimized }: Props) {
  const toast = useToast();
  const [activeTab, setActiveTab]       = useState<Tab>("optimize");
  const [loading, setLoading]           = useState(false);
  const [expanded, setExpanded]         = useState(true);
  const [optimizedResult, setOptimized] = useState<JdOptimizationResult | null>(null);
  const [guidelineResult, setGuideline] = useState<JdGuidelineCheckResult | null>(null);

  const handleOptimize = async () => {
    if (!form.title.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập tiêu đề JD trước khi tối ưu.");
      return;
    }
    setLoading(true);
    try {
      const result = await aiService.optimizeJd({
        title: form.title, description: form.description,
        requirements: form.requirements, benefits: form.benefits,
        level: form.level, category: form.category,
      });
      setOptimized(result);
      toast.success("Đã tối ưu JD", `Điểm chất lượng: ${result.qualityScore}/100`);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e, "Không thể tối ưu JD."));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckGuidelines = async () => {
    if (!form.title.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập tiêu đề JD trước khi kiểm tra.");
      return;
    }
    setLoading(true);
    try {
      const result = await aiService.checkJdGuidelines({
        title: form.title, description: form.description,
        requirements: form.requirements, benefits: form.benefits,
      });
      setGuideline(result);
      if (result.severity === "PASS" || result.severity === "CLEAN") {
        toast.success("JD đạt chuẩn", "Không phát hiện vi phạm nào.");
      } else if (result.severity === "WARNING") {
        toast.warning("Cần xem xét", `Phát hiện ${result.violations.length} vấn đề.`);
      } else {
        toast.error("Vi phạm", `Phát hiện ${result.violations.length} vi phạm cần sửa ngay.`);
      }
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e, "Không thể kiểm tra guidelines."));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCleaned = () => {
    if (guidelineResult?.cleanedVersion) {
      navigator.clipboard.writeText(guidelineResult.cleanedVersion);
      toast.success("Đã sao chép", "Phiên bản làm sạch đã được sao chép.");
    }
  };

  const handleApply = () => {
    if (optimizedResult) {
      onApplyOptimized(optimizedResult);
      toast.success("Đã áp dụng", "JD đã được cập nhật với phiên bản tối ưu.");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden sticky top-24">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4
          bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-[16px] font-semibold text-gray-800">AI Assistant</p>
            <p className="text-[11px] text-gray-500">Tối ưu & kiểm tra JD</p>
          </div>
        </div>
        {expanded
          ? <ChevronUp size={18} className="text-gray-400" />
          : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {expanded && (
        <>
          <div className="flex border-b border-gray-100">
            {([
              { key: "optimize" as Tab, icon: Wand2,   label: "Tối ưu JD"  },
              { key: "check"    as Tab, icon: Shield,  label: "Kiểm tra"   },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3
                  text-xs font-medium transition-all border-b-2 ${
                  activeTab === key
                    ? "border-blue-500 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>

          <div className="p-4 max-h-[500px] overflow-y-auto">
            {activeTab === "optimize" && (
              <OptimizeTab
                loading={loading} result={optimizedResult}
                onOptimize={handleOptimize} onApply={handleApply}
              />
            )}
            {activeTab === "check" && (
              <CheckTab
                loading={loading} result={guidelineResult}
                onCheck={handleCheckGuidelines} onCopyCleaned={handleCopyCleaned}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Optimize Tab ──────────────────────────────────────────────────────────────

function OptimizeTab({ loading, result, onOptimize, onApply }: {
  loading: boolean;
  result: JdOptimizationResult | null;
  onOptimize: () => void;
  onApply: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-600 leading-relaxed">
        AI sẽ phân tích JD và đề xuất cải thiện để thu hút ứng viên tốt hơn.
      </p>

      {!result && (
        <button onClick={onOptimize} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5
            text-[13px] font-medium text-white bg-blue-500 hover:bg-blue-600
            rounded-xl disabled:opacity-50 transition-all">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
          {loading ? "Đang phân tích..." : "Tối ưu ngay"}
        </button>
      )}

      {result && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{result.qualityScore}</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-blue-800">Điểm chất lượng</p>
              <p className="text-[11px] text-blue-600">
                {result.qualityScore >= 80 ? "JD rất tốt"
                  : result.qualityScore >= 60 ? "Có thể cải thiện"
                  : "Cần cải thiện nhiều"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-700">Tiêu đề đã tối ưu:</p>
            <p className="text-xs text-gray-600 bg-white p-2 rounded border">{result.improvedTitle}</p>

            {result.improvedDescription && (<>
              <p className="text-xs font-semibold text-gray-700 mt-1">Mô tả đã tối ưu:</p>
              <p className="text-xs text-gray-600 bg-white p-2 rounded border max-h-32 overflow-y-auto whitespace-pre-line">
                {result.improvedDescription}
              </p>
            </>)}

            {result.improvedRequirements && (<>
              <p className="text-xs font-semibold text-gray-700 mt-1">Yêu cầu đã tối ưu:</p>
              <p className="text-xs text-gray-600 bg-white p-2 rounded border max-h-32 overflow-y-auto whitespace-pre-line">
                {result.improvedRequirements}
              </p>
            </>)}

            {result.improvedBenefits && (<>
              <p className="text-xs font-semibold text-gray-700 mt-1">Phúc lợi đã tối ưu:</p>
              <p className="text-xs text-gray-600 bg-white p-2 rounded border max-h-32 overflow-y-auto whitespace-pre-line">
                {result.improvedBenefits}
              </p>
            </>)}
          </div>

          {result.suggestions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-700">Đề xuất cải thiện:</p>
              {result.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <Sparkles size={11} className="text-blue-400 mt-0.5 shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={onApply}
            className="w-full py-2.5 text-[13px] font-medium text-white
              bg-blue-500 hover:bg-blue-600 rounded-xl transition-all">
            Áp dụng JD đã tối ưu
          </button>
          <button onClick={onOptimize} disabled={loading}
            className="text-xs text-gray-400 hover:text-gray-600 underline">
            Tối ưu lại
          </button>
        </div>
      )}
    </div>
  );
}

// ── Check Tab ─────────────────────────────────────────────────────────────────

function CheckTab({ loading, result, onCheck, onCopyCleaned }: {
  loading: boolean;
  result: JdGuidelineCheckResult | null;
  onCheck: () => void;
  onCopyCleaned: () => void;
}) {
  const cfg = result ? (SEVERITY_CONFIG[result.severity] ?? SEVERITY_CONFIG.WARNING) : null;
  const isSevere = result ? SEVERE_LEVELS.includes(result.severity) : false;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-600 leading-relaxed">
        AI sẽ kiểm tra JD có vi phạm quy tắc cộng đồng không (phân biệt đối xử, lương không rõ ràng...).
      </p>

      {!result && (
        <button onClick={onCheck} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5
            text-[13px] font-medium text-white bg-blue-500 hover:bg-blue-600
            rounded-xl disabled:opacity-50 transition-all">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
          {loading ? "Đang kiểm tra..." : "Kiểm tra ngay"}
        </button>
      )}

      {result && cfg && (
        <div className="flex flex-col gap-3">
          {/* Status card */}
          <div className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg}`}>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
              <span className="text-lg font-bold">{result.qualityScore}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-semibold ${cfg.text}`}>{cfg.label}</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">{result.overallFeedback}</p>
            </div>
          </div>

          {/* Violations */}
          {result.violations.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-700">
                Phát hiện {result.violations.length} vấn đề:
              </p>
              {result.violations.map((v, i) => (
                <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <AlertTriangle size={14}
                    className={`shrink-0 mt-0.5 ${isSevere ? "text-red-500" : "text-amber-500"}`} />
                  <div className="flex-1 text-xs">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mb-1.5 ${
                      isSevere ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {VIOLATION_LABELS[v.type] ?? v.type}
                    </span>
                    <p className="text-red-600 font-medium mb-0.5 italic">
                      &ldquo;{v.excerpt}&rdquo;
                    </p>
                    <p className="text-gray-600 mb-1">{v.explanation}</p>
                    <p className="text-blue-600 font-medium">💡 {v.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cleaned version */}
          {result.cleanedVersion && (
            <div className="flex flex-col gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-green-700">Phiên bản đề xuất:</p>
                <button onClick={onCopyCleaned}
                  className="flex items-center gap-1 text-[11px] text-green-600
                    hover:text-green-800 transition-colors">
                  <Copy size={11} /> Sao chép
                </button>
              </div>
              <p className="text-xs text-gray-700 bg-white p-2 rounded border border-green-100 whitespace-pre-line">
                {result.cleanedVersion}
              </p>
            </div>
          )}

          <button onClick={onCheck} disabled={loading}
            className="text-xs text-gray-400 hover:text-gray-600 underline">
            Kiểm tra lại
          </button>
        </div>
      )}
    </div>
  );
}
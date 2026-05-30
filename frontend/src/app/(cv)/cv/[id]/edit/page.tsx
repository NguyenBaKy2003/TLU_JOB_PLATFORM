"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CvService } from "@/application/services/CvService";
import { CvRepository } from "@/infrastructure/repositories/CvRepository";
import type {
  OnlineCVDetail,
  CVSection,
  UpdateCVSectionPayload,
  CVVisibility,
  AiOptimizeResult,
  PersonalInfoForm,
} from "@/domain/models/Cv";
import { CVEditSkeleton } from "@/presentation/components/cv/edit/CVEditSkeleton";
import { CVEditTopBar } from "@/presentation/components/cv/edit/CVEditTopBar";
import { CVSectionSidebar } from "@/presentation/components/cv/edit/CVSectionSidebar";
import { CVEditorPanel } from "@/presentation/components/cv/edit/CVEditorPanel";
import { CVPreviewPanel } from "@/presentation/components/cv/edit/CVPreviewPanel";
import { AiOptimizeModal } from "@/presentation/components/cv/edit/AiOptimizeModal";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";

const cvService = new CvService(new CvRepository());

export type EditorTab = "personal" | "section";

type MobileView = "sidebar" | "editor" | "preview";

export default function CVEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

  // ── Data ─────────────────────────────────────────────────────────────────
  const [cv, setCv] = useState<OnlineCVDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    cvService
      .getById(id)
      .then((data) => {
        setCv(data);
        setLoading(false);
      })
      .catch((err) => {
        toastError("Tải CV thất bại", extractErrorMessage(err));
        setLoading(false);
        router.push("/cv");
      });
  }, [id, router]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<EditorTab>("personal");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [mobileView, setMobileView] = useState<MobileView>("editor");

  // ── AI modal ──────────────────────────────────────────────────────────────
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [aiResult, setAiResult] = useState<AiOptimizeResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // ── Personal Info ─────────────────────────────────────────────────────────
  const handleSavePersonalInfo = useCallback(
    async (form: Parameters<typeof cvService.updatePersonalInfo>[1]) => {
      if (!cv) return;
      setSaving(true);
      try {
        const updated = await cvService.updatePersonalInfo(cv.id, form, cv);
        setCv(updated);
        setPreviewKey((k) => k + 1);
        success("Đã lưu", "Thông tin cá nhân đã được cập nhật.");
      } catch (err) {
        toastError("Lưu thất bại", extractErrorMessage(err));
      } finally {
        setSaving(false);
      }
    },
    [cv, success, toastError]
  );

  const handleUpdateTitle = useCallback(
    async (title: string) => {
      if (!cv) return;
      try {
        const updated = await cvService.updateTitle(cv.id, title, cv);
        setCv(updated);
      } catch (err) {
        toastError("Đổi tên thất bại", extractErrorMessage(err));
      }
    },
    [cv, toastError]
  );

  // ── Sections ──────────────────────────────────────────────────────────────
  const handleAddSection = useCallback(
    async (
      type: Parameters<typeof cvService.addSection>[1],
      title: string
    ) => {
      if (!cv) return;
      try {
        const s = await cvService.addSection(cv.id, type, title);
        setCv((p) => (p ? { ...p, sections: [...p.sections, s] } : p));
        setActiveSectionId(s.id);
        setActiveTab("section");
        setMobileView("editor");
        setPreviewKey((k) => k + 1);
        success("Thêm mục thành công", `Mục "${title}" đã được thêm.`);
      } catch (err) {
        toastError("Thêm mục thất bại", extractErrorMessage(err));
      }
    },
    [cv, success, toastError]
  );

  const handleUpdateSection = useCallback(
    async (sectionId: string, payload: UpdateCVSectionPayload) => {
      if (!cv) return;
      setSaving(true);
      try {
        const updated = await cvService.updateSection(cv.id, sectionId, payload);
        setCv((p) =>
          p
            ? {
                ...p,
                sections: p.sections.map((s) =>
                  s.id === sectionId ? updated : s
                ),
              }
            : p
        );
        setPreviewKey((k) => k + 1);
        // Không toast success ở đây vì hàm này được gọi liên tục khi chỉnh sửa realtime
      } catch (err) {
        toastError("Cập nhật thất bại", extractErrorMessage(err));
      } finally {
        setSaving(false);
      }
    },
    [cv, toastError]
  );

  const handleDeleteSection = useCallback(
    async (sectionId: string) => {
      if (!cv) return;
      try {
        await cvService.deleteSection(cv.id, sectionId);
        setCv((p) =>
          p
            ? { ...p, sections: p.sections.filter((s) => s.id !== sectionId) }
            : p
        );
        if (activeSectionId === sectionId) {
          setActiveSectionId(null);
          setActiveTab("personal");
        }
        setPreviewKey((k) => k + 1);
        success("Đã xóa mục", "Mục đã được xóa khỏi CV.");
      } catch (err) {
        toastError("Xóa mục thất bại", extractErrorMessage(err));
      }
    },
    [cv, activeSectionId, success, toastError]
  );

  const handleReorderSections = useCallback(
    async (sectionIds: string[]) => {
      if (!cv) return;
      const reordered = sectionIds
        .map((sid) => cv.sections.find((s) => s.id === sid))
        .filter(Boolean) as CVSection[];
      setCv((p) => (p ? { ...p, sections: reordered } : p));
      try {
        await cvService.reorderSections(cv.id, sectionIds);
        setPreviewKey((k) => k + 1);
      } catch (err) {
        toastError("Sắp xếp thất bại", extractErrorMessage(err));
      }
    },
    [cv, toastError]
  );

  const handleToggleSectionVisibility = useCallback(
    async (sectionId: string, visible: boolean) => {
      setCv((p) =>
        p
          ? {
              ...p,
              sections: p.sections.map((s) =>
                s.id === sectionId ? { ...s, visible } : s
              ),
            }
          : p
      );
      await handleUpdateSection(sectionId, { visible });
    },
    [handleUpdateSection]
  );

  // ── Lifecycle actions ─────────────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    if (!cv) return;
    try {
      const updated = await cvService.publish(cv.id);
      setCv(updated);
      setPreviewKey((k) => k + 1);
      success("Đã công khai CV", "CV của bạn hiện đã được công khai.");
    } catch (err) {
      toastError("Công khai thất bại", extractErrorMessage(err));
    }
  }, [cv, success, toastError]);

  const handleExportPdf = useCallback(async () => {
    if (!cv) return;
    setExportingPdf(true);
    try {
      const blob = await cvService.exportPdf(cv.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cv.title || "cv"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      success(
        "Xuất PDF thành công",
        `${cv.title || "CV"}.pdf đã được tải xuống.`
      );
    } catch (err) {
      toastError("Xuất PDF thất bại", extractErrorMessage(err));
    } finally {
      setExportingPdf(false);
    }
  }, [cv, success, toastError]);

  const handleImportFromProfile = useCallback(async () => {
    if (!cv) return;
    setSaving(true);
    try {
      const updated = await cvService.importFromProfile(cv.id);
      setCv(updated);
      setPreviewKey((k) => k + 1);
      success(
        "Nhập dữ liệu thành công",
        "Thông tin từ hồ sơ đã được nhập vào CV."
      );
    } catch (err) {
      toastError("Nhập dữ liệu thất bại", extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [cv, success, toastError]);

  const handleUpdateVisibility = useCallback(
    async (visibility: CVVisibility) => {
      if (!cv) return;
      try {
        const updated = await cvService.updateVisibility(cv.id, visibility, cv);
        setCv(updated);
        info(
          "Đã cập nhật quyền riêng tư",
          `Chế độ hiển thị đã được đổi thành "${visibility}".`
        );
      } catch (err) {
        toastError("Cập nhật thất bại", extractErrorMessage(err));
      }
    },
    [cv, info, toastError]
  );

  // ── AI Optimize ───────────────────────────────────────────────────────────
  const handleOpenAiModal = useCallback(() => {
    setAiResult(null);
    setAiError(null);
    setShowAiModal(true);
  }, []);

  const handleAiOptimize = useCallback(
    async (jobPostId: string) => {
      if (!cv) return;
      setAiOptimizing(true);
      setAiError(null);
      try {
        const result = await cvService.aiOptimize(cv.id, jobPostId);
        setAiResult(result);
      } catch (err) {
        // Lỗi hiển thị trong modal, không cần toast thêm
        setAiError(
          extractErrorMessage(err, "Phân tích thất bại. Vui lòng thử lại.")
        );
      } finally {
        setAiOptimizing(false);
      }
    },
    [cv]
  );

  // ── Realtime preview updates ──────────────────────────────────────────────
  const handleRealtimePersonalInfoUpdate = useCallback(
    (form: PersonalInfoForm) => {
      setCv((p) => (p ? { ...p, personalInfo: { ...p.personalInfo, ...form } } : p));
    },
    []
  );

  const handleRealtimeSectionUpdate = useCallback(
    (sectionId: string, payload: UpdateCVSectionPayload) => {
      setCv((p) =>
        p
          ? {
              ...p,
              sections: p.sections.map((s) =>
                s.id === sectionId ? { ...s, ...payload } : s
              ),
            }
          : p
      );
    },
    []
  );

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <CVEditSkeleton />;
  if (!cv) return null;

  const activeSection =
    cv.sections.find((s) => s.id === activeSectionId) ?? null;

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <CVEditTopBar
        cv={cv}
        saving={saving}
        exportingPdf={exportingPdf}
        showPreview={showPreview}
        mobileView={mobileView}
        onTogglePreview={() => setShowPreview((v) => !v)}
        onPublish={handlePublish}
        onExportPdf={handleExportPdf}
        onUpdateTitle={handleUpdateTitle}
        onUpdateVisibility={handleUpdateVisibility}
        onAiOptimize={handleOpenAiModal}
        onBack={() => router.push("/cv")}
        onMobileViewChange={setMobileView}
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile unless mobileView === "sidebar" */}
        <div
          className={`
            flex-shrink-0
            md:flex md:w-56
            ${
              mobileView === "sidebar"
                ? "flex w-full absolute inset-0 top-14 z-20"
                : "hidden"
            }
          `}
        >
          <CVSectionSidebar
            sections={cv.sections}
            activeSectionId={activeSectionId}
            activeTab={activeTab}
            onSelectPersonal={() => {
              setActiveTab("personal");
              setActiveSectionId(null);
              setMobileView("editor");
            }}
            onSelectSection={(id) => {
              setActiveSectionId(id);
              setActiveTab("section");
              setMobileView("editor");
            }}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onToggleVisibility={handleToggleSectionVisibility}
            onReorder={handleReorderSections}
          />
        </div>

        {/* Editor — hidden on mobile when showing sidebar/preview */}
        <div
          className={`
            flex-1 min-w-0 overflow-hidden
            md:flex
            ${mobileView === "editor" ? "flex" : "hidden"}
          `}
        >
          <CVEditorPanel
            cv={cv}
            activeTab={activeTab}
            activeSection={activeSection}
            saving={saving}
            onSavePersonalInfo={handleSavePersonalInfo}
            onUpdateSection={handleUpdateSection}
            onImportFromProfile={handleImportFromProfile}
            onRealtimePersonalInfoUpdate={handleRealtimePersonalInfoUpdate}
            onRealtimeSectionUpdate={handleRealtimeSectionUpdate}
          />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden flex-shrink-0 flex border-t border-slate-200 bg-white">
        {(["sidebar", "editor"] as MobileView[]).map((view) => {
          const labels: Record<MobileView, string> = {
            sidebar: "Mục",
            editor: "Chỉnh sửa",
            preview: "Xem trước",
          };
          const icons: Record<MobileView, string> = {
            sidebar: "☰",
            editor: "✏️",
            preview: "👁",
          };
          return (
            <button
              key={view}
              onClick={() => setMobileView(view)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                mobileView === view ? "text-[#3D5A80]" : "text-slate-400"
              }`}
            >
              <span className="text-base leading-none">{icons[view]}</span>
              {labels[view]}
            </button>
          );
        })}
        {/* Preview triggers the overlay */}
        <button
          onClick={() => setShowPreview(true)}
          className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold text-slate-400"
        >
          <span className="text-base leading-none">👁</span>
          Xem trước
        </button>
      </nav>

      {/* Preview full-screen overlay */}
      {showPreview && (
        <CVPreviewPanel
          cv={cv}
          refreshKey={previewKey}
          onClose={() => {
            setShowPreview(false);
            setMobileView("editor");
          }}
        />
      )}

      {/* AI Modal */}
      {showAiModal && (
        <AiOptimizeModal
          optimizing={aiOptimizing}
          result={aiResult}
          error={aiError}
          onAnalyze={handleAiOptimize}
          onClose={() => setShowAiModal(false)}
        />
      )}
    </div>
  );
}
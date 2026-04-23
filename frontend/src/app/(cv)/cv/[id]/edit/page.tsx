"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CvService } from "@/application/services/CvService";
import { CvRepository } from "@/infrastructure/repositories/CvRepository";
import type { OnlineCVDetail, CVSection, UpdateCVSectionPayload } from "@/domain/models/Cv";
import { CVEditSkeleton } from "@/presentation/components/cv/edit/CVEditSkeleton";
import { CVEditTopBar } from "@/presentation/components/cv/edit/CVEditTopBar";
import { CVSectionSidebar } from "@/presentation/components/cv/edit/CVSectionSidebar";
import { CVEditorPanel } from "@/presentation/components/cv/edit/CVEditorPanel";
import { CVPreviewPanel } from "@/presentation/components/cv/edit/CVPreviewPanel";


const cvService = new CvService(new CvRepository());

export type EditorTab = "personal" | "section";

export default function CVEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [cv, setCv] = useState<OnlineCVDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>("personal");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Load CV
  useEffect(() => {
    if (!id) return;
    cvService.getById(id).then((data) => {
      setCv(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      router.push("/cv");
    });
  }, [id, router]);

  // ── Personal Info ──────────────────────────────────────────────────────────

  const handleSavePersonalInfo = useCallback(async (form: Parameters<typeof cvService.updatePersonalInfo>[1]) => {
    if (!cv) return;
    setSaving(true);
    try {
      // Truyền cv hiện tại để service merge đủ title/templateId/visibility
      const updated = await cvService.updatePersonalInfo(cv.id, form, cv);
      setCv(updated);
    } finally {
      setSaving(false);
    }
  }, [cv]);

  const handleUpdateTitle = useCallback(async (title: string) => {
    if (!cv) return;
    const updated = await cvService.updateTitle(cv.id, title, cv);
    setCv(updated);
  }, [cv]);

  // ── Sections ───────────────────────────────────────────────────────────────

  const handleAddSection = useCallback(async (type: Parameters<typeof cvService.addSection>[1], title: string) => {
    if (!cv) return;
    const newSection = await cvService.addSection(cv.id, type, title);
    setCv((prev) => prev ? { ...prev, sections: [...prev.sections, newSection] } : prev);
    setActiveSectionId(newSection.id);
    setActiveTab("section");
  }, [cv]);

  const handleUpdateSection = useCallback(async (sectionId: string, payload: UpdateCVSectionPayload) => {
    if (!cv) return;
    setSaving(true);
    try {
      const updated = await cvService.updateSection(cv.id, sectionId, payload);
      setCv((prev) => prev ? {
        ...prev,
        sections: prev.sections.map((s) => s.id === sectionId ? updated : s),
      } : prev);
    } finally {
      setSaving(false);
    }
  }, [cv]);

  const handleDeleteSection = useCallback(async (sectionId: string) => {
    if (!cv) return;
    await cvService.deleteSection(cv.id, sectionId);
    setCv((prev) => prev ? { ...prev, sections: prev.sections.filter((s) => s.id !== sectionId) } : prev);
    if (activeSectionId === sectionId) {
      setActiveSectionId(null);
      setActiveTab("personal");
    }
  }, [cv, activeSectionId]);

  const handleReorderSections = useCallback(async (sectionIds: string[]) => {
    if (!cv) return;
    // Optimistic update
    const reordered = sectionIds
      .map((sid) => cv.sections.find((s) => s.id === sid))
      .filter(Boolean) as CVSection[];
    setCv((prev) => prev ? { ...prev, sections: reordered } : prev);
    await cvService.reorderSections(cv.id, sectionIds);
  }, [cv]);

  const handleToggleSectionVisibility = useCallback(async (sectionId: string, visible: boolean) => {
    await handleUpdateSection(sectionId, { visible });
  }, [handleUpdateSection]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  const handlePublish = useCallback(async () => {
    if (!cv) return;
    const updated = await cvService.publish(cv.id);
    setCv(updated);
  }, [cv]);

  const handleExportPdf = useCallback(async () => {
    if (!cv) return;
    setExportingPdf(true);
    try {
      const url = await cvService.exportPdf(cv.id);
    } finally {
      setExportingPdf(false);
    }
  }, [cv]);

  const handleImportFromProfile = useCallback(async () => {
    if (!cv) return;
    setSaving(true);
    try {
      const updated = await cvService.importFromProfile(cv.id);
      setCv(updated);
    } finally {
      setSaving(false);
    }
  }, [cv]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <CVEditSkeleton />;
  if (!cv) return null;

  const activeSection = cv.sections.find((s) => s.id === activeSectionId) ?? null;

  return (
    <div className="h-screen flex flex-col bg-[#F0EEE9] overflow-hidden">
      {/* Top bar */}
      <CVEditTopBar
        cv={cv}
        saving={saving}
        exportingPdf={exportingPdf}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((v) => !v)}
        onPublish={handlePublish}
        onExportPdf={handleExportPdf}
        onUpdateTitle={handleUpdateTitle}
        onBack={() => router.push("/cv")}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section sidebar */}
        <CVSectionSidebar
          sections={cv.sections}
          activeSectionId={activeSectionId}
          activeTab={activeTab}
          onSelectPersonal={() => { setActiveTab("personal"); setActiveSectionId(null); }}
          onSelectSection={(id) => { setActiveSectionId(id); setActiveTab("section"); }}
          onAddSection={handleAddSection}
          onDeleteSection={handleDeleteSection}
          onToggleVisibility={handleToggleSectionVisibility}
          onReorder={handleReorderSections}
        />

        {/* Center: Editor panel */}
        <CVEditorPanel
          cv={cv}
          activeTab={activeTab}
          activeSection={activeSection}
          saving={saving}
          onSavePersonalInfo={handleSavePersonalInfo}
          onUpdateSection={handleUpdateSection}
          onImportFromProfile={handleImportFromProfile}
        />

        {/* Right: Preview panel (collapsible) */}
        {showPreview && (
          <CVPreviewPanel cv={cv} />
        )}
      </div>
    </div>
  );
}
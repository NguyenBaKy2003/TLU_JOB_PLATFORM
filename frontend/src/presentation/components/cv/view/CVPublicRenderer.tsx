// presentation/components/cv/view/CVPublicRenderer.tsx
"use client";

import type { OnlineCVDetail, UpdateCVSectionPayload } from "@/domain/models/Cv";
import { CVEditPanel } from "./CVEditPanel";
import { CVPreviewPane } from "./CVPreviewPane";

interface Props {
  cv: OnlineCVDetail;
  previewHtml: string;
  editable: boolean;
  saving: boolean;
  onUpdatePersonalInfo: (field: string, value: string) => void;
  onUpdateSection: (sectionId: string, payload: UpdateCVSectionPayload) => Promise<void>;
}

export function CVPublicRenderer({
  cv, previewHtml, editable, saving,
  onUpdatePersonalInfo, onUpdateSection
}: Props) {
  // Không phải owner → chỉ hiển thị preview
  if (!editable) {
    return (
      <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "32px" }}>
        <CVPreviewPane html={previewHtml} />
      </div>
    );
  }

  // Owner → split panel: form trái + preview phải
  return (
    <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", height: "100vh", overflow: "hidden" }}>
      <CVEditPanel
        cv={cv}
        saving={saving}
        onUpdatePersonalInfo={onUpdatePersonalInfo}
        onUpdateSection={onUpdateSection}
      />
      <div style={{ background: "#e5e7eb", overflow: "auto", padding: "24px" }}>
        <CVPreviewPane html={previewHtml} />
      </div>
    </div>
  );
}
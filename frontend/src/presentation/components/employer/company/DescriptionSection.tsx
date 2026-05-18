// src/presentation/components/company-profile/DescriptionSection.tsx
"use client";
import { useState, useEffect } from "react";
import { FileText, Check, X }  from "lucide-react";
import { CompanySectionWrapper } from "./CompanySectionWrapper";
import type { CompanyProfile, UpdateCompanyPayload } from "@/domain/models/Company";

const MAX = 2000;

interface Props {
  profile: CompanyProfile;
  saving:  boolean;
  error?:  string;
  onSave:  (payload: UpdateCompanyPayload) => Promise<void>;
}

export function DescriptionSection({ profile, saving, error, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(profile.description ?? "");

  useEffect(() => {
    if (!editing) setDraft(profile.description ?? "");
  }, [profile, editing]);

  const handleSave = async () => {
    await onSave({ description: draft || undefined });
    setEditing(false);
  };

  return (
    <CompanySectionWrapper title="Mô tả công ty" icon={<FileText size={16} />}
      onEdit={() => setEditing(true)} editing={editing}>
      {error && <p className="mb-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

      {editing ? (
        <>
          <div className="relative">
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value.slice(0, MAX))}
              rows={8}
              placeholder="Mô tả về công ty, văn hóa, sứ mệnh và tầm nhìn..."
              className="w-full px-3 py-2.5 text-[16px] border border-gray-200 rounded-xl bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                placeholder:text-gray-300 text-gray-800 resize-none transition-all pr-16"
            />
            <span className="absolute bottom-3 right-3 text-[11px] text-gray-400">
              {draft.length}/{MAX}
            </span>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => { setDraft(profile.description ?? ""); setEditing(false); }}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-[16px] font-medium text-gray-600
                bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors">
              <X size={14} /> Hủy
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-[16px] font-medium text-white
                bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving
                ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Check size={14} />}
              Lưu
            </button>
          </div>
        </>
      ) : (
        <p className={`text-[16px] leading-relaxed whitespace-pre-line ${
          profile.description ? "text-gray-700" : "text-gray-400 italic"
        }`}>
          {profile.description || "Chưa có mô tả. Hãy giới thiệu về công ty của bạn."}
        </p>
      )}
    </CompanySectionWrapper>
  );
}
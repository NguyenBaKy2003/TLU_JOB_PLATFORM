"use client";

import { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import type { CVTemplate } from "@/domain/models/Cv";

interface Props {
  templates: CVTemplate[];
  creating: boolean;
  onClose: () => void;
  onCreate: (title: string, templateId: string) => void;
}

export function CreateCVModal({ templates, creating, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templates[0]?.id ?? "");
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    onCreate(title, selectedTemplate);
  };

  const canSubmit = selectedTemplate && !creating;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tạo CV mới</h2>
            <p className="text-xs text-gray-500 mt-0.5">Chọn template và đặt tên cho CV</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* CV Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Tiêu đề CV
              </label>
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: CV Frontend Developer 2025"
                className="
                  w-full px-4 py-2.5 text-[16px] text-gray-900
                  border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#3D5A80]/30 focus:border-[#3D5A80]
                  placeholder:text-gray-300 transition-all
                "
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Để trống sẽ dùng tên template làm tiêu đề mặc định
              </p>
            </div>

            {/* Template selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2.5 uppercase tracking-wide">
                Chọn template
              </label>

              {templates.length === 0 ? (
                <p className="text-[16px] text-gray-400 py-6 text-center">Không có template khả dụng</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {templates.map((tpl) => (
                    <TemplateCard
                      key={tpl.id}
                      template={tpl}
                      selected={selectedTemplate === tpl.id}
                      onSelect={() => setSelectedTemplate(tpl.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="px-4 py-2 text-[16px] font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="
                flex items-center gap-2 px-5 py-2.5
                bg-[#3D5A80] hover:bg-[#2E4565]
                text-white text-[16px] font-semibold rounded-xl
                transition-all duration-150 shadow-sm
                disabled:opacity-50 disabled:cursor-not-allowed
                active:scale-95
              "
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo CV"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Template card ──────────

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: CVTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        relative group text-left rounded-xl overflow-hidden border-2 transition-all duration-150
        ${selected
          ? "border-[#3D5A80] shadow-md shadow-[#3D5A80]/10"
          : "border-gray-200 hover:border-gray-300"
        }
      `}
    >
      {/* Thumbnail */}
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="space-y-1.5 w-3/4 opacity-30">
            <div className="h-2 bg-gray-400 rounded-full w-3/4 mx-auto" />
            <div className="h-1 bg-gray-400 rounded-full" />
            <div className="h-1 bg-gray-400 rounded-full w-5/6" />
            <div className="h-1 bg-gray-400 rounded-full w-4/6" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className={`px-2.5 py-2 text-center ${selected ? "bg-[#3D5A80]" : "bg-white"}`}>
        <p className={`text-[11px] font-semibold truncate ${selected ? "text-white" : "text-gray-700"}`}>
          {template.name}
        </p>
        {template.premium && (
          <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wide">Premium</span>
        )}
      </div>

      {/* Selected check */}
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-5 h-5 text-[#3D5A80] fill-white" />
        </div>
      )}
    </button>
  );
}
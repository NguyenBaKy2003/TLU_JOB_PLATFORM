"use client";

import { useState, useRef } from "react";
import {
  User, Briefcase, GraduationCap, Zap, FolderKanban,
  Award, Languages, Trophy, Plus, GripVertical,
  Trash2, X, Link2,
} from "lucide-react";
import type { CVSection, SectionType } from "@/domain/models/Cv";
import { SECTION_TYPE_LABELS } from "@/domain/models/Cv";

// ── Icon & color maps ──────────────────────────────────────────────────────

const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  SUMMARY:     <User       className="w-3.5 h-3.5" />,
  EXPERIENCE:  <Briefcase  className="w-3.5 h-3.5" />,
  EDUCATION:   <GraduationCap className="w-3.5 h-3.5" />,
  SKILL:       <Zap        className="w-3.5 h-3.5" />,
  PROJECT:     <FolderKanban className="w-3.5 h-3.5" />,
  CERTIFICATE: <Award      className="w-3.5 h-3.5" />,
  LANGUAGE:    <Languages  className="w-3.5 h-3.5" />,
  AWARD:       <Trophy     className="w-3.5 h-3.5" />,
  SOCIAL_LINK: <Link2      className="w-3.5 h-3.5" />,
  CUSTOM:      <Plus       className="w-3.5 h-3.5" />,
};

const SECTION_COLORS: Record<SectionType, string> = {
  SUMMARY:     "bg-blue-100   text-blue-600",
  EXPERIENCE:  "bg-purple-100 text-purple-600",
  EDUCATION:   "bg-teal-100   text-teal-600",
  SKILL:       "bg-amber-100  text-amber-600",
  PROJECT:     "bg-indigo-100 text-indigo-600",
  CERTIFICATE: "bg-orange-100 text-orange-600",
  LANGUAGE:    "bg-green-100  text-green-600",
  AWARD:       "bg-pink-100   text-pink-600",
  SOCIAL_LINK: "bg-sky-100    text-sky-600",
  CUSTOM:      "bg-slate-100  text-slate-600",
};

// ── Add section picker ─────────────────────────────────────────────────────

const ALL_SECTION_TYPES = Object.keys(SECTION_TYPE_LABELS) as SectionType[];

function AddSectionPicker({
  onAdd,
}: {
  onAdd: (type: SectionType, title: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          w-full flex items-center justify-center gap-2
          py-2.5 text-xs font-semibold text-[#3D5A80]
          border-2 border-dashed border-[#3D5A80]/25
          hover:border-[#3D5A80]/50 hover:bg-[#3D5A80]/5
          rounded-xl transition-all
        "
      >
        <Plus className="w-3.5 h-3.5" />
        Thêm mục
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-30 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Chọn loại mục
              </p>
              <button
                onClick={() => setOpen(false)}
                className="p-0.5 rounded hover:bg-slate-100 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="py-1.5 max-h-64 overflow-y-auto">
              {ALL_SECTION_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onAdd(type, SECTION_TYPE_LABELS[type]);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <span
                    className={`p-1.5 rounded-lg flex-shrink-0 ${SECTION_COLORS[type]}`}
                  >
                    {SECTION_ICONS[type]}
                  </span>
                  {SECTION_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Section row ────────────────────────────────────────────────────────────

interface SectionRowProps {
  section:            CVSection;
  active:             boolean;
  onSelect:           () => void;
  onDelete:           () => void;
  onToggleVisibility: (visible: boolean) => void;
  dragHandleProps?:   React.HTMLAttributes<HTMLDivElement>;
}

function SectionRow({
  section,
  active,
  onSelect,
  onDelete,
  onToggleVisibility,
  dragHandleProps,
}: SectionRowProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onSelect}
      className={`
        group flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer
        transition-all select-none
        ${
          active
            ? "bg-[#3D5A80] text-white shadow-sm shadow-[#3D5A80]/20"
            : "hover:bg-slate-100 text-slate-700"
        }
        ${!section.visible && !active ? "opacity-50" : ""}
      `}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className={`flex-shrink-0 cursor-grab active:cursor-grabbing transition-opacity ${
          showActions || active ? "opacity-100" : "opacity-0"
        } ${active ? "text-white/40" : "text-slate-300"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Icon */}
      <span
        className={`flex-shrink-0 p-1 rounded-lg ${
          active ? "bg-white/20" : SECTION_COLORS[section.type]
        }`}
      >
        {SECTION_ICONS[section.type]}
      </span>

      {/* Title */}
      <span
        className={`text-xs font-medium flex-1 truncate ${
          active ? "text-white" : "text-slate-700"
        }`}
      >
        {section.title}
      </span>

      {/* Actions */}
      <div
        className={`flex items-center gap-0.5 transition-opacity ${
          showActions || active ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onDelete}
          className={`p-1 rounded-lg transition-colors ${
            active
              ? "hover:bg-red-400/30 text-white/60"
              : "hover:bg-red-50 text-slate-400 hover:text-red-500"
          }`}
          title="Xóa"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ── Main sidebar ───────────────────────────────────────────────────────────

interface Props {
  sections:           CVSection[];
  activeSectionId:    string | null;
  activeTab:          "personal" | "section";
  onSelectPersonal:   () => void;
  onSelectSection:    (id: string) => void;
  onAddSection:       (type: SectionType, title: string) => void;
  onDeleteSection:    (id: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onReorder:          (ids: string[]) => void;
}

export function CVSectionSidebar({
  sections,
  activeSectionId,
  activeTab,
  onSelectPersonal,
  onSelectSection,
  onAddSection,
  onDeleteSection,
  onToggleVisibility,
  onReorder,
}: Props) {
  const dragItem     = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (i: number) => { dragItem.current = i; };
  const handleDragEnter = (i: number) => { dragOverItem.current = i; };
  const handleDragEnd   = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const reordered = [...sections];
    const [moved]   = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, moved);
    onReorder(reordered.map((s) => s.id));
    dragItem.current     = null;
    dragOverItem.current = null;
  };

  return (
    <aside className="w-full md:w-56 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Cấu trúc CV
        </p>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
        {/* Personal info */}
        <div
          onClick={onSelectPersonal}
          className={`
            flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all
            ${
              activeTab === "personal"
                ? "bg-[#3D5A80] text-white shadow-sm shadow-[#3D5A80]/20"
                : "hover:bg-slate-100 text-slate-700"
            }
          `}
        >
          <span
            className={`flex-shrink-0 p-1 rounded-lg ${
              activeTab === "personal"
                ? "bg-white/20"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            <User className="w-3.5 h-3.5" />
          </span>
          <span
            className={`text-xs font-semibold ${
              activeTab === "personal" ? "text-white" : "text-slate-700"
            }`}
          >
            Thông tin cá nhân
          </span>
        </div>

        {/* Sections label */}
        {sections.length > 0 && (
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 px-2.5 pt-3 pb-1">
            Nội dung
          </p>
        )}

        {/* Section rows */}
        {sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            <SectionRow
              section={section}
              active={activeSectionId === section.id}
              onSelect={() => onSelectSection(section.id)}
              onDelete={() => onDeleteSection(section.id)}
              onToggleVisibility={(visible) =>
                onToggleVisibility(section.id, visible)
              }
              dragHandleProps={{
                draggable: true,
                onDragStart: () => handleDragStart(index),
              }}
            />
          </div>
        ))}

        {/* Empty state */}
        {sections.length === 0 && (
          <div className="text-center py-8 px-3">
            <p className="text-xs text-slate-400">Chưa có mục nào.</p>
            <p className="text-[11px] text-slate-300 mt-1">
              Nhấn "Thêm mục" bên dưới.
            </p>
          </div>
        )}
      </div>

      {/* Add section */}
      <div className="p-2.5 border-t border-slate-100 flex-shrink-0">
        <AddSectionPicker onAdd={onAddSection} />
      </div>
    </aside>
  );
}
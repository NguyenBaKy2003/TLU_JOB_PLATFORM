"use client";

import { useState, useRef } from "react";
import {
  User, Briefcase, GraduationCap, Zap, FolderKanban,
  Award, Languages, Trophy, Plus, GripVertical,
  Eye, EyeOff, Trash2, ChevronDown,
} from "lucide-react";
import type { CVSection, SectionType } from "@/domain/models/Cv";
import { SECTION_TYPE_LABELS } from "@/domain/models/Cv";

// ── Section type icon mapping ────

const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  SUMMARY:     <User className="w-3.5 h-3.5" />,
  EXPERIENCE:  <Briefcase className="w-3.5 h-3.5" />,
  EDUCATION:   <GraduationCap className="w-3.5 h-3.5" />,
  SKILL:       <Zap className="w-3.5 h-3.5" />,
  PROJECT:     <FolderKanban className="w-3.5 h-3.5" />,
  CERTIFICATE: <Award className="w-3.5 h-3.5" />,
  LANGUAGE:    <Languages className="w-3.5 h-3.5" />,
  AWARD:       <Trophy className="w-3.5 h-3.5" />,
  CUSTOM:      <Plus className="w-3.5 h-3.5" />,
};

const SECTION_COLORS: Record<SectionType, string> = {
  SUMMARY:     "bg-blue-100 text-blue-600",
  EXPERIENCE:  "bg-purple-100 text-purple-600",
  EDUCATION:   "bg-teal-100 text-teal-600",
  SKILL:       "bg-amber-100 text-amber-600",
  PROJECT:     "bg-indigo-100 text-indigo-600",
  CERTIFICATE: "bg-orange-100 text-orange-600",
  LANGUAGE:    "bg-green-100 text-green-600",
  AWARD:       "bg-pink-100 text-pink-600",
  CUSTOM:      "bg-gray-100 text-gray-600",
};

// ── Add Section Picker ────

const ALL_SECTION_TYPES = Object.keys(SECTION_TYPE_LABELS) as SectionType[];

interface AddSectionPickerProps {
  onAdd: (type: SectionType, title: string) => void;
}

function AddSectionPicker({ onAdd }: AddSectionPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          w-full flex items-center justify-center gap-2
          py-2.5 text-xs font-semibold text-[#3D5A80]
          border-2 border-dashed border-[#3D5A80]/30
          hover:border-[#3D5A80]/60 hover:bg-[#3D5A80]/5
          rounded-xl transition-all
        "
      >
        <Plus className="w-3.5 h-3.5" />
        Thêm mục
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
            Chọn loại mục
          </p>
          <div className="py-1 max-h-64 overflow-y-auto">
            {ALL_SECTION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => {
                  onAdd(type, SECTION_TYPE_LABELS[type]);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[16px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <span className={`p-1.5 rounded-lg ${SECTION_COLORS[type]}`}>
                  {SECTION_ICONS[type]}
                </span>
                {SECTION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

// ── Section Row ───────────

interface SectionRowProps {
  section: CVSection;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleVisibility: (visible: boolean) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

function SectionRow({
  section, active, onSelect, onDelete, onToggleVisibility, dragHandleProps,
}: SectionRowProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`
        group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all
        ${active
          ? "bg-[#3D5A80] text-white shadow-sm"
          : "hover:bg-gray-100 text-gray-700"
        }
        ${!section.visible ? "opacity-50" : ""}
      `}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className={`flex-shrink-0 cursor-grab active:cursor-grabbing ${active ? "text-white/50" : "text-gray-300"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Icon */}
      <span className={`flex-shrink-0 p-1 rounded-lg ${active ? "bg-white/20" : SECTION_COLORS[section.type]}`}>
        {SECTION_ICONS[section.type]}
      </span>

      {/* Title */}
      <span className={`text-xs font-medium flex-1 truncate ${active ? "text-white" : ""}`}>
        {section.title}
      </span>

      {/* Actions */}
      {(hover || active) && (
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleVisibility(!section.visible)}
            className={`p-1 rounded-lg transition-colors ${active ? "hover:bg-white/20 text-white/70" : "hover:bg-gray-200 text-gray-400"}`}
            title={section.visible ? "Ẩn mục này" : "Hiện mục này"}
          >
            {section.visible
              ? <Eye className="w-3 h-3" />
              : <EyeOff className="w-3 h-3" />
            }
          </button>
          <button
            onClick={onDelete}
            className={`p-1 rounded-lg transition-colors ${active ? "hover:bg-red-400/30 text-white/70" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}
            title="Xóa mục"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Sidebar ──────────

interface Props {
  sections: CVSection[];
  activeSectionId: string | null;
  activeTab: "personal" | "section";
  onSelectPersonal: () => void;
  onSelectSection: (id: string) => void;
  onAddSection: (type: SectionType, title: string) => void;
  onDeleteSection: (id: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onReorder: (ids: string[]) => void;
}

export function CVSectionSidebar({
  sections, activeSectionId, activeTab,
  onSelectPersonal, onSelectSection,
  onAddSection, onDeleteSection, onToggleVisibility, onReorder,
}: Props) {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, moved);
    onReorder(reordered.map((s) => s.id));
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Cấu trúc CV
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Personal info item */}
        <div
          onClick={onSelectPersonal}
          className={`
            flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all
            ${activeTab === "personal"
              ? "bg-[#3D5A80] text-white shadow-sm"
              : "hover:bg-gray-100 text-gray-700"
            }
          `}
        >
          <span className={`flex-shrink-0 p-1 rounded-lg ${activeTab === "personal" ? "bg-white/20" : "bg-blue-100 text-blue-600"}`}>
            <User className="w-3.5 h-3.5" />
          </span>
          <span className={`text-xs font-semibold ${activeTab === "personal" ? "text-white" : ""}`}>
            Thông tin cá nhân
          </span>
        </div>

        {/* Divider */}
        {sections.length > 0 && (
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 px-3 pt-2 pb-0.5">
            Các mục nội dung
          </p>
        )}

        {/* Section list with drag & drop */}
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
              onToggleVisibility={(visible) => onToggleVisibility(section.id, visible)}
              dragHandleProps={{
                draggable: true,
                onDragStart: () => handleDragStart(index),
              }}
            />
          </div>
        ))}
      </div>

      {/* Add section */}
      <div className="p-3 border-t border-gray-100">
        <AddSectionPicker onAdd={onAddSection} />
      </div>
    </aside>
  );
}
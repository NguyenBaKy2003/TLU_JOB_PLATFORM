"use client";

import { BookOpen, Plus, Trash2 }  from "lucide-react";
import { useState }                from "react";
import SectionWrapper              from "./SectionWrapper";
import { CandidateProfile,
         EducationPayload,
         Education, Degree }       from "@/domain/models/Candidate";

const MAX = 512;

const DEGREES: { label: string; value: Degree }[] = [
  { label: "Cử nhân",  value: "BACHELOR" },
  { label: "Thạc sĩ",  value: "MASTER"   },
  { label: "Tiến sĩ",  value: "PHD"      },
  { label: "Khác",     value: "OTHER"    },
];
const DEGREE_LABELS: Record<string, string> = {
  BACHELOR: "Bachelor's degree", MASTER: "Master's degree",
  PHD: "Tiến sĩ", OTHER: "Khác",
};

interface EduFormState {
  school:      string; major: string; degree: string;
  startDate:   string; endDate: string;
  current:     boolean; description: string;
}

function eduToForm(e: Education): EduFormState {
  return {
    school: e.school, major: e.major ?? "", degree: e.degree,
    startDate: e.startDate ?? "", endDate: e.endDate ?? "",
    current: !e.endDate, description: e.description ?? "",
  };
}

function toPayload(s: EduFormState): EducationPayload {
  return {
    school:      s.school,
    major:       s.major       || undefined,
    degree:      s.degree      || undefined,
    startDate:   s.startDate   || undefined,
    endDate:     s.current ? undefined : s.endDate || undefined,
    description: s.description || undefined,
  };
}

function EduForm({ value, onChange }: { value: EduFormState; onChange: (v: EduFormState) => void }) {
  const set = (key: keyof EduFormState) => (val: string | boolean) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/40">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] text-gray-400 uppercase tracking-wide mb-1">Tên trường</label>
          <input value={value.school} onChange={(e) => set("school")(e.target.value)}
            className="w-full px-3 py-2 text-[16px] border border-gray-200 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-400 uppercase tracking-wide mb-1">Chuyên ngành</label>
          <input value={value.major} onChange={(e) => set("major")(e.target.value)}
            className="w-full px-3 py-2 text-[16px] border border-gray-200 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-gray-400 uppercase tracking-wide mb-2">Trình độ học vấn</label>
        <div className="flex flex-wrap gap-4">
          {DEGREES.map((d) => (
            <label key={d.value} className="flex items-center gap-1.5 cursor-pointer"
              onClick={() => set("degree")(d.value)}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                transition-colors ${value.degree === d.value ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                {value.degree === d.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-[16px] text-gray-700">{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {([{ label: "Thời gian bắt đầu", key: "startDate" as const }, { label: "Thời gian kết thúc", key: "endDate" as const }]).map(({ label, key }) => (
          <div key={key}>
            <label className="block text-[11px] text-gray-400 uppercase tracking-wide mb-1">{label}</label>
            <input type="date" value={value[key] as string}
              disabled={key === "endDate" && value.current}
              onChange={(e) => set(key)(e.target.value)}
              className="w-full px-3 py-2 text-[16px] border border-gray-200 rounded-lg bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400" />
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 cursor-pointer" onClick={() => set("current")(!value.current)}>
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
          ${value.current ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
          {value.current && <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M2 6l3 3 5-5"
            stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
        </div>
        <span className="text-[16px] text-gray-600">Vẫn đang học</span>
      </label>

      <div>
        <label className="block text-[11px] text-gray-400 uppercase tracking-wide mb-1">Miêu tả</label>
        <div className="relative">
          <textarea value={value.description} rows={3}
            onChange={(e) => set("description")(e.target.value.slice(0, MAX))}
            className="w-full px-3 py-2.5 text-[16px] border border-gray-200 rounded-lg resize-none bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
          <span className="absolute bottom-2.5 right-3 text-[11px] text-gray-400">{value.description.length}/{MAX}</span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  profile:  CandidateProfile;
  saving:   boolean;
  error?:   string;
  onAdd:    (data: EducationPayload) => Promise<void>;
  onUpdate: (id: string, data: EducationPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function EducationSection({ profile, saving, error, onAdd, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<EduFormState>({
    school: "", major: "", degree: "BACHELOR",
    startDate: "", endDate: "", current: false, description: "",
  });

  const startEdit = (edu: Education) => { setEditingId(edu.id); setFormState(eduToForm(edu)); };
  const startAdd  = () => {
    setEditingId("new");
    setFormState({ school: "", major: "", degree: "BACHELOR", startDate: "", endDate: "", current: false, description: "" });
  };

  const handleSave = async () => {
    const payload = toPayload(formState);
    if (editingId === "new") await onAdd(payload);
    else if (editingId)      await onUpdate(editingId, payload);
    setEditingId(null);
  };

  return (
    <SectionWrapper title="Học vấn" icon={<BookOpen size={16} />}
      onEdit={editingId ? undefined : startAdd} editing={!!editingId}>
      {error && <p className="mb-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex flex-col gap-3">
        {profile.educations.map((edu) => (
          editingId === edu.id ? (
            <div key={edu.id}>
              <EduForm value={formState} onChange={setFormState} />
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setEditingId(null)} disabled={saving}
                  className="px-4 py-2 text-[16px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Hủy</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-2 text-[16px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  {saving && <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}Lưu</button>
              </div>
            </div>
          ) : (
            <div key={edu.id}
              className="flex items-start justify-between py-3 px-4 rounded-xl border border-gray-100
                hover:border-gray-200 hover:bg-gray-50/60 transition-colors group">
              <div>
                <p className="text-[16px] font-medium text-gray-800">
                  {edu.degree ? `${DEGREE_LABELS[edu.degree] ?? edu.degree} of ${edu.major ?? ""}` : edu.school}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {edu.school} | {edu.startDate}–{edu.endDate ?? "Present"}
                </p>
              </div>
              <div className="flex gap-1 shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(edu)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/></svg>
                </button>
                <button onClick={() => onDelete(edu.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        ))}

        {editingId === "new" && (
          <div>
            <EduForm value={formState} onChange={setFormState} />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setEditingId(null)} disabled={saving}
                className="px-4 py-2 text-[16px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Hủy</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-[16px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}Lưu</button>
            </div>
          </div>
        )}

        {!editingId && (
          <button onClick={startAdd}
            className="flex items-center gap-1.5 text-[16px] font-medium text-blue-600 hover:text-blue-700 transition-colors mt-1">
            <Plus size={15} /> Thêm học vấn
          </button>
        )}
      </div>
    </SectionWrapper>
  );
}
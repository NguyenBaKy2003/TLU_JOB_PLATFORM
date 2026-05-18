"use client";

import { Briefcase, X, Plus }   from "lucide-react";
import { useState }             from "react";
import SectionWrapper           from "./SectionWrapper";
import { CandidateProfile,
         UpdateProfilePayload,
         ContractType, JobLevel } from "@/domain/models/Candidate";
import { SectionKey }           from "@/presentation/hooks/useCandidateProfile";

const CONTRACT_OPTIONS: { label: string; value: ContractType }[] = [
  { label: "Full-time",     value: "FULL_TIME"  },
  { label: "Part-time",     value: "PART_TIME"  },
  { label: "Từ xa",         value: "REMOTE"     },
  { label: "Thực tập sinh", value: "INTERNSHIP" },
];
const LEVEL_OPTIONS: { label: string; value: JobLevel }[] = [
  { label: "Fresher",       value: "FRESHER"   },
  { label: "Junior",        value: "JUNIOR"    },
  { label: "Senior",        value: "SENIOR"    },
  { label: "Quản lý",       value: "MANAGER"   },
  { label: "Giám đốc",      value: "DIRECTOR"  },
];
const LABEL = <T extends string>(opts: { label: string; value: T }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? v;

interface Draft {
  industry: string; minSalary: string; currency: string;
  contractTypes: string[]; levels: string[];
}

interface Props {
  profile: CandidateProfile;
  saving:  boolean;
  error?:  string;
  onSave:  (section: SectionKey, payload: UpdateProfilePayload) => Promise<void>;
}

export default function JobExpectationSection({ profile, saving, error, onSave }: Props) {
  const desired = profile.desiredJobs[0];

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => ({
    industry:      desired?.industry ?? "",
    minSalary:     desired?.minSalary ? String(desired.minSalary) : "",
    currency:      desired?.currency  ?? "VND",
    contractTypes: desired?.contractTypes ?? [],
    levels:        desired?.levels        ?? [],
  }));

  const toggle = (key: "contractTypes" | "levels", val: string) =>
    setDraft((p) => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter((x) => x !== val) : [...p[key], val],
    }));

  const handleSave = async () => {
    await onSave("jobExpectation", {
      desiredJob: {
        industry:      draft.industry      || undefined,
        minSalary:     draft.minSalary ? Number(draft.minSalary) : undefined,
        currency:      draft.currency      || undefined,
        contractTypes: draft.contractTypes,
        levels:        draft.levels,
      },
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft({
      industry:      desired?.industry ?? "",
      minSalary:     desired?.minSalary ? String(desired.minSalary) : "",
      currency:      desired?.currency  ?? "VND",
      contractTypes: desired?.contractTypes ?? [],
      levels:        desired?.levels        ?? [],
    });
    setEditing(false);
  };

  return (
    <SectionWrapper title="Kỳ vọng công việc" icon={<Briefcase size={16} />}
      onEdit={() => setEditing(true)} editing={editing}>
      {error && <p className="mb-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {editing ? (
        <>
          <div className="flex flex-col gap-5 mb-4">
            <div>
              <label className="block text-[11px] text-gray-400 uppercase tracking-wide mb-1">Ngành nghề</label>
              <input value={draft.industry} onChange={(e) => setDraft((p) => ({ ...p, industry: e.target.value }))}
                className="w-full px-3 py-2 text-[16px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-gray-400 uppercase tracking-wide mb-1">Mức lương tối thiểu</label>
                <input type="number" value={draft.minSalary}
                  onChange={(e) => setDraft((p) => ({ ...p, minSalary: e.target.value }))}
                  placeholder="VD: 30000000"
                  className="w-full px-3 py-2 text-[16px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 uppercase tracking-wide mb-1">Đơn vị tiền tệ</label>
                <select value={draft.currency} onChange={(e) => setDraft((p) => ({ ...p, currency: e.target.value }))}
                  className="w-full px-3 py-2 text-[16px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {["VND", "USD", "JPY", "EUR"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {([
                { label: "Hình thức hợp đồng", key: "contractTypes" as const, opts: CONTRACT_OPTIONS },
                { label: "Cấp bậc mong muốn",  key: "levels"         as const, opts: LEVEL_OPTIONS   },
              ] as const).map(({ label, key, opts }) => (
                <div key={key}>
                  <label className="block text-[11px] text-gray-400 uppercase tracking-wide mb-2">{label}</label>
                  <div className="flex flex-col gap-2">
                    {opts.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer"
                        onClick={() => toggle(key, opt.value)}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0
                          transition-colors ${draft[key].includes(opt.value) ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                          {draft[key].includes(opt.value) && (
                            <svg viewBox="0 0 12 12" className="w-3 h-3">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[16px] text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected tags */}
            {([...draft.contractTypes, ...draft.levels]).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {draft.contractTypes.map((t) => (
                  <span key={t} className="flex items-center gap-1.5 px-3 py-1 text-[16px] bg-blue-50 text-blue-700 rounded-full">
                    {LABEL(CONTRACT_OPTIONS, t)}
                    <button onClick={() => toggle("contractTypes", t)}><X size={12} /></button>
                  </span>
                ))}
                {draft.levels.map((l) => (
                  <span key={l} className="flex items-center gap-1.5 px-3 py-1 text-[16px] bg-blue-50 text-blue-700 rounded-full">
                    {LABEL(LEVEL_OPTIONS, l)}
                    <button onClick={() => toggle("levels", l)}><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={handleCancel} disabled={saving}
              className="px-4 py-2 text-[16px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Hủy</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-[16px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}Lưu</button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          {desired?.minSalary ? (
            <p className="text-[16px] text-gray-700">
              {desired.minSalary.toLocaleString("vi-VN")} {desired.currency ?? "VND"} / tháng
              {desired.industry && <span className="text-gray-400 ml-2">· {desired.industry}</span>}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {[...(desired?.contractTypes ?? []), ...(desired?.levels ?? [])].map((tag) => (
              <span key={tag} className="px-3 py-1.5 text-[16px] text-gray-700 bg-gray-100 rounded-full border border-gray-200">
                {LABEL(CONTRACT_OPTIONS, tag) !== tag ? LABEL(CONTRACT_OPTIONS, tag) : LABEL(LEVEL_OPTIONS, tag)}
              </span>
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
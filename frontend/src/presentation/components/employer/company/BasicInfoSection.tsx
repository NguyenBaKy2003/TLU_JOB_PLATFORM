// src/presentation/components/company-profile/BasicInfoSection.tsx
"use client";
import { useState, useEffect }         from "react";
import { Building2, Check, X }         from "lucide-react";
import { CompanySectionWrapper }       from "./CompanySectionWrapper";
import type { CompanyProfile,
              UpdateCompanyPayload,
              CompanySize }            from "@/domain/models/Company";

// ── Constants ─────────────

const SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: "STARTUP",     label: "Startup (< 10)"    },
  { value: "SMALL",       label: "Nhỏ (10-49)"       },
  { value: "MEDIUM",      label: "Vừa (50-199)"      },
  { value: "LARGE",       label: "Lớn (200-999)"     },
  { value: "ENTERPRISE",  label: "Doanh nghiệp lớn (1000+)" },
  { value: "CORPORATION", label: "Tập đoàn"          },
];

const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

// ── Draft ──

interface Draft {
  name: string; industry: string; website: string;
  email: string; phone: string; foundedYear: string;
  address: string; city: string; country: string;
  size: string;
}

function toDraft(p: CompanyProfile): Draft {
  return {
    name:        p.name        ?? "",
    industry:    p.industry    ?? "",
    website:     p.website     ?? "",
    email:       p.email       ?? "",
    phone:       p.phone       ?? "",
    foundedYear: p.foundedYear ? String(p.foundedYear) : "",
    address:     p.address     ?? "",
    city:        p.city        ?? "",
    country:     p.country     ?? "",
    size:        p.size        ?? "",
  };
}

// ── ReadRow 

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0 overflow-hidden">
      <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-gray-800 truncate" title={value}>{value || "—"}</span>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Props ──

interface Props {
  profile: CompanyProfile;
  saving:  boolean;
  error?:  string;
  onSave:  (payload: UpdateCompanyPayload) => Promise<void>;
}

// ── Component ─────────────

export function BasicInfoSection({ profile, saving, error, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState<Draft>(() => toDraft(profile));

  useEffect(() => {
    if (!editing) setDraft(toDraft(profile));
  }, [profile, editing]);

  const set = (key: keyof Draft) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setDraft(p => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    await onSave({
      name:        draft.name        || undefined,
      industry:    draft.industry    || undefined,
      website:     draft.website     || undefined,
      email:       draft.email       || undefined,
      phone:       draft.phone       || undefined,
      foundedYear: draft.foundedYear ? Number(draft.foundedYear) : undefined,
      address:     draft.address     || undefined,
      city:        draft.city        || undefined,
      country:     draft.country     || undefined,
      size:        (draft.size as CompanySize) || undefined,
    });
    setEditing(false);
  };

  const sizeLabel = SIZE_OPTIONS.find(o => o.value === profile.size)?.label ?? profile.size ?? "";

  return (
    <CompanySectionWrapper title="Thông tin cơ bản" icon={<Building2 size={16} />}
      onEdit={() => setEditing(true)} editing={editing}>
      {error && (
        <p className="mb-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
      )}

      {editing ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tên công ty" required>
              <input value={draft.name} onChange={set("name")} placeholder="FPT Corporation" className={inputCls} />
            </Field>
            <Field label="Lĩnh vực hoạt động">
              <input value={draft.industry} onChange={set("industry")} placeholder="Công nghệ thông tin" className={inputCls} />
            </Field>
            <Field label="Website">
              <input value={draft.website} onChange={set("website")} placeholder="https://example.com" className={inputCls} />
            </Field>
            <Field label="Email liên hệ">
              <input value={draft.email} onChange={set("email")} type="email" placeholder="hr@example.com" className={inputCls} />
            </Field>
            <Field label="Điện thoại">
              <input value={draft.phone} onChange={set("phone")} placeholder="1800 6600" className={inputCls} />
            </Field>
            <Field label="Năm thành lập">
              <input value={draft.foundedYear} onChange={set("foundedYear")} type="number"
                placeholder="2000" min="1900" max={new Date().getFullYear()} className={inputCls} />
            </Field>
            <Field label="Địa chỉ">
              <input value={draft.address} onChange={set("address")} placeholder="140 Nguyễn Trãi" className={inputCls} />
            </Field>
            <Field label="Thành phố">
              <input value={draft.city} onChange={set("city")} placeholder="Hà Nội" className={inputCls} />
            </Field>
            <Field label="Quốc gia">
              <input value={draft.country} onChange={set("country")} placeholder="Việt Nam" className={inputCls} />
            </Field>
            <Field label="Quy mô công ty">
              <select value={draft.size} onChange={set("size")} className={inputCls + " bg-white cursor-pointer"}>
                <option value="">Chọn quy mô</option>
                {SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => { setDraft(toDraft(profile)); setEditing(false); }}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600
                bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors">
              <X size={14} /> Hủy
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
                bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving
                ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Check size={14} />}
              Lưu
            </button>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
          <ReadRow label="Tên công ty"       value={profile.name       ?? ""} />
          <ReadRow label="Lĩnh vực"          value={profile.industry   ?? ""} />
          <ReadRow label="Website"           value={profile.website    ?? ""} />
          <ReadRow label="Email liên hệ"     value={profile.email      ?? ""} />
          <ReadRow label="Điện thoại"        value={profile.phone      ?? ""} />
          <ReadRow label="Năm thành lập"     value={profile.foundedYear ? String(profile.foundedYear) : ""} />
          <ReadRow label="Địa chỉ"           value={profile.address    ?? ""} />
          <ReadRow label="Thành phố"         value={profile.city       ?? ""} />
          <ReadRow label="Quốc gia"          value={profile.country    ?? ""} />
          <ReadRow label="Quy mô công ty"    value={sizeLabel} />
        </div>
      )}
    </CompanySectionWrapper>
  );
}
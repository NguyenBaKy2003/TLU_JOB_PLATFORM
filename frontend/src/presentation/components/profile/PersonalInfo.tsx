"use client";

import React, { useState } from "react";
import { User } from "lucide-react";
import { CandidateProfile } from "@/domain/models/Candidate";
import { SectionCard } from "../layout/profile/SectionCard";

interface PersonalInfoProps {
  user:    CandidateProfile;
  onSave?: (data: Partial<CandidateProfile>) => void;
}

const MARITAL_OPTIONS = [
  { value: "MARRIED", label: "Đã kết hôn" },
  { value: "SINGLE",  label: "Độc thân" },
];
const GENDER_OPTIONS = [
  { value: "FEMALE", label: "Nữ" },
  { value: "MALE",   label: "Nam" },
];

const maritalLabel = (v: string | null) =>
  MARITAL_OPTIONS.find((o) => o.value === v)?.label ?? v ?? "—";
const genderLabel = (v: string | null) =>
  GENDER_OPTIONS.find((o) => o.value === v)?.label ?? v ?? "—";

function FloatingInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="relative border border-gray-200 rounded-lg px-3 pt-3 pb-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      <label className="absolute top-1.5 left-3 text-[10px] text-gray-400 leading-none">{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-300 mt-0.5" />
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onChange(opt.value)}>
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              value === opt.value ? "border-blue-600" : "border-gray-300 group-hover:border-blue-400"
            }`}>
              {value === opt.value && <span className="w-2 h-2 rounded-full bg-blue-600 block" />}
            </span>
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || "—"}</p>
    </div>
  );
}

export function PersonalInfo({ user, onSave }: PersonalInfoProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName:     user.firstName     ?? "",
    lastName:      user.lastName      ?? "",
    email:         user.email         ?? "",
    phone:         user.phone         ?? "",
    dateOfBirth:   user.dateOfBirth?.slice(0, 10) ?? "",
    location:      user.location      ?? "",
    maritalStatus: user.maritalStatus ?? "",
    gender:        user.gender        ?? "",
  });

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    onSave?.({
      firstName:     form.firstName     || null,
      lastName:      form.lastName      || null,
      email:         form.email         || null,
      phone:         form.phone         || null,
      dateOfBirth:   form.dateOfBirth   || null,
      location:      form.location      || null,
      maritalStatus: form.maritalStatus || null,
      gender:        form.gender        || null,
    });
    setEditing(false);
  };

  return (
    <SectionCard
      title="Thông tin cá nhân"
      icon={<User size={16} />}
      isEmpty={false}
      onEdit={() => setEditing(true)}
    >
      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FloatingInput label="Tên"           value={form.firstName} onChange={set("firstName")} />
            <FloatingInput label="Họ"            value={form.lastName}  onChange={set("lastName")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FloatingInput label="Email"         value={form.email}    onChange={set("email")}  type="email" />
            <FloatingInput label="Số điện thoại" value={form.phone}    onChange={set("phone")}  type="tel" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FloatingInput label="Ngày sinh"     value={form.dateOfBirth} onChange={set("dateOfBirth")} type="date" />
            <FloatingInput label="Địa điểm"      value={form.location}    onChange={set("location")} placeholder="Hà Nội" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <RadioGroup label="Tình trạng hôn nhân" options={MARITAL_OPTIONS}
              value={form.maritalStatus} onChange={set("maritalStatus")} />
            <RadioGroup label="Giới tính" options={GENDER_OPTIONS}
              value={form.gender} onChange={set("gender")} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Lưu
            </button>
            <button onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Hủy
            </button>
          </div>
        </div>
      ) : (
        /* ── View mode ── */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <InfoRow label="Tên"               value={form.firstName} />
            <InfoRow label="Họ"                value={form.lastName} />
            <InfoRow label="Email"             value={form.email} />
            <InfoRow label="Số điện thoại"     value={form.phone} />
            <InfoRow label="Tình trạng hôn nhân" value={maritalLabel(form.maritalStatus)} />
            <InfoRow label="Thành phố"         value={form.location} />
            <InfoRow label="Năm sinh"          value={form.dateOfBirth?.slice(0, 4)} />
            <InfoRow label="Giới tính"         value={genderLabel(form.gender)} />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
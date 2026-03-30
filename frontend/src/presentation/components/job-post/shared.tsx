// src/presentation/components/job-post/shared.tsx
// Tái sử dụng pattern từ FilterSidebar, JobExpectationSection, BenefitsSection

// ── Input ─────────────────────────────────────────────────────────────────────
export const inputCls =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
  "placeholder:text-gray-300 text-gray-800 transition-all";

export function FormInput({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input {...props} className={inputCls + (props.className ? " " + props.className : "")} />
    </div>
  );
}

export function FormSelect({ label, required, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select {...props} className={inputCls + " bg-white cursor-pointer"}>
        {children}
      </select>
    </div>
  );
}

// ── Checkbox (reused from FilterSidebar pattern) ──────────────────────────────
export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
          ${checked ? "border-blue-600 bg-blue-600" : "border-gray-300 group-hover:border-gray-400"}`}>
        {checked && (
          <svg viewBox="0 0 12 12" className="w-3 h-3">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ── Radio (reused from PersonalInfoSection pattern) ───────────────────────────
export function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group" onClick={onChange}>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
        ${checked ? "border-blue-600 bg-blue-600" : "border-gray-300 group-hover:border-gray-400"}`}>
        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ── Tag chip (reused from SkillsSection, BenefitsSection pattern) ─────────────
export function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
      {label}
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors text-sm leading-none">×</button>
    </span>
  );
}

// ── Section card (reused from SectionCard) ────────────────────────────────────
export function PostSection({ icon, title, onEdit, children }: {
  icon: React.ReactNode; title: string; onEdit?: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <span className="text-gray-400">{icon}</span>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        {onEdit && (
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}
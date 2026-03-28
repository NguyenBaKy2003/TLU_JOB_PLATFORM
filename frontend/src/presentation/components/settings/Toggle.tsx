// src/presentation/components/settings/Toggle.tsx
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        on ? "bg-blue-500" : "bg-gray-200"
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
        transition-transform ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}
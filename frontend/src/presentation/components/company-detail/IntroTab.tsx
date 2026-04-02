// src/presentation/components/company-detail/IntroTab.tsx
import type { CompanyDetail } from "./companyDetailTypes";

// Office photo placeholders (gradient squares)
const PHOTO_COLORS = [
  "from-slate-300 to-slate-400",
  "from-blue-200 to-blue-300",
  "from-gray-200 to-gray-300",
  "from-stone-200 to-stone-300",
  "from-zinc-200 to-zinc-300",
  "from-neutral-200 to-neutral-300",
];

export function IntroTab({ company }: { company: CompanyDetail }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Thông tin công ty */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Thông Tin Công Ty</h2>
        <div className="text-sm text-gray-700 leading-relaxed space-y-3">
          {company.description.split("\n\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* Office photos grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Large photo left */}
        <div className="col-span-1 row-span-2 grid grid-rows-3 gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className={`rounded-xl bg-gradient-to-br ${PHOTO_COLORS[i]} h-24`} />
          ))}
        </div>
        {/* 2 large right */}
        <div className="col-span-2 row-span-2 grid grid-rows-2 gap-2">
          {[3, 4].map(i => (
            <div key={i} className={`rounded-xl bg-gradient-to-br ${PHOTO_COLORS[i]} h-24`} />
          ))}
        </div>
      </div>
    </div>
  );
}
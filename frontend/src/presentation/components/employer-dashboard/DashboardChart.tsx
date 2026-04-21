// src/presentation/components/employer-dashboard/DashboardChart.tsx
"use client";
import { useState }       from "react";
import { Briefcase, Eye, Users } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { CHART_DATA, type MiniStat } from "./types";

const MINI_STATS: MiniStat[] = [
  { label: "Tin đã mở",    value: 34, delta: "+8.4", icon: <Briefcase size={14} /> },
  { label: "Lượt xem",     value: 34, delta: "+8.4", icon: <Eye size={14} />       },
  { label: "Đã ứng tuyển", value: 34, delta: "-8.4", icon: <Users size={14} />     },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-blue-500 border border-gray-700 rounded-xl px-4 py-3
      shadow-2xl text-xs">
      <p className="text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white font-semibold">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

type Period = "Tuần" | "Tháng" | "Năm";

export function DashboardChart() {
  const [period, setPeriod] = useState<Period>("Tuần");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Biểu đồ thống kê</h2>
          <p className="text-xs text-gray-400 mt-0.5">Hiển thị thống kê từ 19 – 25 tháng 3</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["Tuần", "Tháng", "Năm"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                period === p
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-5">
        {/* Line chart */}
        <div className="flex-1 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v / 1000}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="views"        stroke="#3b82f6" strokeWidth={2} dot={false} name="Lượt xem tin"   />
              <Line type="monotone" dataKey="applications" stroke="#60a5fa" strokeWidth={2} dot={false} name="Lượt ứng tuyển" />
              <Line type="monotone" dataKey="opened"       stroke="#fbbf24" strokeWidth={2} dot={false} name="Job Opened"     />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Mini stats */}
        <div className="flex flex-col gap-3 w-36 shrink-0">
          {MINI_STATS.map(s => {
            const positive = s.delta.startsWith("+");
            return (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1.5">
                  {s.icon}
                  <span className="text-[11px] font-medium">{s.label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Tuần này</p>
                <p className={`text-[11px] font-semibold mt-0.5 ${positive ? "text-emerald-500" : "text-red-500"}`}>
                  {s.delta}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
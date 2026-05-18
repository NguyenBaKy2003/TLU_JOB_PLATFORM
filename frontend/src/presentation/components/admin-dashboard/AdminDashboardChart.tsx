"use client";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const DATA: Record<string, { day: string; users: number; revenue: number; jobs: number }[]> = {
  Tuần: [
    { day: "T2", users: 1200, revenue: 8400,  jobs: 42 },
    { day: "T3", users: 1800, revenue: 12000, jobs: 67 },
    { day: "T4", users: 1400, revenue: 9800,  jobs: 53 },
    { day: "T5", users: 2200, revenue: 15000, jobs: 89 },
    { day: "T6", users: 1900, revenue: 13200, jobs: 71 },
    { day: "T7", users: 900,  revenue: 6300,  jobs: 28 },
    { day: "CN", users: 600,  revenue: 4200,  jobs: 18 },
  ],
  Tháng: [
    { day: "T1", users: 9800,  revenue: 68000,  jobs: 310 },
    { day: "T2", users: 11200, revenue: 78400,  jobs: 367 },
    { day: "T3", users: 10400, revenue: 72800,  jobs: 341 },
    { day: "T4", users: 13600, revenue: 95200,  jobs: 428 },
  ],
  Năm: [
    { day: "Q1", users: 32000, revenue: 224000, jobs: 1240 },
    { day: "Q2", users: 41000, revenue: 287000, jobs: 1580 },
    { day: "Q3", users: 38000, revenue: 266000, jobs: 1430 },
    { day: "Q4", users: 49000, revenue: 343000, jobs: 1890 },
  ],
};

const MINI = [
  { label: "Người dùng mới", value: "2.2k", delta: "+8.4"  },
  { label: "Doanh thu",      value: "₫15M", delta: "+12.1" },
  { label: "Tin đăng",       value: 89,     delta: "-3.2"  },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-blue-500 border border-gray-700 rounded-xl px-4 py-3 shadow-2xl text-xs">
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

export function AdminDashboardChart() {
  const [period, setPeriod] = useState<Period>("Tuần");
  const data = DATA[period];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">Thống kê hệ thống</h2>
          <p className="text-xs text-gray-400 mt-0.5">Người dùng, doanh thu, tin đăng</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["Tuần", "Tháng", "Năm"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                period === p ? "bg-blue-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-1 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="users"   stroke="#ef4444" strokeWidth={2} dot={false} name="Người dùng" />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Doanh thu"  />
              <Line type="monotone" dataKey="jobs"    stroke="#f59e0b" strokeWidth={2} dot={false} name="Tin đăng"   />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-3 w-36 shrink-0">
          {MINI.map(s => {
            const positive = String(s.delta).startsWith("+");
            return (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] font-medium text-gray-500 mb-1.5">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Kỳ này</p>
                <p className={`text-[11px] font-semibold mt-0.5 ${positive ? "text-emerald-500" : "text-red-500"}`}>
                  {s.delta}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
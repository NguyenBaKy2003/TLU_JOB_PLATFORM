// src/presentation/components/employer-dashboard/types.ts

export interface StatCardData {
  label: string;
  value: number;
  delta: string;
  icon:  React.ReactNode;
}

export interface MiniStat {
  label: string;
  value: number;
  delta: string;
  icon:  React.ReactNode;
}

export interface InterviewItem {
  name:   string;
  time:   string;
  role:   string;
  avatar: string;
}

export interface JobPostItem {
  id:           string;
  title:        string;
  type:         string;
  daysLeft:     number;
  status:       "active" | "closed";
  applications: number;
  salary:       string;
}

export interface ChartPoint {
  day:          string;
  views:        number;
  applications: number;
  opened:       number;
}

export const CHART_DATA: ChartPoint[] = [
  { day: "Thứ 2", views: 1200, applications: 800,  opened: 900  },
  { day: "Thứ 3", views: 1800, applications: 1200, opened: 1100 },
  { day: "Thứ 4", views: 2400, applications: 1600, opened: 1500 },
  { day: "Thứ 5", views: 2900, applications: 2000, opened: 2200 },
  { day: "Thứ 6", views: 3600, applications: 2800, opened: 3000 },
  { day: "Thứ 7", views: 4200, applications: 3200, opened: 3800 },
  { day: "CN",    views: 5000, applications: 4000, opened: 4500 },
];

export const MOCK_INTERVIEWS: InterviewItem[] = [
  { name: "Lan Trang", time: "10:30 AM – 11:30 AM", role: "UI/UX Designer", avatar: "LT" },
  { name: "Văn Cương", time: "10:30 AM – 11:30 AM", role: "DEV",            avatar: "VC" },
  { name: "Bá Kỳ",    time: "10:30 AM – 11:30 AM", role: "Product Manager", avatar: "BK" },
];

export const MOCK_JOBS: JobPostItem[] = [
  { id: "1", title: "UI/UX Designer",  type: "Full Time", daysLeft: 27, status: "active", applications: 798, salary: "11$ – 22$" },
  { id: "2", title: "Frontend Dev",    type: "Full Time", daysLeft: 15, status: "active", applications: 452, salary: "20$ – 35$" },
  { id: "3", title: "Product Manager", type: "Part Time", daysLeft: 9,  status: "active", applications: 134, salary: "15$ – 28$" },
];

export const SCHEDULE_DAYS = [
  { label: "Thứ 3", date: 9             },
  { label: "Thứ 5", date: 11            },
  { label: "Thứ 6", date: 12, active: true },
  { label: "Thứ 7", date: 13            },
];

// Avatar color pool
const COLORS = ["bg-violet-500","bg-sky-500","bg-emerald-500","bg-rose-500","bg-amber-500"];
export const avatarColor = (idx: number) => COLORS[idx % COLORS.length];
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Building2,
  Search,
  SlidersHorizontal,
  CalendarDays,
  Inbox,
  RefreshCw,
  ExternalLink,
  List,
  Clock,
  MapPin,
} from "lucide-react";
import { ApplicationService }    from "@/application/services/ApplicationService";
import { ApplicationRepository } from "@/infrastructure/repositories/ApplicationRepository";
import { LoadingSpinner }        from "@/presentation/components/common";
import { useToast }              from "@/presentation/components/ui/toast";
import { extractErrorMessage }   from "@/lib/extractErrorMessage";
import type { InterviewScheduleItem } from "@/domain/models/Application";
import { useRouter } from "next/navigation";

// ── Constants ─────────────────────────────────────────────────────────────────

const VI_WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const VI_MONTHS   = [
  "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12",
];

type ViewMode = "list" | "week";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isOnline(location: string | null | undefined): boolean {
  return /meet|zoom|teams|skype|online|remote/i.test(location ?? "");
}

function getWeekDays(baseDate: Date): Date[] {
  const monday = new Date(baseDate);
  const day    = monday.getDay();
  const diff   = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    weekday: "long", day: "numeric", month: "numeric",
  });
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ item, size = 28 }: { item: InterviewScheduleItem; size?: number }) {
  const sz = `${size}px`;
  if (item.candidateAvatarUrl) {
    return (
      <img
        src={item.candidateAvatarUrl}
        alt={item.candidateName ?? ""}
        style={{ width: sz, height: sz }}
        className="rounded-full object-cover border border-blue-100 flex-shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: sz, height: sz, fontSize: 10 }}
      className="rounded-full bg-blue-50 border border-blue-200 flex items-center
        justify-center font-semibold text-blue-700 flex-shrink-0"
    >
      {initials(item.candidateName)}
    </div>
  );
}

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
      {(["list", "week"] as ViewMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium
            transition-all ${mode === m
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-700"}`}
        >
          {m === "list"
            ? <><List size={11} /> Danh sách</>
            : <><CalendarDays size={11} /> Tuần</>}
        </button>
      ))}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, variant = "default",
}: {
  label: string; value: number; variant?: "default" | "blue" | "purple" | "teal";
}) {
  const styles: Record<string, string> = {
    default: "bg-white border-gray-200 text-gray-900",
    blue:    "bg-blue-50 border-blue-200 text-blue-900",
    purple:  "bg-purple-50 border-purple-200 text-purple-900",
    teal:    "bg-teal-50 border-teal-200 text-teal-900",
  };
  const lblStyles: Record<string, string> = {
    default: "text-gray-500",
    blue:    "text-blue-600",
    purple:  "text-purple-600",
    teal:    "text-teal-600",
  };
  return (
    <div className={`flex flex-col items-center px-5 py-3 rounded-xl border ${styles[variant]} min-w-[80px]`}>
      <span className="text-xl font-semibold leading-none">{value}</span>
      <span className={`text-[11px] mt-1 ${lblStyles[variant]}`}>{label}</span>
    </div>
  );
}

// ── Interview card (list view) ─────────────────────────────────────────────────

function InterviewCard({
  item,
  onNavigate,
}: {
  item: InterviewScheduleItem;
  onNavigate: (id: string) => void;
}) {
  const online = isOnline(item.location);
  const past   = new Date(item.scheduledAt) < new Date();
  const dt     = new Date(item.scheduledAt);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 flex gap-3
      hover:border-blue-200 hover:shadow-sm transition-all duration-150
      ${past ? "opacity-55" : ""}`}
    >
      {/* Date block */}
      <div className="flex-shrink-0 w-12 h-12 bg-gray-50 border border-gray-200
        rounded-xl flex flex-col items-center justify-center text-center">
        <span className="text-lg font-semibold text-gray-900 leading-none">{dt.getDate()}</span>
        <span className="text-[10px] text-gray-400 uppercase mt-0.5 tracking-wide">
          {VI_MONTHS[dt.getMonth()].replace("Tháng ", "Th")}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.candidateName ?? "—"}
            </p>
            {item.jobTitle && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{item.jobTitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {online ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200">
                <Video size={8} /> Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
                <Building2 size={8} /> Trực tiếp
              </span>
            )}
            {past && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400
                text-[10px] border border-gray-200">Đã qua</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2">
          <span className="flex items-center gap-1 text-[11px] text-gray-500">
            <Clock size={10} className="text-gray-400" />
            {formatTime(item.scheduledAt)}
          </span>
          {item.location && (
            <span className="flex items-center gap-1 text-[11px] text-gray-500 truncate max-w-[180px]">
              <MapPin size={10} className="text-gray-400 flex-shrink-0" />
              {item.location}
            </span>
          )}
        </div>

        {item.note && (
          <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-1 italic">{item.note}</p>
        )}
      </div>

      {/* Actions column */}
      <div className="flex flex-col items-end justify-between flex-shrink-0 gap-2">
        <Avatar item={item} size={28} />
        <button
          onClick={() => onNavigate(item.applicationId)}
          className="w-6 h-6 rounded-md flex items-center justify-center border
            border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50
            hover:border-blue-200 transition-colors"
          title="Xem đơn"
        >
          <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
}

// ── Week calendar ─────────────────────────────────────────────────────────────

function WeekCalendar({
  weekDays,
  grouped,
  onNavigate,
}: {
  weekDays: Date[];
  grouped:  Record<string, InterviewScheduleItem[]>;
  onNavigate: (id: string) => void;
}) {
  const today = toDateKey(new Date());

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {weekDays.map((d, i) => {
          const key     = toDateKey(d);
          const isToday = key === today;
          const count   = grouped[key]?.length ?? 0;
          return (
            <div
              key={key}
              className={`p-3 text-center border-r last:border-r-0 border-gray-100
                ${isToday ? "bg-blue-50" : ""}`}
            >
              <p className={`text-[10px] font-medium uppercase tracking-wider
                ${isToday ? "text-blue-600" : "text-gray-400"}`}>
                {VI_WEEKDAYS[i]}
              </p>
              <p className={`text-lg font-semibold mt-0.5 leading-none
                ${isToday ? "text-blue-700" : "text-gray-800"}`}>
                {d.getDate()}
              </p>
              {count > 0 && (
                <div className={`mx-auto mt-1.5 w-5 h-5 rounded-full text-[10px]
                  font-semibold flex items-center justify-center
                  ${isToday ? "bg-blue-600 text-white" : "bg-purple-100 text-purple-700"}`}>
                  {count}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Event cells */}
      <div className="grid grid-cols-7 min-h-[260px] divide-x divide-gray-100">
        {weekDays.map((d) => {
          const key    = toDateKey(d);
          const events = grouped[key] ?? [];
          const isToday = key === today;
          return (
            <div key={key} className={`p-2 flex flex-col gap-1.5 ${isToday ? "bg-blue-50/30" : ""}`}>
              {events.map((item) => {
                const online = isOnline(item.location);
                return (
                  <button
                    key={item.applicationId}
                    onClick={() => onNavigate(item.applicationId)}
                    className={`w-full text-left rounded-lg px-2 py-1.5 border text-[11px]
                      transition-all hover:opacity-80 active:scale-95
                      ${online
                        ? "bg-blue-50 border-blue-200 text-blue-800"
                        : "bg-purple-50 border-purple-200 text-purple-800"}`}
                  >
                    <p className="font-medium truncate leading-tight">
                      {item.candidateName ?? "—"}
                    </p>
                    <p className="text-[10px] opacity-70 mt-0.5">
                      {formatTime(item.scheduledAt)}
                    </p>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stable service instance ───────────────────────────────────────────────────

const service = new ApplicationService(new ApplicationRepository());

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InterviewSchedulePage() {
  const toast  = useToast();
  const router = useRouter();

  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; });

  const [items,       setItems]       = useState<InterviewScheduleItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [viewMode,    setViewMode]    = useState<ViewMode>("week");
  const [search,      setSearch]      = useState("");
  const [weekBase,    setWeekBase]    = useState<Date>(() => new Date());
  const [filterFrom,  setFilterFrom]  = useState("");
  const [filterTo,    setFilterTo]    = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);

  const weekDays = useMemo(() => getWeekDays(weekBase), [weekBase]);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const loadList = useCallback(async (p: number, from: string, to: string) => {
    setLoading(true);
    try {
      const res = await service.getInterviewSchedule({
        from:  from ? `${from}T00:00:00` : undefined,
        to:    to   ? `${to}T23:59:59`   : undefined,
        page:  p,
        size:  30,
      });
      setItems(res.content);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalElements);
    } catch (e) {
      toastRef.current.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWeek = useCallback(async (base: Date) => {
    setLoading(true);
    try {
      const days = getWeekDays(base);
      const res  = await service.getInterviewSchedule({
        from: `${toDateKey(days[0])}T00:00:00`,
        to:   `${toDateKey(days[6])}T23:59:59`,
        size: 200,
      });
      setItems(res.content);
      setTotalPages(1);
      setTotalItems(res.totalElements);
    } catch (e) {
      toastRef.current.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === "list") loadList(page, filterFrom, filterTo);
  }, [viewMode, page, filterFrom, filterTo, loadList]);

  useEffect(() => {
    if (viewMode === "week") loadWeek(weekBase);
  }, [viewMode, weekBase, loadWeek]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    if (viewMode === "list") loadList(page, filterFrom, filterTo);
    else                     loadWeek(weekBase);
  }, [viewMode, page, filterFrom, filterTo, weekBase, loadList, loadWeek]);

  const handleViewChange = useCallback((m: ViewMode) => {
    setViewMode(m);
    setPage(0);
    setSearch("");
  }, []);

  const handleFromChange = useCallback((val: string) => { setFilterFrom(val); setPage(0); }, []);
  const handleToChange   = useCallback((val: string) => { setFilterTo(val);   setPage(0); }, []);
  const clearFilters     = useCallback(() => { setFilterFrom(""); setFilterTo(""); setPage(0); }, []);

  const prevWeek = useCallback(() =>
    setWeekBase(d => { const n = new Date(d); n.setDate(d.getDate() - 7); return n; }), []);
  const nextWeek = useCallback(() =>
    setWeekBase(d => { const n = new Date(d); n.setDate(d.getDate() + 7); return n; }), []);
  const thisWeek = useCallback(() => setWeekBase(new Date()), []);

  const handleNavigate = useCallback((appId: string) =>
    router.push(`/employer/applications/${appId}`), [router]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(i =>
      i.candidateName?.toLowerCase().includes(q) ||
      i.jobTitle?.toLowerCase().includes(q) ||
      i.location?.toLowerCase().includes(q),
    );
  }, [items, search]);

  const grouped = useMemo(() =>
    filtered.reduce<Record<string, InterviewScheduleItem[]>>((acc, item) => {
      const key = item.scheduledAt.slice(0, 10);
      (acc[key] ??= []).push(item);
      return acc;
    }, {}),
  [filtered]);

  const todayKey      = toDateKey(new Date());
  const todayCount    = filtered.filter(i => i.scheduledAt.slice(0, 10) === todayKey).length;
  const onlineCount   = filtered.filter(i => isOnline(i.location)).length;
  const upcomingCount = filtered.filter(i => new Date(i.scheduledAt) >= new Date()).length;

  const monthYearLabel = `${VI_MONTHS[weekDays[0].getMonth()]} ${weekDays[0].getFullYear()}`;

  const sortedDateGroups = useMemo(() =>
    Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)),
  [grouped]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 pb-10">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Lịch phỏng vấn</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý toàn bộ lịch hẹn phỏng vấn của công ty
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-lg border
              border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50
              hover:border-blue-200 transition-colors disabled:opacity-40"
            title="Làm mới"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
          <ViewToggle mode={viewMode} onChange={handleViewChange} />
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <StatCard label="Tổng lịch hẹn" value={totalItems}    variant="default" />
        <StatCard label="Hôm nay"        value={todayCount}    variant="blue" />
        <StatCard label="Sắp tới"        value={upcomingCount} variant="purple" />
        <StatCard label="Online"         value={onlineCount}   variant="teal" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm ứng viên, vị trí, địa điểm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 h-8 text-sm rounded-lg border border-gray-200
              bg-white focus:border-blue-300 focus:outline-none transition-colors"
          />
        </div>

        <button
          onClick={() => setShowFilters(p => !p)}
          className={`flex items-center gap-1.5 px-3 h-8 rounded-lg border text-xs
            font-medium transition-colors
            ${showFilters
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          <SlidersHorizontal size={13} />
          Lọc
          {(filterFrom || filterTo) && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px]
              flex items-center justify-center ml-0.5 font-semibold">
              {[filterFrom, filterTo].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Week navigation — only in week mode */}
        {viewMode === "week" && (
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={prevWeek}
              className="w-7 h-7 flex items-center justify-center rounded-lg border
                border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={thisWeek}
              className="px-3 h-7 rounded-lg border border-gray-200 text-xs
                text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              {monthYearLabel}
            </button>
            <button
              onClick={nextWeek}
              className="w-7 h-7 flex items-center justify-center rounded-lg border
                border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4
          flex flex-wrap items-end gap-4 -mt-1">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Từ ngày</label>
            <input
              type="date"
              value={filterFrom}
              onChange={e => handleFromChange(e.target.value)}
              className="h-8 px-3 text-sm rounded-lg border border-gray-200
                focus:border-blue-300 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Đến ngày</label>
            <input
              type="date"
              value={filterTo}
              onChange={e => handleToChange(e.target.value)}
              className="h-8 px-3 text-sm rounded-lg border border-gray-200
                focus:border-blue-300 focus:outline-none"
            />
          </div>
          {(filterFrom || filterTo) && (
            <button
              onClick={clearFilters}
              className="h-8 px-3 rounded-lg border border-red-200 bg-red-50
                text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" variant="primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20
          flex flex-col items-center gap-3 text-gray-400">
          <Inbox size={36} strokeWidth={1.2} />
          <p className="text-sm font-medium">Không có lịch phỏng vấn nào</p>
          <p className="text-xs text-gray-300">Thử thay đổi khoảng thời gian lọc</p>
        </div>
      ) : viewMode === "week" ? (
        <WeekCalendar weekDays={weekDays} grouped={grouped} onNavigate={handleNavigate} />
      ) : (
        <>
          {sortedDateGroups.map(([dateKey, dayItems]) => {
            const isToday = dateKey === todayKey;
            return (
              <div key={dateKey} className="flex flex-col gap-2.5">
                {/* Date separator */}
                <div className="flex items-center gap-2.5">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border
                    text-xs font-medium shrink-0
                    ${isToday
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-200 text-gray-600"}`}>
                    <CalendarDays size={11} />
                    {isToday ? "Hôm nay · " : ""}{formatDate(dateKey + "T00:00:00")}
                    <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px]
                      ${isToday ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {dayItems.length}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                  {[...dayItems]
                    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
                    .map(item => (
                      <InterviewCard
                        key={item.applicationId}
                        item={item}
                        onNavigate={handleNavigate}
                      />
                    ))}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border
                  border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30
                  disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="text-sm text-gray-500">
                Trang <strong className="text-gray-900">{page + 1}</strong> / {totalPages}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border
                  border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30
                  disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
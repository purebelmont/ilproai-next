"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const fmt = (n: number) => "₩" + n.toLocaleString();

type Tool = { id: string; icon: string; label: string; color: string };
const TIER1_TOOLS: Tool[] = [
  { id: "contacts", icon: "👤", label: "연락처", color: "#0071E3" },
  { id: "calendar", icon: "📅", label: "캘린더", color: "#FF9500" },
  { id: "reservations", icon: "📋", label: "예약", color: "#FF6B35" },
  { id: "notes", icon: "📝", label: "메모", color: "#30D158" },
  { id: "todos", icon: "✅", label: "할일", color: "#FF2D55" },
  { id: "files", icon: "📎", label: "문서함", color: "#5856D6" },
  { id: "ledger", icon: "💰", label: "매출", color: "#34C759" },
  { id: "quotes", icon: "💼", label: "견적", color: "#007AFF" },
  { id: "payroll", icon: "👥", label: "급여", color: "#AF52DE" },
  { id: "report", icon: "📊", label: "리포트", color: "#FF3B30" },
];

export default function HomePanel({ userId, profile, setTab }: { userId: string; profile: any; setTab: (t: any) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [todayReservations, setTodayReservations] = useState<any[]>([]);
  const [pendingTodos, setPendingTodos] = useState<any[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<{ day: string; income: number; expense: number }[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0];
  const d = new Date();
  const greeting = d.getHours() < 12 ? "좋은 아침이에요" : d.getHours() < 18 ? "좋은 오후에요" : "수고하셨어요";
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const load = useCallback(async () => {
    // Stats
    const [contacts, schedules, reservations, todos, ledgerInc, ledgerExp] = await Promise.all([
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("schedules").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("start_date", today),
      supabase.from("reservations").select("*").eq("user_id", userId).eq("reservation_date", today).neq("status", "cancelled"),
      supabase.from("todos").select("id, title, completed").eq("user_id", userId).eq("completed", false).order("created_at", { ascending: false }).limit(5),
      supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "income").gte("entry_date", today.substring(0, 7) + "-01"),
      supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "expense").gte("entry_date", today.substring(0, 7) + "-01"),
    ]);

    const rvData = reservations.data || [];
    const monthIncome = (ledgerInc.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
    const monthExpense = (ledgerExp.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);

    setStats({
      contacts: contacts.count || 0,
      pendingTodos: (todos.data || []).length,
      todaySchedules: schedules.count || 0,
      todayReservations: rvData.length,
      todayGuests: rvData.reduce((s: number, r: any) => s + r.party_size, 0),
      monthIncome, monthExpense,
    });

    setTodayReservations(rvData.slice(0, 5));
    setPendingTodos((todos.data || []).slice(0, 5));

    // Upcoming schedules (today + tomorrow)
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const { data: schData } = await supabase.from("schedules").select("id, title, start_date, start_time, color").eq("user_id", userId).gte("start_date", today).lte("start_date", tomorrow.toISOString().split("T")[0]).order("start_date").order("start_time").limit(5);
    setUpcomingSchedules(schData || []);

    // Weekly revenue (last 7 days)
    const weekData: { day: string; income: number; expense: number }[] = [];
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const dt = new Date(weekStart); dt.setDate(dt.getDate() + i);
      const ds = dt.toISOString().split("T")[0];
      weekData.push({ day: dayNames[dt.getDay()], income: 0, expense: 0 });
    }
    const ws = weekStart.toISOString().split("T")[0];
    const [wInc, wExp] = await Promise.all([
      supabase.from("ledger").select("amount, entry_date").eq("user_id", userId).eq("entry_type", "income").gte("entry_date", ws).lte("entry_date", today),
      supabase.from("ledger").select("amount, entry_date").eq("user_id", userId).eq("entry_type", "expense").gte("entry_date", ws).lte("entry_date", today),
    ]);
    (wInc.data || []).forEach((r: any) => {
      const idx = Math.floor((new Date(r.entry_date).getTime() - weekStart.getTime()) / 86400000);
      if (idx >= 0 && idx < 7) weekData[idx].income += Number(r.amount);
    });
    (wExp.data || []).forEach((r: any) => {
      const idx = Math.floor((new Date(r.entry_date).getTime() - weekStart.getTime()) / 86400000);
      if (idx >= 0 && idx < 7) weekData[idx].expense += Number(r.amount);
    });
    setWeeklyRevenue(weekData);

    // Recent activity (timeline)
    const [recentNotes, recentContacts, recentQuotes, recentReservations] = await Promise.all([
      supabase.from("notes").select("id, title, content, color, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(3),
      supabase.from("contacts").select("id, name, company, phone, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(3),
      supabase.from("quotes").select("id, title, client_name, status, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(3),
      supabase.from("reservations").select("id, customer_name, party_size, reservation_date, reservation_time, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
    ]);
    const items: any[] = [
      ...(recentNotes.data || []).map((n: any) => ({ tab: "notes", icon: "📝", title: n.title || n.content?.substring(0, 30) || "메모", subtitle: n.content?.substring(0, 40), color: n.color, time: n.updated_at })),
      ...(recentContacts.data || []).map((c: any) => ({ tab: "contacts", icon: "👤", title: c.name, subtitle: [c.company, c.phone].filter(Boolean).join(" · "), time: c.updated_at })),
      ...(recentQuotes.data || []).map((q: any) => ({ tab: "quotes", icon: "💼", title: q.title || q.client_name || "견적서", subtitle: q.status === "draft" ? "초안" : q.status === "sent" ? "발송" : "확정", time: q.updated_at })),
      ...(recentReservations.data || []).map((r: any) => ({ tab: "reservations", icon: "📋", title: `${r.customer_name} · ${r.party_size}명`, subtitle: `${r.reservation_date} ${r.reservation_time?.substring(0, 5) || ""}`, time: r.created_at })),
    ];
    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setRecentItems(items.slice(0, 8));
  }, [userId, today]);

  useEffect(() => { load(); }, [load]);

  if (!stats) return <div className="p-5 text-center"><div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto" /></div>;

  const bizName = profile?.business_name || profile?.name || "";
  const weekMax = Math.max(1, ...weeklyRevenue.map(w => w.income));

  return (
    <div className="p-5">
      {/* ═══ Greeting + Quick Actions ═══ */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-xl font-extrabold">{greeting} 👋</h2>
          {bizName && <p className="text-sm text-[var(--text-muted)] mt-0.5">{bizName}</p>}
        </div>
      </div>

      {/* ═══ Quick Add Buttons ═══ */}
      <div className="flex gap-2 mb-5 overflow-x-auto -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
        {[
          { icon: "📋", label: "예약 추가", tab: "reservations" },
          { icon: "💰", label: "매출 입력", tab: "ledger" },
          { icon: "📝", label: "메모 작성", tab: "notes" },
          { icon: "✅", label: "할일 추가", tab: "todos" },
          { icon: "👤", label: "연락처 추가", tab: "contacts" },
        ].map((a, i) => (
          <button key={i} onClick={() => setTab(a.tab)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold active:scale-95 transition-all"
            style={{ background: "var(--primary)", color: "#fff" }}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {/* ═══ Quick Stats ═══ */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <button onClick={() => setTab("reservations")} className="bg-[var(--bg-card)] rounded-xl px-3 py-3 border border-[var(--border)] active:scale-[0.97] transition-transform text-center">
          <div className="text-lg font-extrabold text-[var(--primary)]">{stats.todayReservations}</div>
          <div className="text-[9px] text-[var(--text-muted)]">오늘 예약</div>
        </button>
        <button onClick={() => setTab("calendar")} className="bg-[var(--bg-card)] rounded-xl px-3 py-3 border border-[var(--border)] active:scale-[0.97] transition-transform text-center">
          <div className="text-lg font-extrabold text-[#FF9500]">{stats.todaySchedules}</div>
          <div className="text-[9px] text-[var(--text-muted)]">오늘 일정</div>
        </button>
        <button onClick={() => setTab("todos")} className="bg-[var(--bg-card)] rounded-xl px-3 py-3 border border-[var(--border)] active:scale-[0.97] transition-transform text-center">
          <div className="text-lg font-extrabold text-[var(--danger)]">{stats.pendingTodos}</div>
          <div className="text-[9px] text-[var(--text-muted)]">미완료 할일</div>
        </button>
        <button onClick={() => setTab("ledger")} className="bg-[var(--bg-card)] rounded-xl px-3 py-3 border border-[var(--border)] active:scale-[0.97] transition-transform text-center">
          <div className="text-sm font-extrabold text-[var(--success)]">{fmt(stats.monthIncome - stats.monthExpense)}</div>
          <div className="text-[9px] text-[var(--text-muted)]">이번달</div>
        </button>
      </div>

      {/* ═══ Today's Overview — Two columns ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Today's Reservations */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold">📋 오늘 예약</div>
            <button onClick={() => setTab("reservations")} className="text-[10px] text-[var(--primary)] font-medium">전체보기 →</button>
          </div>
          {todayReservations.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] text-center py-4">오늘 예약이 없습니다</div>
          ) : (
            <div className="space-y-2">
              {todayReservations.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <div className="text-[11px] font-bold w-10 shrink-0" style={{ color: "var(--primary)" }}>{r.reservation_time?.substring(0, 5)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{r.customer_name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{r.party_size}명 · {r.service || "일반"}</div>
                  </div>
                  <div className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: r.status === "confirmed" ? "rgba(48,209,88,0.15)" : "rgba(255,159,0,0.15)", color: r.status === "confirmed" ? "var(--success)" : "#FF9F00" }}>
                    {r.status === "confirmed" ? "확정" : r.status === "completed" ? "완료" : "대기"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Todos + Upcoming Schedules */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold">✅ 할일 · 📅 일정</div>
            <button onClick={() => setTab("todos")} className="text-[10px] text-[var(--primary)] font-medium">전체보기 →</button>
          </div>
          {pendingTodos.length === 0 && upcomingSchedules.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] text-center py-4">할일과 일정이 없습니다</div>
          ) : (
            <div className="space-y-2">
              {pendingTodos.map((t: any, i: number) => (
                <div key={"t" + i} className="flex items-center gap-2 py-1">
                  <div className="w-4 h-4 rounded border border-[var(--border)] shrink-0" />
                  <div className="text-xs truncate flex-1">{t.title}</div>
                </div>
              ))}
              {upcomingSchedules.map((s: any, i: number) => (
                <div key={"s" + i} className="flex items-center gap-2 py-1">
                  <div className="w-4 h-4 rounded shrink-0" style={{ background: s.color || "var(--primary)" }} />
                  <div className="text-xs truncate flex-1">{s.title}</div>
                  <div className="text-[10px] text-[var(--text-muted)] shrink-0">{s.start_time?.substring(0, 5) || s.start_date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Weekly Revenue Chart ═══ */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold">📊 주간 매출</div>
          <button onClick={() => setTab("report")} className="text-[10px] text-[var(--primary)] font-medium">리포트 →</button>
        </div>
        <div className="flex items-end gap-1 h-[80px]">
          {weeklyRevenue.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: 60 }}>
                <div className="w-full rounded-t transition-all" style={{ height: `${Math.max(2, (w.income / weekMax) * 60)}px`, background: "var(--primary)", opacity: 0.8 }} />
              </div>
              <div className="text-[9px] text-[var(--text-muted)]">{w.day}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px]">
          <span style={{ color: "var(--text-muted)" }}>주간 매출 합계</span>
          <span className="font-bold" style={{ color: "var(--primary)" }}>{fmt(weeklyRevenue.reduce((s, w) => s + w.income, 0))}</span>
        </div>
      </div>

      {/* ═══ Monthly Summary ═══ */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold">이번달 매출 요약</div>
          <button onClick={() => setTab("report")} className="text-[10px] text-[var(--primary)] font-medium">리포트 →</button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><div className="text-sm font-extrabold text-[var(--primary)]">{fmt(stats.monthIncome)}</div><div className="text-[10px] text-[var(--text-muted)]">매출</div></div>
          <div><div className="text-sm font-extrabold text-[var(--danger)]">{fmt(stats.monthExpense)}</div><div className="text-[10px] text-[var(--text-muted)]">지출</div></div>
          <div><div className="text-sm font-extrabold text-[var(--success)]">{fmt(stats.monthIncome - stats.monthExpense)}</div><div className="text-[10px] text-[var(--text-muted)]">순이익</div></div>
        </div>
      </div>

      {/* ═══ Recent Activity — Timeline ═══ */}
      <div className="mb-5">
        <h3 className="text-sm font-bold mb-3">최근 활동</h3>
        {recentItems.length === 0 ? (
          <div className="text-center py-6 text-[var(--text-muted)]">
            <div className="text-2xl mb-2">📂</div>
            <div className="text-xs">아직 데이터가 없어요</div>
          </div>
        ) : (
          <div className="space-y-0">
            {recentItems.map((item, i) => (
              <button key={i} onClick={() => setTab(item.tab)}
                className="w-full flex items-start gap-3 py-2.5 text-left active:opacity-70 transition-opacity"
                style={{ borderBottom: i < recentItems.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ background: (item.color || TIER1_TOOLS.find(t => t.id === item.tab)?.color || "var(--primary)") + "20" }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{item.title}</div>
                  {item.subtitle && <div className="text-[10px] text-[var(--text-muted)] truncate">{item.subtitle}</div>}
                </div>
                <div className="text-[9px] text-[var(--text-muted)] shrink-0 pt-0.5">{timeAgo(item.time)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return dateStr.split("T")[0];
}

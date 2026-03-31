"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const fmt = (n: number) => "₩" + n.toLocaleString();

export default function HomePanel({ userId, profile, setTab }: { userId: string; profile: any; setTab: (t: any) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [todayReservations, setTodayReservations] = useState<any[]>([]);
  const [pendingTodos, setPendingTodos] = useState<any[]>([]);
  const [recentLedger, setRecentLedger] = useState<any>({ income: 0, expense: 0 });

  const today = new Date().toISOString().split("T")[0];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const d = new Date();
  const greeting = d.getHours() < 12 ? "좋은 아침이에요" : d.getHours() < 18 ? "좋은 오후에요" : "수고하셨어요";

  const load = useCallback(async () => {
    // Counts
    const [contacts, notes, todos, schedules, reservations, ledgerInc, ledgerExp, employees, quotes] = await Promise.all([
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("todos").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("completed", false),
      supabase.from("schedules").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("start_date", today),
      supabase.from("reservations").select("party_size").eq("user_id", userId).eq("reservation_date", today).neq("status", "cancelled"),
      supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "income").gte("entry_date", today.substring(0, 7) + "-01"),
      supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "expense").gte("entry_date", today.substring(0, 7) + "-01"),
      supabase.from("employees").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("active", true),
      supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", userId),
    ]);

    const rvData = reservations.data || [];
    const totalGuests = rvData.reduce((s: number, r: any) => s + r.party_size, 0);
    const monthIncome = (ledgerInc.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
    const monthExpense = (ledgerExp.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);

    setStats({
      contacts: contacts.count || 0,
      notes: notes.count || 0,
      pendingTodos: todos.count || 0,
      todaySchedules: schedules.count || 0,
      todayReservations: rvData.length,
      todayGuests: totalGuests,
      employees: employees.count || 0,
      quotes: quotes.count || 0,
      monthIncome, monthExpense,
    });

    setRecentLedger({ income: monthIncome, expense: monthExpense });

    // Today events
    const { data: evts } = await supabase.from("schedules").select("*").eq("user_id", userId).eq("start_date", today).order("start_time").limit(5);
    setTodayEvents(evts || []);

    // Today reservations
    const { data: rvs } = await supabase.from("reservations").select("*").eq("user_id", userId).eq("reservation_date", today).neq("status", "cancelled").order("reservation_time").limit(5);
    setTodayReservations(rvs || []);

    // Pending todos
    const { data: tds } = await supabase.from("todos").select("*").eq("user_id", userId).eq("completed", false).order("priority", { ascending: false }).limit(5);
    setPendingTodos(tds || []);
  }, [userId, today]);

  useEffect(() => { load(); }, [load]);

  if (!stats) return <div className="p-5 text-center"><div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto" /></div>;

  const bizName = profile?.business_name || profile?.name || "";

  return (
    <div className="p-5">
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold ">{greeting} 👋</h2>
        {bizName && <p className="text-sm text-[var(--gray-500)] mt-1">{bizName}</p>}
        <p className="text-xs text-[var(--gray-400)] mt-0.5">{d.getFullYear()}년 {d.getMonth()+1}월 {d.getDate()}일 ({dayNames[d.getDay()]})</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button onClick={() => setTab("reservations")} className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]  text-left active:scale-[0.98] transition-transform">
          <div className="text-2xl font-extrabold text-[var(--primary)]">{stats.todayReservations}</div>
          <div className="text-xs text-[var(--gray-500)]">오늘 예약 · {stats.todayGuests}명</div>
        </button>
        <button onClick={() => setTab("calendar")} className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]  text-left active:scale-[0.98] transition-transform">
          <div className="text-2xl font-extrabold text-[#FF9500]">{stats.todaySchedules}</div>
          <div className="text-xs text-[var(--gray-500)]">오늘 일정</div>
        </button>
        <button onClick={() => setTab("todos")} className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]  text-left active:scale-[0.98] transition-transform">
          <div className="text-2xl font-extrabold text-[var(--danger)]">{stats.pendingTodos}</div>
          <div className="text-xs text-[var(--gray-500)]">미완료 할일</div>
        </button>
        <button onClick={() => setTab("ledger")} className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]  text-left active:scale-[0.98] transition-transform">
          <div className="text-xl font-extrabold text-[var(--success)]">{fmt(recentLedger.income - recentLedger.expense)}</div>
          <div className="text-xs text-[var(--gray-500)]">이번달 순이익</div>
        </button>
      </div>

      {/* Monthly summary */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)]  mb-6">
        <div className="text-xs font-semibold text-[var(--gray-500)] mb-3">이번달 매출 요약</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><div className="text-sm font-extrabold text-[var(--primary)]">{fmt(recentLedger.income)}</div><div className="text-[10px] text-[var(--gray-400)]">매출</div></div>
          <div><div className="text-sm font-extrabold text-[var(--danger)]">{fmt(recentLedger.expense)}</div><div className="text-[10px] text-[var(--gray-400)]">지출</div></div>
          <div><div className="text-sm font-extrabold text-[var(--success)]">{fmt(recentLedger.income - recentLedger.expense)}</div><div className="text-[10px] text-[var(--gray-400)]">순이익</div></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Today reservations */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] ">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-[var(--gray-500)]">📋 오늘 예약</div>
            <button onClick={() => setTab("reservations")} className="text-[10px] text-[var(--primary)]">전체보기</button>
          </div>
          {todayReservations.length === 0 ? (
            <div className="text-center py-4 text-xs text-[var(--gray-400)]">예약이 없습니다</div>
          ) : todayReservations.map((r) => (
            <div key={r.id} className="flex items-center gap-2 py-2 border-b border-[var(--border-light)]  last:border-0">
              <div className="text-xs font-bold text-[var(--primary)] min-w-[40px]">{r.reservation_time?.substring(0, 5)}</div>
              <div className="flex-1 text-xs ">{r.customer_name} · {r.party_size}명</div>
              <div className="text-[10px] text-[var(--gray-400)]">{r.service}</div>
            </div>
          ))}
        </div>

        {/* Today events */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] ">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-[var(--gray-500)]">📅 오늘 일정</div>
            <button onClick={() => setTab("calendar")} className="text-[10px] text-[var(--primary)]">전체보기</button>
          </div>
          {todayEvents.length === 0 ? (
            <div className="text-center py-4 text-xs text-[var(--gray-400)]">일정이 없습니다</div>
          ) : todayEvents.map((e) => (
            <div key={e.id} className="flex items-center gap-2 py-2 border-b border-[var(--border-light)]  last:border-0">
              <div className="w-[3px] h-6 rounded" style={{ background: e.color || "var(--primary)" }} />
              <div className="text-xs text-[var(--gray-500)] min-w-[40px]">{e.start_time?.substring(0, 5) || "종일"}</div>
              <div className="flex-1 text-xs ">{e.title}</div>
            </div>
          ))}
        </div>

        {/* Pending todos */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] ">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-[var(--gray-500)]">✅ 할일</div>
            <button onClick={() => setTab("todos")} className="text-[10px] text-[var(--primary)]">전체보기</button>
          </div>
          {pendingTodos.length === 0 ? (
            <div className="text-center py-4 text-xs text-[var(--gray-400)]">할일이 없습니다</div>
          ) : pendingTodos.map((t) => (
            <div key={t.id} className="flex items-center gap-2 py-2 border-b border-[var(--border-light)]  last:border-0">
              <div className="w-4 h-4 rounded-full border-2 border-[var(--gray-300)] shrink-0" />
              <div className="flex-1 text-xs ">{t.title}</div>
              {t.priority > 0 && <div className="text-[9px] text-[var(--danger)] font-bold">중요</div>}
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] ">
          <div className="text-xs font-semibold text-[var(--gray-500)] mb-3">📊 현황</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setTab("contacts")} className="text-left py-2">
              <div className="text-lg font-bold ">{stats.contacts}</div>
              <div className="text-[10px] text-[var(--gray-400)]">연락처</div>
            </button>
            <button onClick={() => setTab("quotes")} className="text-left py-2">
              <div className="text-lg font-bold ">{stats.quotes}</div>
              <div className="text-[10px] text-[var(--gray-400)]">견적서</div>
            </button>
            <button onClick={() => setTab("payroll")} className="text-left py-2">
              <div className="text-lg font-bold ">{stats.employees}</div>
              <div className="text-[10px] text-[var(--gray-400)]">직원</div>
            </button>
            <button onClick={() => setTab("notes")} className="text-left py-2">
              <div className="text-lg font-bold ">{stats.notes}</div>
              <div className="text-[10px] text-[var(--gray-400)]">메모</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

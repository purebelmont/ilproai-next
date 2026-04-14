"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const fmt = (n: number) => "₩" + n.toLocaleString();
const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

export default function ReportPanel({ userId }: { userId: string }) {
  const now = new Date();
  const [view, setView] = useState<"month" | "year">("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [reservationStats, setReservationStats] = useState<any>(null);
  const [contactStats, setContactStats] = useState<any>(null);
  const [todoStats, setTodoStats] = useState<any>(null);

  const loadYear = useCallback(async () => {
    const months: any[] = [];
    for (let m = 1; m <= 12; m++) {
      const ms = `${year}-${String(m).padStart(2, "0")}`;
      const start = `${ms}-01`;
      const endDay = new Date(year, m, 0).getDate();
      const end = `${ms}-${endDay}`;
      const { data: incData } = await supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "income").gte("entry_date", start).lte("entry_date", end);
      const { data: expData } = await supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "expense").gte("entry_date", start).lte("entry_date", end);
      const income = (incData || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      const expense = (expData || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      months.push({ month: m, income, expense, profit: income - expense });
    }
    setMonthlyData(months);
  }, [userId, year]);

  const loadMonth = useCallback(async () => {
    const ms = `${year}-${String(month).padStart(2, "0")}`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: any[] = [];

    // 전체 월 데이터를 한번에 가져와서 일별로 분리
    const start = `${ms}-01`;
    const end = `${ms}-${daysInMonth}`;
    const { data: incAll } = await supabase.from("ledger").select("amount, entry_date").eq("user_id", userId).eq("entry_type", "income").gte("entry_date", start).lte("entry_date", end);
    const { data: expAll } = await supabase.from("ledger").select("amount, entry_date").eq("user_id", userId).eq("entry_type", "expense").gte("entry_date", start).lte("entry_date", end);

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${ms}-${String(d).padStart(2, "0")}`;
      const income = (incAll || []).filter((r: any) => r.entry_date === ds).reduce((s: number, r: any) => s + Number(r.amount), 0);
      const expense = (expAll || []).filter((r: any) => r.entry_date === ds).reduce((s: number, r: any) => s + Number(r.amount), 0);
      days.push({ day: d, income, expense, profit: income - expense });
    }
    setDailyData(days);

    // 예약 stats
    const { data: rvData } = await supabase.from("reservations").select("party_size, status").eq("user_id", userId).gte("reservation_date", start).lte("reservation_date", end);
    const rv = rvData || [];
    setReservationStats({ total: rv.length, guests: rv.reduce((s: number, r: any) => s + r.party_size, 0), completed: rv.filter((r: any) => r.status === "completed").length, noshow: rv.filter((r: any) => r.status === "noshow").length });

    // 연락처
    const { count: contactCount } = await supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", userId);
    const { data: groups } = await supabase.from("contacts").select("group_name").eq("user_id", userId).neq("group_name", "");
    setContactStats({ total: contactCount || 0, groups: new Set((groups || []).map((g: any) => g.group_name)).size });

    // 할일
    const { data: todoData } = await supabase.from("todos").select("completed").eq("user_id", userId);
    const todos = todoData || [];
    setTodoStats({ total: todos.length, completed: todos.filter((t: any) => t.completed).length, pending: todos.filter((t: any) => !t.completed).length });
  }, [userId, year, month]);

  useEffect(() => {
    if (view === "year") loadYear();
    else loadMonth();
  }, [view, loadYear, loadMonth]);

  // 연간 계산
  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthlyData.reduce((s, m) => s + m.expense, 0);
  const maxVal = Math.max(1, ...monthlyData.map(m => Math.max(m.income, m.expense)));
  const hasYearData = monthlyData.some(m => m.income > 0 || m.expense > 0);

  // 월간 계산
  const mIncome = dailyData.reduce((s, d) => s + d.income, 0);
  const mExpense = dailyData.reduce((s, d) => s + d.expense, 0);
  const maxDayVal = Math.max(1, ...dailyData.map(d => Math.max(d.income, d.expense)));
  const hasMonthData = dailyData.some(d => d.income > 0 || d.expense > 0);
  const activeDays = dailyData.filter(d => d.income > 0 || d.expense > 0);

  // 월 이동
  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); };

  return (
    <div className="p-5">
      {/* Header + View Toggle */}
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-lg font-bold">리포트</h4>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-full p-0.5" style={{ background: "var(--bg-hover)" }}>
            <button onClick={() => setView("month")}
              className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
              style={{ background: view === "month" ? "var(--primary)" : "transparent", color: view === "month" ? "#fff" : "var(--text-muted)" }}>
              월
            </button>
            <button onClick={() => setView("year")}
              className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
              style={{ background: view === "year" ? "var(--primary)" : "transparent", color: view === "year" ? "#fff" : "var(--text-muted)" }}>
              년
            </button>
          </div>
        </div>
      </div>

      {/* Period navigator */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <button onClick={() => view === "year" ? setYear(year - 1) : prevMonth()} className="text-[var(--primary)] text-lg font-bold px-2">‹</button>
        <span className="text-sm font-bold min-w-[100px] text-center">
          {view === "year" ? `${year}년` : `${year}년 ${month}월`}
        </span>
        <button onClick={() => view === "year" ? setYear(year + 1) : nextMonth()} className="text-[var(--primary)] text-lg font-bold px-2">›</button>
      </div>

      {/* ═══════════════════════ */}
      {/* ═══ 월간 리포트 ═══ */}
      {/* ═══════════════════════ */}
      {view === "month" && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-[var(--bg-card)] rounded-xl p-3 text-center border border-[var(--gray-200)]">
              <div className="text-[10px] text-[var(--gray-500)]">매출</div>
              <div className="text-sm font-extrabold text-[var(--primary)]">{fmt(mIncome)}</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-xl p-3 text-center border border-[var(--gray-200)]">
              <div className="text-[10px] text-[var(--gray-500)]">지출</div>
              <div className="text-sm font-extrabold text-[var(--danger)]">{fmt(mExpense)}</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-xl p-3 text-center border border-[var(--gray-200)]">
              <div className="text-[10px] text-[var(--gray-500)]">순이익</div>
              <div className="text-sm font-extrabold" style={{ color: mIncome - mExpense >= 0 ? "var(--success)" : "var(--danger)" }}>{fmt(mIncome - mExpense)}</div>
            </div>
          </div>

          {/* Daily chart */}
          <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--gray-200)] mb-6">
            <div className="text-xs font-semibold text-[var(--gray-500)] mb-4">일별 매출/지출</div>
            {!hasMonthData ? (
              <div className="text-center py-8 text-[var(--gray-400)] text-sm">{month}월 매출 데이터가 없습니다</div>
            ) : (
              <div className="space-y-2">
                {activeDays.map((d) => (
                  <div key={d.day}>
                    <div className="text-[11px] font-semibold mb-1">{d.day}일</div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-6 text-[9px] text-[var(--gray-500)]">매출</div>
                      <div className="flex-1 bg-[var(--gray-100)] rounded-full h-2.5 overflow-hidden">
                        <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${Math.max(2, (d.income / maxDayVal) * 100)}%` }} />
                      </div>
                      <div className="text-[10px] text-[var(--gray-500)] w-20 text-right">{fmt(d.income)}</div>
                    </div>
                    {d.expense > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 text-[9px] text-[var(--gray-500)]">지출</div>
                        <div className="flex-1 bg-[var(--gray-100)] rounded-full h-2.5 overflow-hidden">
                          <div className="h-full bg-[var(--danger)] rounded-full transition-all" style={{ width: `${Math.max(2, (d.expense / maxDayVal) * 100)}%` }} />
                        </div>
                        <div className="text-[10px] text-[var(--gray-500)] w-20 text-right">{fmt(d.expense)}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--gray-200)]">
              <div className="text-xs font-semibold text-[var(--gray-500)] mb-3">📋 이번달 예약</div>
              {reservationStats ? (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-[var(--gray-500)]">총 예약</span><span className="font-semibold">{reservationStats.total}건</span></div>
                  <div className="flex justify-between"><span className="text-[var(--gray-500)]">총 손님</span><span className="font-semibold">{reservationStats.guests}명</span></div>
                  <div className="flex justify-between"><span className="text-[var(--gray-500)]">완료</span><span className="font-semibold text-[var(--success)]">{reservationStats.completed}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--gray-500)]">노쇼</span><span className="font-semibold text-[var(--danger)]">{reservationStats.noshow}</span></div>
                </div>
              ) : <div className="text-xs text-[var(--gray-400)]">로딩...</div>}
            </div>

            <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--gray-200)]">
              <div className="text-xs font-semibold text-[var(--gray-500)] mb-3">📊 월간 요약</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-[var(--gray-500)]">거래일</span><span className="font-semibold">{activeDays.length}일</span></div>
                <div className="flex justify-between"><span className="text-[var(--gray-500)]">일평균 매출</span><span className="font-semibold text-[var(--primary)]">{fmt(Math.round(mIncome / Math.max(1, activeDays.filter(d => d.income > 0).length)))}</span></div>
                <div className="flex justify-between"><span className="text-[var(--gray-500)]">최대 매출일</span><span className="font-semibold">{activeDays.length > 0 ? activeDays.reduce((a, b) => a.income > b.income ? a : b).day + "일" : "-"}</span></div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--gray-200)]">
              <div className="text-xs font-semibold text-[var(--gray-500)] mb-3">👤 연락처</div>
              {contactStats ? (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-[var(--gray-500)]">전체</span><span className="font-semibold">{contactStats.total}명</span></div>
                  <div className="flex justify-between"><span className="text-[var(--gray-500)]">그룹</span><span className="font-semibold">{contactStats.groups}개</span></div>
                </div>
              ) : <div className="text-xs text-[var(--gray-400)]">로딩...</div>}
            </div>

            <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--gray-200)]">
              <div className="text-xs font-semibold text-[var(--gray-500)] mb-3">✅ 할일</div>
              {todoStats ? (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-[var(--gray-500)]">전체</span><span className="font-semibold">{todoStats.total}건</span></div>
                  <div className="flex justify-between"><span className="text-[var(--gray-500)]">미완료</span><span className="font-semibold text-[var(--warning)]">{todoStats.pending}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--gray-500)]">완료</span><span className="font-semibold text-[var(--success)]">{todoStats.completed}</span></div>
                  {todoStats.total > 0 && (
                    <div className="mt-2 bg-[var(--gray-100)] rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-[var(--success)] rounded-full" style={{ width: `${(todoStats.completed / todoStats.total) * 100}%` }} />
                    </div>
                  )}
                </div>
              ) : <div className="text-xs text-[var(--gray-400)]">로딩...</div>}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════ */}
      {/* ═══ 연간 리포트 ═══ */}
      {/* ═══════════════════════ */}
      {view === "year" && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-[var(--bg-card)] rounded-xl p-3 text-center border border-[var(--gray-200)]">
              <div className="text-[10px] text-[var(--gray-500)]">연간 매출</div>
              <div className="text-sm font-extrabold text-[var(--primary)]">{fmt(totalIncome)}</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-xl p-3 text-center border border-[var(--gray-200)]">
              <div className="text-[10px] text-[var(--gray-500)]">연간 지출</div>
              <div className="text-sm font-extrabold text-[var(--danger)]">{fmt(totalExpense)}</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-xl p-3 text-center border border-[var(--gray-200)]">
              <div className="text-[10px] text-[var(--gray-500)]">순이익</div>
              <div className="text-sm font-extrabold text-[var(--success)]">{fmt(totalIncome - totalExpense)}</div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--gray-200)] mb-6">
            <div className="text-xs font-semibold text-[var(--gray-500)] mb-4">월별 매출/지출</div>
            {!hasYearData ? (
              <div className="text-center py-8 text-[var(--gray-400)] text-sm">{year}년 매출 데이터가 없습니다</div>
            ) : (
              <div className="space-y-3">
                {monthlyData.map((m) => {
                  if (m.income === 0 && m.expense === 0) return null;
                  return (
                    <button key={m.month} onClick={() => { setMonth(m.month); setView("month"); }} className="w-full text-left hover:opacity-80 transition-opacity">
                      <div className="text-xs font-semibold mb-1">{MONTHS[m.month - 1]}</div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-6 text-[9px] text-[var(--gray-500)]">매출</div>
                        <div className="flex-1 bg-[var(--gray-100)] rounded-full h-3 overflow-hidden">
                          <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${Math.max(2, (m.income / maxVal) * 100)}%` }} />
                        </div>
                        <div className="text-[10px] text-[var(--gray-500)] w-20 text-right">{fmt(m.income)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 text-[9px] text-[var(--gray-500)]">지출</div>
                        <div className="flex-1 bg-[var(--gray-100)] rounded-full h-3 overflow-hidden">
                          <div className="h-full bg-[var(--danger)] rounded-full transition-all" style={{ width: `${Math.max(2, (m.expense / maxVal) * 100)}%` }} />
                        </div>
                        <div className="text-[10px] text-[var(--gray-500)] w-20 text-right">{fmt(m.expense)}</div>
                      </div>
                      <div className="text-[10px] text-[var(--success)] mt-0.5 ml-8">순이익: {fmt(m.profit)}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--gray-200)]">
            <div className="text-xs font-semibold text-[var(--gray-500)] mb-3">📊 연간 요약</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-[var(--gray-500)]">매출 발생</span><span className="font-semibold">{monthlyData.filter(m => m.income > 0).length}개월</span></div>
              <div className="flex justify-between"><span className="text-[var(--gray-500)]">월평균 매출</span><span className="font-semibold text-[var(--primary)]">{fmt(Math.round(totalIncome / Math.max(1, monthlyData.filter(m => m.income > 0).length)))}</span></div>
              <div className="flex justify-between"><span className="text-[var(--gray-500)]">월평균 지출</span><span className="font-semibold">{fmt(Math.round(totalExpense / Math.max(1, monthlyData.filter(m => m.expense > 0).length)))}</span></div>
              <div className="flex justify-between"><span className="text-[var(--gray-500)]">최고 매출월</span><span className="font-semibold">{monthlyData.some(m => m.income > 0) ? MONTHS[monthlyData.reduce((a, b) => a.income > b.income ? a : b).month - 1] : "-"}</span></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

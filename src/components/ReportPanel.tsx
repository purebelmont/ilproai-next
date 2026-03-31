"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const fmt = (n: number) => "₩" + n.toLocaleString();
const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

export default function ReportPanel({ userId }: { userId: string }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [reservationStats, setReservationStats] = useState<any>(null);
  const [contactStats, setContactStats] = useState<any>(null);
  const [todoStats, setTodoStats] = useState<any>(null);

  const load = useCallback(async () => {
    // Monthly income/expense
    const months: any[] = [];
    for (let m = 1; m <= 12; m++) {
      const ms = `${year}-${String(m).padStart(2, "0")}`;
      const start = `${ms}-01`;
      const endDay = new Date(year, m, 0).getDate();
      const end = `${ms}-${endDay}`;

      const { data: incData } = await supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "income").gte("entry_date", start).lte("entry_date", end);
      const { data: expData } = await supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "expense").gte("entry_date", start).lte("entry_date", end);

      const income = (incData || []).reduce((s, r) => s + Number(r.amount), 0);
      const expense = (expData || []).reduce((s, r) => s + Number(r.amount), 0);
      months.push({ month: m, income, expense, profit: income - expense });
    }
    setMonthlyData(months);

    // Reservation stats
    const thisMonth = `${year}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    const { data: rvData } = await supabase.from("reservations").select("party_size, status").eq("user_id", userId).gte("reservation_date", `${thisMonth}-01`);
    const rv = rvData || [];
    setReservationStats({
      total: rv.length,
      guests: rv.reduce((s, r) => s + r.party_size, 0),
      completed: rv.filter(r => r.status === "completed").length,
      noshow: rv.filter(r => r.status === "noshow").length,
    });

    // Contact stats
    const { count: contactCount } = await supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", userId);
    const { data: groups } = await supabase.from("contacts").select("group_name").eq("user_id", userId).neq("group_name", "");
    const uniqueGroups = new Set((groups || []).map(g => g.group_name));
    setContactStats({ total: contactCount || 0, groups: uniqueGroups.size });

    // Todo stats
    const { data: todoData } = await supabase.from("todos").select("completed").eq("user_id", userId);
    const todos = todoData || [];
    setTodoStats({
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      pending: todos.filter(t => !t.completed).length,
    });
  }, [userId, year]);

  useEffect(() => { load(); }, [load]);

  const hasData = monthlyData.some(m => m.income > 0 || m.expense > 0);
  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthlyData.reduce((s, m) => s + m.expense, 0);
  const maxVal = Math.max(1, ...monthlyData.map(m => Math.max(m.income, m.expense)));

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-lg font-bold">리포트</h4>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear(year - 1)} className="text-[var(--primary)] text-sm">‹</button>
          <span className="text-sm font-semibold">{year}년</span>
          <button onClick={() => setYear(year + 1)} className="text-[var(--primary)] text-sm">›</button>
        </div>
      </div>

      {/* Summary cards */}
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

      {/* Monthly chart */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--gray-200)] mb-6">
        <div className="text-xs font-semibold text-[var(--gray-500)] mb-4">월별 매출/지출</div>
        {!hasData ? (
          <div className="text-center py-8 text-[var(--gray-400)] text-sm">매출 데이터가 없습니다</div>
        ) : (
          <div className="space-y-3">
            {monthlyData.map((m) => {
              if (m.income === 0 && m.expense === 0) return null;
              return (
                <div key={m.month}>
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Other stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Reservations */}
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

        {/* Contacts */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--gray-200)]">
          <div className="text-xs font-semibold text-[var(--gray-500)] mb-3">👤 연락처</div>
          {contactStats ? (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-[var(--gray-500)]">전체</span><span className="font-semibold">{contactStats.total}명</span></div>
              <div className="flex justify-between"><span className="text-[var(--gray-500)]">그룹</span><span className="font-semibold">{contactStats.groups}개</span></div>
            </div>
          ) : <div className="text-xs text-[var(--gray-400)]">로딩...</div>}
        </div>

        {/* Todos */}
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

        {/* Quick summary */}
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--gray-200)]">
          <div className="text-xs font-semibold text-[var(--gray-500)] mb-3">📊 요약</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-[var(--gray-500)]">매출 데이터</span><span className="font-semibold">{monthlyData.filter(m => m.income > 0).length}개월</span></div>
            <div className="flex justify-between"><span className="text-[var(--gray-500)]">월평균 매출</span><span className="font-semibold text-[var(--primary)]">{fmt(Math.round(totalIncome / Math.max(1, monthlyData.filter(m => m.income > 0).length)))}</span></div>
            <div className="flex justify-between"><span className="text-[var(--gray-500)]">월평균 지출</span><span className="font-semibold">{fmt(Math.round(totalExpense / Math.max(1, monthlyData.filter(m => m.expense > 0).length)))}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

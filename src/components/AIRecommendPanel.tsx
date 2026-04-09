"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Recommendation = {
  id: string;
  icon: string;
  priority: "urgent" | "high" | "medium" | "low";
  title: string;
  desc: string;
  action: string;
  tab?: string;
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  urgent: { bg: "#FF3B3020", text: "#FF3B30", label: "긴급" },
  high: { bg: "#FF950020", text: "#FF9500", label: "중요" },
  medium: { bg: "#0071E320", text: "#0071E3", label: "추천" },
  low: { bg: "#30D15820", text: "#30D158", label: "참고" },
};

export default function AIRecommendPanel({ userId, setTab }: { userId: string; setTab: (t: any) => void }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);

  const analyze = useCallback(async () => {
    setLoading(true);
    setAnalyzing(true);
    setProgress(0);

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const monthStart = today.substring(0, 7) + "-01";
    const lastMonthStart = (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().split("T")[0].substring(0, 7) + "-01";
    })();
    const lastMonthEnd = (() => {
      const d = new Date();
      d.setDate(0);
      return d.toISOString().split("T")[0];
    })();

    const recs: Recommendation[] = [];

    // Step 1: Fetch all data in parallel
    setProgress(10);
    const [
      todosRes,
      todaySchedules,
      tomorrowSchedules,
      todayReservations,
      tomorrowReservations,
      monthIncome,
      monthExpense,
      lastMonthIncome,
      lastMonthExpense,
      contactsCount,
      quotesRes,
      notesRes,
      employeesRes,
    ] = await Promise.all([
      supabase.from("todos").select("*").eq("user_id", userId).eq("completed", false),
      supabase.from("schedules").select("*").eq("user_id", userId).eq("start_date", today),
      supabase.from("schedules").select("*").eq("user_id", userId).eq("start_date", tomorrow),
      supabase.from("reservations").select("*").eq("user_id", userId).eq("reservation_date", today).neq("status", "cancelled"),
      supabase.from("reservations").select("*").eq("user_id", userId).eq("reservation_date", tomorrow).neq("status", "cancelled"),
      supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "income").gte("entry_date", monthStart),
      supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "expense").gte("entry_date", monthStart),
      supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "income").gte("entry_date", lastMonthStart).lte("entry_date", lastMonthEnd),
      supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "expense").gte("entry_date", lastMonthStart).lte("entry_date", lastMonthEnd),
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("quotes").select("*").eq("user_id", userId).eq("status", "draft"),
      supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("employees").select("*").eq("user_id", userId).eq("active", true),
    ]);

    setProgress(50);

    // Step 2: Analyze data and generate recommendations
    const todos = todosRes.data || [];
    const urgentTodos = todos.filter((t: any) => t.priority === 1);
    const totalTodos = todos.length;

    // --- Urgent todos ---
    if (urgentTodos.length > 0) {
      recs.push({
        id: "urgent-todos",
        icon: "🔴",
        priority: "urgent",
        title: `긴급 할일 ${urgentTodos.length}건`,
        desc: urgentTodos.slice(0, 2).map((t: any) => t.title).join(", ") + (urgentTodos.length > 2 ? ` 외 ${urgentTodos.length - 2}건` : ""),
        action: "할일 확인하기",
        tab: "todos",
      });
    }

    setProgress(60);

    // --- Today's schedule ---
    const todaySch = todaySchedules.data || [];
    if (todaySch.length > 0) {
      const nextEvent = todaySch.sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""))[0];
      recs.push({
        id: "today-schedule",
        icon: "📅",
        priority: "high",
        title: `오늘 일정 ${todaySch.length}건`,
        desc: `다음 일정: ${nextEvent.title} (${nextEvent.start_time || "시간미정"})`,
        action: "일정 확인하기",
        tab: "calendar",
      });
    }

    // --- Today's reservations ---
    const todayRes = todayReservations.data || [];
    if (todayRes.length > 0) {
      const totalGuests = todayRes.reduce((s: number, r: any) => s + (r.party_size || 0), 0);
      const unconfirmed = todayRes.filter((r: any) => r.status === "pending");
      if (unconfirmed.length > 0) {
        recs.push({
          id: "unconfirmed-reservations",
          icon: "⚠️",
          priority: "urgent",
          title: `미확인 예약 ${unconfirmed.length}건`,
          desc: unconfirmed.map((r: any) => `${r.customer_name} ${r.party_size}명`).join(", "),
          action: "예약 확인하기",
          tab: "reservations",
        });
      } else {
        recs.push({
          id: "today-reservations",
          icon: "📋",
          priority: "high",
          title: `오늘 예약 ${todayRes.length}건 (${totalGuests}명)`,
          desc: todayRes.slice(0, 3).map((r: any) => `${r.customer_name} ${r.reservation_time?.substring(0, 5) || ""}`).join(" · "),
          action: "예약 확인하기",
          tab: "reservations",
        });
      }
    }

    // --- Tomorrow preview ---
    const tmrwSch = tomorrowSchedules.data || [];
    const tmrwRes = tomorrowReservations.data || [];
    if (tmrwSch.length > 0 || tmrwRes.length > 0) {
      recs.push({
        id: "tomorrow-preview",
        icon: "🔮",
        priority: "medium",
        title: "내일 미리보기",
        desc: `일정 ${tmrwSch.length}건, 예약 ${tmrwRes.length}건${tmrwRes.length > 0 ? ` (${tmrwRes.reduce((s: number, r: any) => s + (r.party_size || 0), 0)}명)` : ""}`,
        action: "일정 확인하기",
        tab: "calendar",
      });
    }

    setProgress(70);

    // --- Revenue analysis ---
    const curIncome = (monthIncome.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
    const curExpense = (monthExpense.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
    const prevIncome = (lastMonthIncome.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
    const prevExpense = (lastMonthExpense.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);

    if (curIncome > 0 || curExpense > 0) {
      const profit = curIncome - curExpense;
      const prevProfit = prevIncome - prevExpense;

      if (curExpense > curIncome && curIncome > 0) {
        recs.push({
          id: "expense-warning",
          icon: "💸",
          priority: "urgent",
          title: "이번달 지출이 매출을 초과!",
          desc: `매출 ₩${curIncome.toLocaleString()} vs 지출 ₩${curExpense.toLocaleString()} — 적자 ₩${(curExpense - curIncome).toLocaleString()}`,
          action: "매출 분석하기",
          tab: "report",
        });
      } else if (prevIncome > 0 && curIncome < prevIncome * 0.8) {
        recs.push({
          id: "revenue-drop",
          icon: "📉",
          priority: "high",
          title: "매출 감소 주의",
          desc: `지난달 대비 매출이 ${Math.round((1 - curIncome / prevIncome) * 100)}% 감소했습니다`,
          action: "리포트 확인하기",
          tab: "report",
        });
      } else if (prevIncome > 0 && curIncome > prevIncome * 1.1) {
        recs.push({
          id: "revenue-up",
          icon: "📈",
          priority: "low",
          title: "매출 상승 중!",
          desc: `지난달 대비 매출이 ${Math.round((curIncome / prevIncome - 1) * 100)}% 증가했습니다. 순이익 ₩${profit.toLocaleString()}`,
          action: "리포트 확인하기",
          tab: "report",
        });
      } else if (curIncome > 0) {
        recs.push({
          id: "revenue-status",
          icon: "💰",
          priority: "low",
          title: `이번달 순이익 ₩${profit.toLocaleString()}`,
          desc: `매출 ₩${curIncome.toLocaleString()} · 지출 ₩${curExpense.toLocaleString()}`,
          action: "리포트 확인하기",
          tab: "report",
        });
      }
    }

    setProgress(80);

    // --- Draft quotes ---
    const drafts = quotesRes.data || [];
    if (drafts.length > 0) {
      recs.push({
        id: "draft-quotes",
        icon: "💼",
        priority: "medium",
        title: `미발송 견적서 ${drafts.length}건`,
        desc: drafts.slice(0, 2).map((q: any) => q.title || q.client_name || "견적서").join(", "),
        action: "견적서 확인하기",
        tab: "quotes",
      });
    }

    // --- Pending todos ---
    if (totalTodos > 5 && urgentTodos.length === 0) {
      recs.push({
        id: "many-todos",
        icon: "✅",
        priority: "medium",
        title: `미완료 할일 ${totalTodos}건`,
        desc: "할일을 정리하고 우선순위를 설정해보세요",
        action: "할일 정리하기",
        tab: "todos",
      });
    }

    // --- Empty data suggestions ---
    if ((contactsCount.count || 0) === 0) {
      recs.push({
        id: "no-contacts",
        icon: "👤",
        priority: "low",
        title: "연락처를 추가해보세요",
        desc: "거래처, 단골, 직원 연락처를 관리하면 업무가 편해집니다",
        action: "연락처 추가하기",
        tab: "contacts",
      });
    }

    if ((notesRes.count || 0) === 0 && totalTodos === 0 && todaySch.length === 0) {
      recs.push({
        id: "get-started",
        icon: "🚀",
        priority: "medium",
        title: "시작하기",
        desc: "샘플 데이터를 추가하면 모든 기능을 체험할 수 있어요",
        action: "홈에서 시작하기",
        tab: "home",
      });
    }

    // --- SNS / Marketing suggestion ---
    if (curIncome > 0) {
      recs.push({
        id: "sns-suggest",
        icon: "📣",
        priority: "low",
        title: "SNS 마케팅으로 매출 올리기",
        desc: "AI가 인스타/블로그 게시물을 자동 생성합니다. 무료 체험 가능!",
        action: "SNS 자동화 체험",
        tab: "automation",
      });
    }

    setProgress(100);

    // Sort by priority
    const order = { urgent: 0, high: 1, medium: 2, low: 3 };
    recs.sort((a, b) => order[a.priority] - order[b.priority]);

    // Simulate AI "thinking" animation
    await new Promise(r => setTimeout(r, 600));
    setRecommendations(recs);
    setAnalyzing(false);
    setLoading(false);
  }, [userId]);

  useEffect(() => { analyze(); }, [analyze]);

  // Progress animation
  useEffect(() => {
    if (!analyzing) return;
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 95));
    }, 100);
    return () => clearInterval(interval);
  }, [analyzing]);

  const urgentCount = recommendations.filter(r => r.priority === "urgent").length;
  const highCount = recommendations.filter(r => r.priority === "high").length;

  return (
    <div className="p-5">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)" }}>
            <span className="text-white text-sm">✨</span>
          </div>
          <h4 className="text-lg font-bold">AI 추천</h4>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>데이터를 분석해서 지금 가장 필요한 일을 알려드려요</p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="rounded-2xl p-6 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full animate-spin border-2 border-t-transparent" style={{ borderColor: "#7D2AE7", borderTopColor: "transparent" }} />
            <span className="text-sm font-medium">데이터 분석 중...</span>
          </div>
          <div className="space-y-2 text-xs" style={{ color: "var(--text-muted)" }}>
            <div className="flex items-center gap-2">
              <span>{progress > 10 ? "✓" : "○"}</span>
              <span>할일 · 일정 · 예약 확인</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{progress > 50 ? "✓" : "○"}</span>
              <span>매출 · 지출 분석</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{progress > 70 ? "✓" : "○"}</span>
              <span>견적 · 연락처 점검</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{progress > 90 ? "✓" : "○"}</span>
              <span>우선순위 결정</span>
            </div>
          </div>
          <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7D2AE7, #0071E3)" }} />
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <>
          {/* Summary bar */}
          {recommendations.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {urgentCount > 0 && (
                <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: PRIORITY_STYLES.urgent.bg, color: PRIORITY_STYLES.urgent.text }}>
                  🔴 긴급 {urgentCount}
                </div>
              )}
              {highCount > 0 && (
                <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: PRIORITY_STYLES.high.bg, color: PRIORITY_STYLES.high.text }}>
                  🟠 중요 {highCount}
                </div>
              )}
              <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                전체 {recommendations.length}건
              </div>
            </div>
          )}

          {/* Recommendation cards */}
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const style = PRIORITY_STYLES[rec.priority];
              return (
                <button key={rec.id}
                  onClick={() => rec.tab && setTab(rec.tab)}
                  className="w-full text-left rounded-xl p-4 transition-all active:scale-[0.98]"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: style.bg }}>
                      {rec.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold">{rec.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: style.bg, color: style.text }}>
                          {style.label}
                        </span>
                      </div>
                      <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{rec.desc}</div>
                      <div className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                        {rec.action} →
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Empty state */}
          {recommendations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎉</div>
              <div className="text-base font-bold mb-1">모든 업무가 정리되었어요!</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>긴급한 업무가 없습니다. 잘 하고 계세요!</div>
            </div>
          )}

          {/* Refresh button */}
          <button onClick={analyze}
            className="w-full mt-4 py-3 rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--primary)" }}>
            🔄 다시 분석하기
          </button>
        </>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const fmt = (n: number) => "₩" + n.toLocaleString();

type Tool = { id: string; icon: string; label: string; color: string; pro?: boolean };

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

const TIER2_TOOLS: Tool[] = [
  { id: "website", icon: "🌐", label: "홈페이지", color: "#0071E3", pro: true },
  { id: "automation", icon: "🤖", label: "자동화", color: "#7D2AE7", pro: true },
];

const BANNERS = [
  { title: "AI 홈페이지 빌더", subtitle: "5분만에 내 가게 사이트 만들기", color: "linear-gradient(135deg, #0071E3, #5856D6)", tab: "website" },
  { title: "견적서 자동화", subtitle: "PDF 견적서를 2분만에 작성", color: "linear-gradient(135deg, #FF6B35, #FF2D55)", tab: "quotes" },
  { title: "매출 리포트", subtitle: "이번 달 매출/지출을 한 눈에", color: "linear-gradient(135deg, #30D158, #007AFF)", tab: "report" },
];

export default function HomePanel({ userId, profile, setTab }: { userId: string; profile: any; setTab: (t: any) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [recentItems, setRecentItems] = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0];
  const d = new Date();
  const greeting = d.getHours() < 12 ? "좋은 아침이에요" : d.getHours() < 18 ? "좋은 오후에요" : "수고하셨어요";

  const load = useCallback(async () => {
    const [contacts, schedules, reservations, todos, ledgerInc, ledgerExp, quotes, notes] = await Promise.all([
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("schedules").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("start_date", today),
      supabase.from("reservations").select("party_size").eq("user_id", userId).eq("reservation_date", today).neq("status", "cancelled"),
      supabase.from("todos").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("completed", false),
      supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "income").gte("entry_date", today.substring(0, 7) + "-01"),
      supabase.from("ledger").select("amount").eq("user_id", userId).eq("entry_type", "expense").gte("entry_date", today.substring(0, 7) + "-01"),
      supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", userId),
    ]);

    const rvData = reservations.data || [];
    const monthIncome = (ledgerInc.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
    const monthExpense = (ledgerExp.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);

    setStats({
      contacts: contacts.count || 0,
      notes: notes.count || 0,
      pendingTodos: todos.count || 0,
      todaySchedules: schedules.count || 0,
      todayReservations: rvData.length,
      todayGuests: rvData.reduce((s: number, r: any) => s + r.party_size, 0),
      quotes: quotes.count || 0,
      monthIncome, monthExpense,
    });

    // Fetch recent activity across tables
    const [recentNotes, recentContacts, recentQuotes, recentReservations] = await Promise.all([
      supabase.from("notes").select("id, title, content, color, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(4),
      supabase.from("contacts").select("id, name, company, phone, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(4),
      supabase.from("quotes").select("id, title, client_name, status, grand_total, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(4),
      supabase.from("reservations").select("id, customer_name, party_size, reservation_date, reservation_time, status, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(4),
    ]);

    // Merge and sort all recent items
    const items: any[] = [
      ...(recentNotes.data || []).map((n: any) => ({ type: "note", tab: "notes", icon: "📝", title: n.title || n.content?.substring(0, 30) || "메모", subtitle: n.content?.substring(0, 50), color: n.color, time: n.updated_at })),
      ...(recentContacts.data || []).map((c: any) => ({ type: "contact", tab: "contacts", icon: "👤", title: c.name, subtitle: [c.company, c.phone].filter(Boolean).join(" · "), time: c.updated_at })),
      ...(recentQuotes.data || []).map((q: any) => ({ type: "quote", tab: "quotes", icon: "💼", title: q.title || q.client_name || "견적서", subtitle: q.status === "draft" ? "초안" : q.status === "sent" ? "발송" : "확정", time: q.updated_at })),
      ...(recentReservations.data || []).map((r: any) => ({ type: "reservation", tab: "reservations", icon: "📋", title: `${r.customer_name} · ${r.party_size}명`, subtitle: `${r.reservation_date} ${r.reservation_time?.substring(0, 5) || ""}`, time: r.created_at })),
    ];
    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setRecentItems(items.slice(0, 8));
  }, [userId, today]);

  useEffect(() => { load(); }, [load]);

  if (!stats) return <div className="p-5 text-center"><div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto" /></div>;

  const bizName = profile?.business_name || profile?.name || "";
  const allTools = [...TIER1_TOOLS, ...TIER2_TOOLS];

  return (
    <div className="p-5">
      {/* Hero greeting */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">{greeting} 👋</h2>
        {bizName && <p className="text-sm text-[var(--text-muted)] mt-1">{bizName}</p>}
      </div>

      {/* Quick stats bar */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => setTab("reservations")} className="shrink-0 bg-[var(--bg-card)] rounded-xl px-4 py-3 border border-[var(--border)] active:scale-[0.98] transition-transform">
          <div className="text-lg font-extrabold text-[var(--primary)]">{stats.todayReservations}</div>
          <div className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">오늘 예약 · {stats.todayGuests}명</div>
        </button>
        <button onClick={() => setTab("calendar")} className="shrink-0 bg-[var(--bg-card)] rounded-xl px-4 py-3 border border-[var(--border)] active:scale-[0.98] transition-transform">
          <div className="text-lg font-extrabold text-[#FF9500]">{stats.todaySchedules}</div>
          <div className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">오늘 일정</div>
        </button>
        <button onClick={() => setTab("todos")} className="shrink-0 bg-[var(--bg-card)] rounded-xl px-4 py-3 border border-[var(--border)] active:scale-[0.98] transition-transform">
          <div className="text-lg font-extrabold text-[var(--danger)]">{stats.pendingTodos}</div>
          <div className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">미완료 할일</div>
        </button>
        <button onClick={() => setTab("ledger")} className="shrink-0 bg-[var(--bg-card)] rounded-xl px-4 py-3 border border-[var(--border)] active:scale-[0.98] transition-transform">
          <div className="text-lg font-extrabold text-[var(--success)]">{fmt(stats.monthIncome - stats.monthExpense)}</div>
          <div className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">이번달 순이익</div>
        </button>
      </div>

      {/* Tool grid — Canva-style icon row */}
      <div className="mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
          {allTools.map((tool) => (
            <button key={tool.id} onClick={() => setTab(tool.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 active:scale-95 transition-transform" style={{ minWidth: 64 }}>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: tool.color + "15" }}>
                  {tool.icon}
                </div>
                {tool.pro && (
                  <span className="absolute -top-1 -right-1 text-[8px] px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: "linear-gradient(135deg, #0071E3, #5856D6)" }}>PRO</span>
                )}
              </div>
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* What's New — horizontal scroll banners */}
      <div className="mb-6">
        <h3 className="text-base font-bold mb-3">새 소식</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
          {BANNERS.map((banner, i) => (
            <button key={i} onClick={() => setTab(banner.tab)}
              className="shrink-0 w-[240px] md:w-[280px] rounded-2xl p-5 text-left active:scale-[0.98] transition-transform relative overflow-hidden"
              style={{ background: banner.color, minHeight: 120 }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15" style={{ background: "white", transform: "translate(30%, -30%)" }} />
              <div className="relative">
                <div className="text-white font-bold text-sm mb-1">{banner.title}</div>
                <div className="text-white/70 text-xs">{banner.subtitle}</div>
                <div className="text-white/50 text-[11px] mt-3 font-medium">바로가기 →</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Monthly summary card */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-[var(--text-muted)]">이번달 매출 요약</div>
          <button onClick={() => setTab("report")} className="text-[10px] text-[var(--primary)] font-medium">리포트 →</button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><div className="text-sm font-extrabold text-[var(--primary)]">{fmt(stats.monthIncome)}</div><div className="text-[10px] text-[var(--text-muted)]">매출</div></div>
          <div><div className="text-sm font-extrabold text-[var(--danger)]">{fmt(stats.monthExpense)}</div><div className="text-[10px] text-[var(--text-muted)]">지출</div></div>
          <div><div className="text-sm font-extrabold text-[var(--success)]">{fmt(stats.monthIncome - stats.monthExpense)}</div><div className="text-[10px] text-[var(--text-muted)]">순이익</div></div>
        </div>
      </div>

      {/* Recents — Canva-style grid */}
      <div>
        <h3 className="text-base font-bold mb-3">최근 항목</h3>
        {recentItems.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            <div className="text-3xl mb-2">📂</div>
            <div className="text-sm">아직 데이터가 없어요</div>
            <div className="text-xs mt-1">샘플 데이터를 추가하거나 직접 입력해보세요</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recentItems.map((item, i) => (
              <button key={i} onClick={() => setTab(item.tab)}
                className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-3 text-left active:scale-[0.98] transition-transform hover:border-[var(--primary)] group">
                {/* Thumbnail bar */}
                <div className="w-full h-2 rounded-full mb-3" style={{ background: item.color || TIER1_TOOLS.find(t => t.id === item.tab)?.color || "var(--primary)", opacity: 0.6 }} />
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="text-xs font-semibold truncate">{item.title}</div>
                {item.subtitle && <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{item.subtitle}</div>}
                <div className="text-[9px] text-[var(--text-muted)] mt-2">{timeAgo(item.time)}</div>
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

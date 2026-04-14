"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { SUPPORT_PROGRAMS, type SupportProgram } from "@/data/support-programs";
import { BLOG_POSTS } from "@/app/blog/page";

const ADMIN_EMAILS = ["james@contavelo.com", "admin@ilpro.ai", "purebelmont@gmail.com"];

type Tab = "overview" | "users" | "feedback" | "announcements" | "api" | "programs" | "blog" | "settings";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  // Data
  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserData, setSelectedUserData] = useState<any>(null);

  // Announcement form
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email || "")) {
        router.push("/dashboard");
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, [router]);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [profiles, fb, ann, logs] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("feedbacks").select("*").order("created_at", { ascending: false }),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("api_logs").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setUsers(profiles.data || []);
    setFeedbacks(fb.data || []);
    setAnnouncements(ann.data || []);
    setApiLogs(logs.data || []);

    const { count: tc } = await supabase.from("contacts").select("*", { count: "exact", head: true });
    const { count: tl } = await supabase.from("ledger").select("*", { count: "exact", head: true });
    const { count: tr } = await supabase.from("reservations").select("*", { count: "exact", head: true });
    const { count: tt } = await supabase.from("todos").select("*", { count: "exact", head: true });
    const { count: tn } = await supabase.from("notes").select("*", { count: "exact", head: true });

    setStats({
      totalUsers: (profiles.data || []).length,
      activeUsers: (profiles.data || []).filter((p: any) => p.last_login_at && new Date(p.last_login_at) > new Date(Date.now() - 7 * 86400000)).length,
      proUsers: (profiles.data || []).filter((p: any) => p.is_pro).length,
      totalContacts: tc || 0, totalLedger: tl || 0, totalReservations: tr || 0, totalTodos: tt || 0, totalNotes: tn || 0,
      totalFeedbacks: (fb.data || []).length,
      totalApiCalls: (logs.data || []).length,
      totalApiCost: (logs.data || []).reduce((s: number, l: any) => s + Number(l.cost || 0), 0),
    });
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Load user detail
  async function loadUserDetail(u: any) {
    setSelectedUser(u);
    const [contacts, ledger, reservations, todos, notes] = await Promise.all([
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", u.id),
      supabase.from("ledger").select("*", { count: "exact", head: true }).eq("user_id", u.id),
      supabase.from("reservations").select("*", { count: "exact", head: true }).eq("user_id", u.id),
      supabase.from("todos").select("*", { count: "exact", head: true }).eq("user_id", u.id),
      supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", u.id),
    ]);
    const { data: apiData } = await supabase.from("api_logs").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(20);
    setSelectedUserData({ contacts: contacts.count || 0, ledger: ledger.count || 0, reservations: reservations.count || 0, todos: todos.count || 0, notes: notes.count || 0, apiLogs: apiData || [] });
  }

  async function togglePro(userId: string, current: boolean) {
    await supabase.from("profiles").update({ is_pro: !current, pro_expires_at: !current ? new Date(Date.now() + 90 * 86400000).toISOString() : null }).eq("id", userId);
    loadData();
  }

  async function addAnnouncement() {
    if (!annTitle.trim() || !annContent.trim()) return;
    await supabase.from("announcements").insert({ title: annTitle.trim(), content: annContent.trim() });
    setAnnTitle(""); setAnnContent("");
    loadData();
  }

  async function toggleAnnouncement(id: string, active: boolean) {
    await supabase.from("announcements").update({ active: !active }).eq("id", id);
    loadData();
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    loadData();
  }

  // Signup chart data (last 30 days)
  function getSignupChart() {
    const days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const ds = d.toISOString().split("T")[0];
      days.push({ date: ds, count: users.filter(u => u.created_at?.startsWith(ds)).length });
    }
    return days;
  }

  // Feature usage from API logs
  function getFeatureUsage() {
    const map: Record<string, number> = {};
    for (const log of apiLogs) {
      const ep = log.endpoint || "unknown";
      map[ep] = (map[ep] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  const S = (props: { children: React.ReactNode; style?: React.CSSProperties }) => <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.06)", ...props.style }}>{props.children}</div>;

  if (loading) return <div style={{ background: "#0a0a1a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" /></div>;

  const signupChart = getSignupChart();
  const maxSignup = Math.max(1, ...signupChart.map(d => d.count));
  const featureUsage = getFeatureUsage();

  return (
    <div style={{ background: "#0a0a1a", minHeight: "100vh", color: "#fff", fontFamily: "-apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/dashboard" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none" }}>← 대시보드</a>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
          <h1 style={{ fontSize: 16, fontWeight: 700 }}>🛡️ 관리자</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={loadData} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>🔄 새로고침</button>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{user?.email}</span>
        </div>
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 50px)" }}>
        {/* Sidebar */}
        <nav style={{ width: 180, padding: "12px 6px", borderRight: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          {([
            { id: "overview" as const, icon: "📊", label: "대시보드" },
            { id: "users" as const, icon: "👥", label: "유저 관리" },
            { id: "feedback" as const, icon: "💬", label: `피드백 (${feedbacks.length})` },
            { id: "announcements" as const, icon: "📢", label: "공지사항" },
            { id: "api" as const, icon: "⚡", label: "API 모니터링" },
            { id: "programs" as const, icon: "🔍", label: "지원사업" },
            { id: "blog" as const, icon: "📝", label: "블로그" },
            { id: "settings" as const, icon: "⚙️", label: "설정" },
          ]).map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedUser(null); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", border: "none", borderRadius: 8, background: tab === t.id ? "rgba(125,42,231,0.2)" : "transparent", color: tab === t.id ? "#A78BFA" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", marginBottom: 1, textAlign: "left" }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, padding: 20, overflow: "auto" }}>

          {/* ═══ Overview ═══ */}
          {tab === "overview" && stats && (<div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>대시보드</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { label: "총 유저", value: stats.totalUsers, color: "#7D2AE7" },
                { label: "활성 (7일)", value: stats.activeUsers, color: "#30D158" },
                { label: "PRO 유저", value: stats.proUsers, color: "#0071E3" },
                { label: "API 호출", value: stats.totalApiCalls, color: "#FF9500" },
                { label: "API 비용", value: "$" + stats.totalApiCost.toFixed(2), color: "#FF3B30" },
              ].map((m, i) => (
                <S key={i}><div style={{ fontSize: 24, fontWeight: 800, color: m.color, textAlign: "center" }}>{m.value}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 4 }}>{m.label}</div></S>
              ))}
            </div>

            {/* Signup chart */}
            <S style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "rgba(255,255,255,0.6)" }}>가입자 추이 (30일)</div>
              <div style={{ display: "flex", alignItems: "end", gap: 2, height: 60 }}>
                {signupChart.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "100%", borderRadius: 2, background: d.count > 0 ? "#7D2AE7" : "rgba(255,255,255,0.05)", height: Math.max(2, (d.count / maxSignup) * 50) }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
                <span>{signupChart[0]?.date.slice(5)}</span><span>{signupChart[29]?.date.slice(5)}</span>
              </div>
            </S>

            {/* Feature usage + data */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <S>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "rgba(255,255,255,0.6)" }}>기능별 사용량</div>
                {featureUsage.length === 0 ? <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>데이터 없음</div> :
                  featureUsage.map(([ep, count], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>{ep}</span>
                      <span style={{ fontWeight: 600 }}>{count}회</span>
                    </div>
                  ))
                }
              </S>
              <S>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "rgba(255,255,255,0.6)" }}>데이터 사용량</div>
                {[
                  { icon: "👤", label: "연락처", value: stats.totalContacts },
                  { icon: "💰", label: "매출", value: stats.totalLedger },
                  { icon: "📋", label: "예약", value: stats.totalReservations },
                  { icon: "✅", label: "할일", value: stats.totalTodos },
                  { icon: "📝", label: "메모", value: stats.totalNotes },
                ].map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>{d.icon} {d.label}</span>
                    <span style={{ fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </S>
            </div>
          </div>)}

          {/* ═══ Users ═══ */}
          {tab === "users" && !selectedUser && (<div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>유저 관리 ({users.length}명)</h2>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px 90px 60px", padding: "8px 14px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div>이름</div><div>사업명</div><div>PRO</div><div>마지막 접속</div><div>가입일</div><div></div>
              </div>
              {users.map((u, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px 90px 60px", padding: "10px 14px", fontSize: 12, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }} onClick={() => loadUserDetail(u)}>
                  <div style={{ fontWeight: 600 }}>{u.name || "—"}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)" }}>{u.business_name || "—"}</div>
                  <div>
                    <button onClick={(e) => { e.stopPropagation(); togglePro(u.id, u.is_pro); }}
                      style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, border: "none", cursor: "pointer", background: u.is_pro ? "rgba(48,209,88,0.15)" : "rgba(255,255,255,0.05)", color: u.is_pro ? "#30D158" : "rgba(255,255,255,0.3)" }}>
                      {u.is_pro ? "PRO ✓" : "무료"}
                    </button>
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{u.last_login_at ? timeAgo(u.last_login_at) : "—"}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{u.created_at?.split("T")[0]}</div>
                  <div style={{ fontSize: 11, color: "#A78BFA" }}>상세 →</div>
                </div>
              ))}
            </div>
          </div>)}

          {/* ═══ User Detail ═══ */}
          {tab === "users" && selectedUser && (<div>
            <button onClick={() => setSelectedUser(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 16 }}>← 유저 목록</button>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #7D2AE7, #0071E3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800 }}>{(selectedUser.name || "?")[0]}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedUser.name || "이름 없음"}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{selectedUser.business_name || "사업명 미설정"} · 가입: {selectedUser.created_at?.split("T")[0]}</div>
              </div>
              <button onClick={() => togglePro(selectedUser.id, selectedUser.is_pro)}
                style={{ marginLeft: "auto", fontSize: 12, padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: selectedUser.is_pro ? "#30D158" : "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 600 }}>
                {selectedUser.is_pro ? "PRO 해제" : "PRO 활성화"}
              </button>
            </div>
            {selectedUserData && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "연락처", value: selectedUserData.contacts },
                  { label: "매출 기록", value: selectedUserData.ledger },
                  { label: "예약", value: selectedUserData.reservations },
                  { label: "할일", value: selectedUserData.todos },
                  { label: "메모", value: selectedUserData.notes },
                ].map((d, i) => (
                  <S key={i}><div style={{ fontSize: 20, fontWeight: 700, textAlign: "center" }}>{d.value}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>{d.label}</div></S>
                ))}
              </div>
            )}
            {selectedUserData?.apiLogs?.length > 0 && (
              <S>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "rgba(255,255,255,0.6)" }}>API 사용 기록</div>
                {selectedUserData.apiLogs.map((log: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>{log.endpoint}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>{log.tokens_used} tokens · {log.created_at?.split("T")[0]}</span>
                  </div>
                ))}
              </S>
            )}
          </div>)}

          {/* ═══ Feedback ═══ */}
          {tab === "feedback" && (<div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>피드백 ({feedbacks.length}건)</h2>
            {feedbacks.length === 0 ? (
              <S style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 28, marginBottom: 8 }}>💬</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>아직 피드백이 없습니다</div></S>
            ) : feedbacks.map((fb, i) => (
              <S key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{fb.user_name || "익명"}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{fb.created_at?.split("T")[0]}</span>
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{fb.content}</div>
              </S>
            ))}
          </div>)}

          {/* ═══ Announcements ═══ */}
          {tab === "announcements" && (<div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>공지사항</h2>
            <S style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>새 공지 작성</div>
              <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="제목"
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 13, marginBottom: 8 }} />
              <textarea value={annContent} onChange={e => setAnnContent(e.target.value)} placeholder="내용" rows={3}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 13, marginBottom: 8, resize: "none" }} />
              <button onClick={addAnnouncement} disabled={!annTitle.trim() || !annContent.trim()}
                style={{ background: "#7D2AE7", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: !annTitle.trim() || !annContent.trim() ? 0.4 : 1 }}>
                공지 등록
              </button>
            </S>
            {announcements.map((ann, i) => (
              <S key={i} style={{ marginBottom: 8, opacity: ann.active ? 1 : 0.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{ann.title}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{ann.content}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>{ann.created_at?.split("T")[0]} · {ann.active ? "활성" : "비활성"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => toggleAnnouncement(ann.id, ann.active)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 10, cursor: "pointer" }}>
                      {ann.active ? "숨기기" : "표시"}
                    </button>
                    <button onClick={() => deleteAnnouncement(ann.id)} style={{ background: "rgba(255,59,48,0.15)", border: "none", color: "#FF3B30", padding: "4px 10px", borderRadius: 6, fontSize: 10, cursor: "pointer" }}>
                      삭제
                    </button>
                  </div>
                </div>
              </S>
            ))}
          </div>)}

          {/* ═══ API Monitoring ═══ */}
          {tab === "api" && (<div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>API 모니터링</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              <S><div style={{ fontSize: 24, fontWeight: 800, textAlign: "center", color: "#FF9500" }}>{apiLogs.length}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>총 호출</div></S>
              <S><div style={{ fontSize: 24, fontWeight: 800, textAlign: "center", color: "#0071E3" }}>{apiLogs.reduce((s, l) => s + (l.tokens_used || 0), 0).toLocaleString()}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>총 토큰</div></S>
              <S><div style={{ fontSize: 24, fontWeight: 800, textAlign: "center", color: "#FF3B30" }}>${apiLogs.reduce((s, l) => s + Number(l.cost || 0), 0).toFixed(4)}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>총 비용</div></S>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 120px", padding: "8px 14px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div>엔드포인트</div><div>토큰</div><div>비용</div><div>시간</div>
              </div>
              {apiLogs.slice(0, 50).map((log, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 120px", padding: "8px 14px", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ color: "#A78BFA" }}>{log.endpoint}</div>
                  <div>{log.tokens_used}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)" }}>${Number(log.cost || 0).toFixed(4)}</div>
                  <div style={{ color: "rgba(255,255,255,0.3)" }}>{log.created_at?.replace("T", " ").slice(0, 16)}</div>
                </div>
              ))}
              {apiLogs.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>API 호출 기록이 없습니다</div>}
            </div>
          </div>)}

          {/* ═══ Support Programs ═══ */}
          {tab === "programs" && (<div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>지원사업 관리 ({SUPPORT_PROGRAMS.length}개)</h2>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>수정: src/data/support-programs.ts</div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, overflow: "hidden" }}>
              {SUPPORT_PROGRAMS.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.2)", width: 24 }}>{p.id}</span>
                  <div style={{ flex: 1 }}>
                    <a href={p.url} target="_blank" rel="noopener" style={{ color: "#A78BFA", textDecoration: "none" }}>{p.name}</a>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{p.org}</div>
                  </div>
                  <span style={{ fontSize: 10, color: p.deadline === "상시" ? "rgba(255,255,255,0.3)" : "#FF9500" }}>{p.deadline}</span>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>{p.category}</span>
                </div>
              ))}
            </div>
          </div>)}

          {/* ═══ Blog ═══ */}
          {tab === "blog" && (<div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>블로그 관리 ({BLOG_POSTS.length}개)</h2>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>수정: src/app/blog/page.tsx</div>
            {BLOG_POSTS.map((post, i) => (
              <S key={i} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{post.icon}</span>
                <div style={{ flex: 1 }}>
                  <a href={`/blog/${post.slug}`} target="_blank" style={{ color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>{post.title}</a>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{post.category} · {post.date} · {post.readTime}</div>
                </div>
              </S>
            ))}
          </div>)}

          {/* ═══ Settings ═══ */}
          {tab === "settings" && (<div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>설정</h2>
            <S style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🎁 PRO 무료 기간</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>테스트 기간: 2026.04 ~ 2026.06</div>
              <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 8, background: "rgba(48,209,88,0.15)", color: "#30D158", fontWeight: 600 }}>진행 중</span>
            </S>
            <S style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🛡️ 관리자 계정</div>
              {ADMIN_EMAILS.map((e, i) => <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", padding: "2px 0" }}>• {e}</div>)}
            </S>
            <S style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>📁 데이터 파일</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 2 }}>
                {["src/data/support-programs.ts", "src/app/blog/page.tsx", "src/app/admin/page.tsx"].map(f => (
                  <div key={f}><code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>{f}</code></div>
                ))}
              </div>
            </S>
            <S>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🔗 주요 페이지</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {["/dashboard", "/blog", "/proposal", "/recruit", "/sns", "/auth", "/admin"].map(url => (
                  <a key={url} href={url} target="_blank" style={{ fontSize: 11, padding: "6px 10px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{url}</a>
                ))}
              </div>
            </S>
          </div>)}

        </main>
      </div>
    </div>
  );
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}일 전`;
  return d.split("T")[0];
}

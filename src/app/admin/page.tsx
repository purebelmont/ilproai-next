"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { SUPPORT_PROGRAMS } from "@/data/support-programs";
import { BLOG_POSTS } from "@/app/blog/page";

// Admin emails — add your email here
const ADMIN_EMAILS = ["james@contavelo.com", "admin@ilpro.ai", "purebelmont@gmail.com"];

type AdminTab = "overview" | "users" | "feedback" | "programs" | "blog" | "settings";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Auth check
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

  // Load data
  const loadData = useCallback(async () => {
    if (!user) return;

    // Users (profiles)
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(profiles || []);

    // Feedbacks
    const { data: fb } = await supabase.from("feedbacks").select("*").order("created_at", { ascending: false });
    setFeedbacks(fb || []);

    // Stats
    const { count: totalContacts } = await supabase.from("contacts").select("*", { count: "exact", head: true });
    const { count: totalLedger } = await supabase.from("ledger").select("*", { count: "exact", head: true });
    const { count: totalReservations } = await supabase.from("reservations").select("*", { count: "exact", head: true });
    const { count: totalTodos } = await supabase.from("todos").select("*", { count: "exact", head: true });
    const { count: totalNotes } = await supabase.from("notes").select("*", { count: "exact", head: true });
    const { count: totalSchedules } = await supabase.from("schedules").select("*", { count: "exact", head: true });

    setStats({
      totalUsers: (profiles || []).length,
      activeUsers: (profiles || []).filter((p: any) => p.has_sample_data || p.business_name).length,
      totalContacts: totalContacts || 0,
      totalLedger: totalLedger || 0,
      totalReservations: totalReservations || 0,
      totalTodos: totalTodos || 0,
      totalNotes: totalNotes || 0,
      totalSchedules: totalSchedules || 0,
      totalFeedbacks: (fb || []).length,
    });
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div style={{ background: "#0a0a1a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" /></div>;

  return (
    <div style={{ background: "#0a0a1a", minHeight: "100vh", color: "#fff", fontFamily: "-apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/dashboard" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none" }}>← 대시보드</a>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
          <h1 style={{ fontSize: 16, fontWeight: 700 }}>🛡️ 관리자</h1>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{user?.email}</div>
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 50px)" }}>
        {/* Sidebar */}
        <nav style={{ width: 200, padding: "16px 8px", borderRight: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          {([
            { id: "overview" as const, icon: "📊", label: "대시보드" },
            { id: "users" as const, icon: "👥", label: "유저 관리" },
            { id: "feedback" as const, icon: "💬", label: "피드백" },
            { id: "programs" as const, icon: "🔍", label: "지원사업 관리" },
            { id: "blog" as const, icon: "📝", label: "블로그 관리" },
            { id: "settings" as const, icon: "⚙️", label: "설정" },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px", border: "none", borderRadius: 8, background: tab === t.id ? "rgba(125,42,231,0.2)" : "transparent", color: tab === t.id ? "#A78BFA" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", marginBottom: 2, textAlign: "left" }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, padding: 24, overflow: "auto" }}>

          {/* ═══ Overview ═══ */}
          {tab === "overview" && stats && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>대시보드</h2>

              {/* Key metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "총 유저", value: stats.totalUsers, color: "#7D2AE7" },
                  { label: "활성 유저", value: stats.activeUsers, color: "#30D158" },
                  { label: "피드백", value: stats.totalFeedbacks, color: "#FF9500" },
                  { label: "지원사업", value: SUPPORT_PROGRAMS.length, color: "#0071E3" },
                ].map((m, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Data usage */}
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "rgba(255,255,255,0.6)" }}>데이터 사용량</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { icon: "👤", label: "연락처", value: stats.totalContacts },
                  { icon: "💰", label: "매출 기록", value: stats.totalLedger },
                  { icon: "📋", label: "예약", value: stats.totalReservations },
                  { icon: "✅", label: "할일", value: stats.totalTodos },
                  { icon: "📝", label: "메모", value: stats.totalNotes },
                  { icon: "📅", label: "일정", value: stats.totalSchedules },
                ].map((d, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{d.icon}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{d.value}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{d.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent users */}
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "rgba(255,255,255,0.6)" }}>최근 가입 유저</h3>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, overflow: "hidden" }}>
                {users.slice(0, 5).map((u, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(125,42,231,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#A78BFA" }}>{(u.name || "?")[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name || u.business_name || "이름 없음"}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{u.business_name || "사업명 미설정"}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{u.created_at?.split("T")[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Users ═══ */}
          {tab === "users" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>유저 관리 ({users.length}명)</h2>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 100px 80px", padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div>이름</div><div>사업명</div><div>샘플 데이터</div><div>가입일</div><div>상태</div>
                </div>
                {users.map((u, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 100px 80px", padding: "12px 16px", fontSize: 13, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontWeight: 600 }}>{u.name || "—"}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)" }}>{u.business_name || "—"}</div>
                    <div><span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: u.has_sample_data ? "rgba(48,209,88,0.15)" : "rgba(255,255,255,0.05)", color: u.has_sample_data ? "#30D158" : "rgba(255,255,255,0.3)" }}>{u.has_sample_data ? "사용 중" : "미사용"}</span></div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{u.created_at?.split("T")[0]}</div>
                    <div><span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(125,42,231,0.15)", color: "#A78BFA" }}>활성</span></div>
                  </div>
                ))}
                {users.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>가입한 유저가 없습니다</div>}
              </div>
            </div>
          )}

          {/* ═══ Feedback ═══ */}
          {tab === "feedback" && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>피드백 ({feedbacks.length}건)</h2>
              {feedbacks.length === 0 ? (
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 40, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>아직 피드백이 없습니다</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>유저 대시보드에 피드백 버튼이 추가되면 여기에 표시됩니다</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {feedbacks.map((fb, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{fb.user_name || "익명"}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{fb.created_at?.split("T")[0]}</div>
                      </div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{fb.content}</div>
                      {fb.category && <span style={{ display: "inline-block", marginTop: 8, fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(125,42,231,0.15)", color: "#A78BFA" }}>{fb.category}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ Support Programs ═══ */}
          {tab === "programs" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>지원사업 관리 ({SUPPORT_PROGRAMS.length}개)</h2>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>파일: src/data/support-programs.ts</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 150px 100px 80px", padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div>#</div><div>지원사업명</div><div>주관기관</div><div>마감일</div><div>카테고리</div>
                </div>
                {SUPPORT_PROGRAMS.map((p, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 150px 100px 80px", padding: "10px 16px", fontSize: 12, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ color: "rgba(255,255,255,0.2)" }}>{p.id}</div>
                    <div>
                      <a href={p.url} target="_blank" rel="noopener" style={{ color: "#A78BFA", textDecoration: "none", fontWeight: 500 }}>{p.name}</a>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{p.org}</div>
                    <div style={{ color: p.deadline === "상시" ? "rgba(255,255,255,0.3)" : "#FF9500", fontSize: 11 }}>{p.deadline}</div>
                    <div><span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>{p.category}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Blog ═══ */}
          {tab === "blog" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>블로그 관리 ({BLOG_POSTS.length}개)</h2>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>파일: src/app/blog/page.tsx</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {BLOG_POSTS.map((post, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 16px" }}>
                    <span style={{ fontSize: 20 }}>{post.icon}</span>
                    <div style={{ flex: 1 }}>
                      <a href={`/blog/${post.slug}`} target="_blank" style={{ color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>{post.title}</a>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{post.category} · {post.date} · {post.readTime}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {post.tags?.slice(0, 3).map(tag => (
                        <span key={tag} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Settings ═══ */}
          {tab === "settings" && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>설정</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* PRO free period */}
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🎁 PRO 무료 기간</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>현재 모든 유저에게 PRO 기능이 무료로 제공됩니다 (테스트 기간)</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 8, background: "rgba(48,209,88,0.15)", color: "#30D158", fontWeight: 600 }}>테스트 기간 진행 중</span>
                    <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>2026.04 ~ 2026.06</span>
                  </div>
                </div>

                {/* Admin accounts */}
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🛡️ 관리자 계정</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>관리자 이메일 목록 (코드에서 수정: src/app/admin/page.tsx)</div>
                  {ADMIN_EMAILS.map((email, i) => (
                    <div key={i} style={{ fontSize: 13, padding: "6px 0", color: "rgba(255,255,255,0.6)" }}>• {email}</div>
                  ))}
                </div>

                {/* Data files */}
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>📁 데이터 파일 위치</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 2 }}>
                    <div>지원사업 목록: <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>src/data/support-programs.ts</code></div>
                    <div>블로그 포스트: <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>src/app/blog/page.tsx</code></div>
                    <div>관리자 설정: <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>src/app/admin/page.tsx</code></div>
                  </div>
                </div>

                {/* Links */}
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🔗 주요 페이지</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "대시보드", url: "/dashboard" },
                      { label: "블로그", url: "/blog" },
                      { label: "제안서", url: "/proposal" },
                      { label: "모집 공고", url: "/recruit" },
                      { label: "SNS", url: "/sns" },
                      { label: "인증", url: "/auth" },
                    ].map((l, i) => (
                      <a key={i} href={l.url} target="_blank" style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", textDecoration: "none", display: "flex", justifyContent: "space-between" }}>
                        <span>{l.label}</span><span style={{ color: "rgba(255,255,255,0.2)" }}>{l.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

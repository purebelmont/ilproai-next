"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HomePanel from "@/components/HomePanel";
import FilesPanel from "@/components/FilesPanel";
import QuotesPanel from "@/components/QuotesPanel";
import PayrollPanel from "@/components/PayrollPanel";
import ReportPanel from "@/components/ReportPanel";
import WebsiteBuilderPanel from "@/components/WebsiteBuilderPanel";
import AIRecommendPanel from "@/components/AIRecommendPanel";

type Tab = "home" | "contacts" | "calendar" | "notes" | "todos" | "files" | "ledger" | "reservations" | "quotes" | "payroll" | "report" | "website" | "automation" | "ai";

/* ─── Vercel-style grouped sidebar navigation ─── */
type NavItem = { id: Tab; icon: string; label: string; badge?: string; href?: string };
type NavSection = { label?: string; pro?: boolean; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { id: "home", icon: "🏠", label: "홈" },
      { id: "calendar", icon: "📅", label: "일정" },
      { id: "reservations", icon: "📋", label: "예약" },
      { id: "contacts", icon: "👤", label: "연락처" },
    ],
  },
  {
    label: "매출 관리",
    items: [
      { id: "ledger", icon: "💰", label: "매출장부" },
      { id: "quotes", icon: "💼", label: "견적" },
      { id: "payroll", icon: "👥", label: "급여" },
      { id: "report", icon: "📊", label: "리포트" },
    ],
  },
  {
    label: "도구",
    items: [
      { id: "notes", icon: "📝", label: "메모" },
      { id: "todos", icon: "✅", label: "할일" },
      { id: "files", icon: "📎", label: "문서함" },
    ],
  },
  {
    label: "PRO",
    pro: true,
    items: [
      { id: "website", icon: "🌐", label: "홈페이지" },
      { id: "automation", icon: "📸", label: "SNS 콘텐츠", badge: "NEW", href: "/sns" },
    ],
  },
];


// Mobile bottom bar — 4 key tabs + menu
const MOBILE_TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "home", icon: "🏠", label: "홈" },
  { id: "calendar", icon: "📅", label: "일정" },
  { id: "ledger", icon: "💰", label: "매출" },
  { id: "report", icon: "📊", label: "리포트" },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarSub, setSidebarSub] = useState<string | null>(null);
  const router = useRouter();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStyle, setModalStyle] = useState<"fullscreen" | "bottom" | "side" | "inline">("fullscreen");
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  // Dark mode
  useEffect(() => {
    const saved = localStorage.getItem("ilpro_dark");
    if (saved === "true") { setDark(true); document.documentElement.classList.add("dark"); }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("ilpro_dark", String(next));
    document.documentElement.classList.toggle("dark", next);
  };

  const checkSampleFn = async (uid: string) => {
    const { data } = await supabase.from("profiles").select("has_sample_data").eq("id", uid).single();
    setHasSample(data?.has_sample_data || false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/auth"); return; }
      setUser(data.user);
      // Get or create profile
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      if (p) {
        setProfile(p);
      } else {
        // Auto-create profile
        const name = data.user.user_metadata?.name || data.user.email?.split("@")[0] || "";
        await supabase.from("profiles").insert({ id: data.user.id, name });
        const { data: p2 } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
        setProfile(p2);
      }
      checkSampleFn(data.user.id);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const openModal = useCallback((title: string, content: React.ReactNode, style: "fullscreen" | "bottom" | "side" | "inline" = "fullscreen") => {
    setModalTitle(title);
    setModalContent(content);
    setModalStyle(style);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalContent(null);
  }, []);

  const [hasSample, setHasSample] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);

  const generateSample = useCallback(async () => {
    if (!user) return;
    setSampleLoading(true);
    const uid = user.id;
    const today = new Date().toISOString().split("T")[0];
    const d = (n: number) => { const dt = new Date(); dt.setDate(dt.getDate() + n); return dt.toISOString().split("T")[0]; };

    // Contacts
    const contacts = [
      { user_id: uid, name: "김민수", company: "(주)한국제조", position: "과장", phone: "010-1234-5678", group_name: "거래처", notes: "주력 거래처", favorite: true },
      { user_id: uid, name: "박진수", company: "울산정밀(주)", position: "대리", phone: "010-9876-5432", group_name: "거래처", favorite: true },
      { user_id: uid, name: "최영호", company: "(주)부산스틸", position: "부장", phone: "010-5555-1234", group_name: "거래처", favorite: false },
      { user_id: uid, name: "김철수", company: "", position: "", phone: "010-1111-0001", group_name: "단골", notes: "매주 목요일 갈비탕", favorite: true },
      { user_id: uid, name: "박서연", company: "신선식자재", position: "영업", phone: "010-2222-0001", group_name: "거래처", notes: "채소 매주 월요일", favorite: true },
      { user_id: uid, name: "문상훈", company: "", position: "주방장", phone: "010-3333-0001", group_name: "직원", favorite: false },
      { user_id: uid, name: "나은비", company: "", position: "서빙", phone: "010-3333-0002", group_name: "직원", favorite: false },
      { user_id: uid, name: "김세무", company: "세무법인", position: "세무사", phone: "010-4444-0001", group_name: "파트너", favorite: true },
    ];
    await supabase.from("contacts").insert(contacts);

    // Schedules
    const schedules = [
      { user_id: uid, title: "한국제조 미팅", start_date: today, start_time: "14:00", description: "견적서 협의", color: "#0071E3" },
      { user_id: uid, title: "단체 예약 6명", start_date: today, start_time: "18:00", description: "2층 단체석", color: "#FF6B35" },
      { user_id: uid, title: "식자재 발주", start_date: d(1), start_time: "10:00", description: "신선식자재", color: "#FF3B30" },
      { user_id: uid, title: "알바 면접", start_date: d(1), start_time: "15:00", description: "서빙 2명", color: "#5856D6" },
      { user_id: uid, title: "세무사 미팅", start_date: d(3), start_time: "14:00", description: "부가세 신고", color: "#30D158" },
      { user_id: uid, title: "메뉴 촬영", start_date: d(5), start_time: "11:00", description: "신메뉴 3종", color: "#FF2D55" },
    ];
    await supabase.from("schedules").insert(schedules);

    // Notes
    const notes = [
      { user_id: uid, title: "이번주 식자재", content: "당근 10kg, 양파 15kg, 대파 5단, 마늘 3kg, 소고기 20kg", color: "#FFB74D", pinned: true },
      { user_id: uid, title: "신메뉴 아이디어", content: "1. 매운 갈비찜 2. 된장 파스타 3. 수제 만두", color: "#66BB6A", pinned: false },
      { user_id: uid, title: "직원 미팅 메모", content: "서빙 속도 개선, 주말 인원 추가, 유니폼 교체", color: "#EF5350", pinned: false },
      { user_id: uid, title: "거래처 단가", content: "한국축산 48,000원, 울산축산 52,000원, 부산스틸 45,000원", color: "#42A5F5", pinned: false },
    ];
    await supabase.from("notes").insert(notes);

    // Todos
    const todos = [
      { user_id: uid, title: "한국제조 견적서 발송", completed: false, priority: 1 },
      { user_id: uid, title: "네이버 리뷰 답글 3건", completed: false, priority: 1 },
      { user_id: uid, title: "식자재 발주서 작성", completed: false, priority: 0 },
      { user_id: uid, title: "알바 면접 준비", completed: false, priority: 0 },
      { user_id: uid, title: "메뉴판 사진 촬영", completed: false, priority: 0 },
      { user_id: uid, title: "3월 급여 이체", completed: true, priority: 0 },
      { user_id: uid, title: "3월 매출 정리", completed: true, priority: 0 },
    ];
    await supabase.from("todos").insert(todos);

    // Ledger
    const ledger = [
      { user_id: uid, entry_date: today, entry_type: "income", description: "점심 영업", amount: 1250000, payment_method: "카드" },
      { user_id: uid, entry_date: today, entry_type: "income", description: "저녁 영업", amount: 1850000, payment_method: "카드+현금" },
      { user_id: uid, entry_date: today, entry_type: "expense", description: "식자재 납품", amount: 320000, payment_method: "계좌이체" },
      { user_id: uid, entry_date: d(-1), entry_type: "income", description: "점심+저녁", amount: 2630000, payment_method: "카드" },
      { user_id: uid, entry_date: d(-1), entry_type: "expense", description: "한우 납품", amount: 580000, payment_method: "계좌이체" },
      { user_id: uid, entry_date: d(-2), entry_type: "income", description: "점심+저녁", amount: 2300000, payment_method: "카드+현금" },
      { user_id: uid, entry_date: d(-2), entry_type: "expense", description: "음료+주류", amount: 450000, payment_method: "카드" },
      { user_id: uid, entry_date: d(-3), entry_type: "income", description: "점심+저녁", amount: 1900000, payment_method: "카드" },
      { user_id: uid, entry_date: d(-3), entry_type: "expense", description: "임대료", amount: 2500000, payment_method: "계좌이체" },
    ];
    await supabase.from("ledger").insert(ledger);

    // Reservations
    const reservations = [
      { user_id: uid, customer_name: "김철수", customer_phone: "010-1234-5678", party_size: 4, reservation_date: today, reservation_time: "12:00", service: "갈비탕", status: "confirmed", notes: "단골", source: "direct", reminder_sent: false },
      { user_id: uid, customer_name: "이미영", customer_phone: "010-9876-5432", party_size: 2, reservation_date: today, reservation_time: "12:30", service: "점심특선", status: "confirmed", notes: "", source: "direct", reminder_sent: false },
      { user_id: uid, customer_name: "박지현", customer_phone: "010-5555-1234", party_size: 6, reservation_date: today, reservation_time: "18:00", service: "회식", status: "confirmed", notes: "2층 단체석", source: "direct", reminder_sent: false },
      { user_id: uid, customer_name: "정동현", customer_phone: "010-4444-8888", party_size: 8, reservation_date: d(1), reservation_time: "12:00", service: "회사점심", status: "confirmed", notes: "주차3대", source: "direct", reminder_sent: false },
    ];
    await supabase.from("reservations").insert(reservations);

    // Employees
    const employees = [
      { user_id: uid, name: "문상훈", position: "주방장", emp_type: "fulltime", base_salary: 2800000, hourly_rate: 0, phone: "010-3333-0001", active: true },
      { user_id: uid, name: "서민지", position: "홀매니저", emp_type: "fulltime", base_salary: 2400000, hourly_rate: 0, phone: "010-3333-0002", active: true },
      { user_id: uid, name: "장현우", position: "주방보조", emp_type: "parttime", base_salary: 0, hourly_rate: 10400, phone: "010-3333-0003", active: true },
      { user_id: uid, name: "나은비", position: "서빙", emp_type: "parttime", base_salary: 0, hourly_rate: 10400, phone: "010-3333-0004", active: true },
    ];
    await supabase.from("employees").insert(employees);

    await supabase.from("profiles").update({ has_sample_data: true }).eq("id", uid);
    setHasSample(true);
    setSampleLoading(false);
    window.location.reload();
  }, [user]);

  const clearSample = useCallback(async () => {
    if (!user || !confirm("샘플 데이터를 모두 삭제하시겠습니까?\n연락처, 일정, 메모, 할일, 매출, 예약, 직원이 전부 삭제됩니다.")) return;
    setSampleLoading(true);
    const uid = user.id;
    await supabase.from("contacts").delete().eq("user_id", uid);
    await supabase.from("schedules").delete().eq("user_id", uid);
    await supabase.from("notes").delete().eq("user_id", uid);
    await supabase.from("todos").delete().eq("user_id", uid);
    await supabase.from("ledger").delete().eq("user_id", uid);
    await supabase.from("reservations").delete().eq("user_id", uid);
    // Delete payroll first (FK), then employees
    const { data: empIds } = await supabase.from("employees").select("id").eq("user_id", uid);
    if (empIds) { for (const e of empIds) { await supabase.from("payroll").delete().eq("employee_id", e.id); } }
    await supabase.from("employees").delete().eq("user_id", uid);
    // Delete quote_items first (FK), then quotes
    const { data: qIds } = await supabase.from("quotes").select("id").eq("user_id", uid);
    if (qIds) { for (const q of qIds) { await supabase.from("quote_items").delete().eq("quote_id", q.id); } }
    await supabase.from("quotes").delete().eq("user_id", uid);

    await supabase.from("profiles").update({ has_sample_data: false }).eq("id", uid);
    setHasSample(false);
    setSampleLoading(false);
    window.location.reload();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" /></div>;
  if (!user) return null;

  const bizName = profile?.business_name || profile?.name || user.email?.split("@")[0] || "일프로AI";
  const today = new Date();
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 (${dayNames[today.getDay()]})`;

  return (
    <div className="min-h-screen flex">
      {/* ═══ SIDEBAR — Vercel-style grouped nav (220px) ═══ */}
      <div className="hidden md:flex flex-col w-[220px] fixed top-0 left-0 bottom-0 z-40"
        style={{ background: "#0D0D12", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Logo + settings */}
        <div className="flex items-center justify-between px-4 py-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)" }}>일</div>
            <div className="text-[13px] font-semibold text-white truncate">{bizName}</div>
          </div>
        </div>

        {/* AI Button */}
        <div className="px-3 pb-3 shrink-0">
          <button onClick={() => setTab("ai")}
            className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-bold text-white active:scale-[0.97] transition-all"
            style={{
              background: tab === "ai" ? "linear-gradient(135deg, #7D2AE7, #0071E3)" : "rgba(125,42,231,0.2)",
              boxShadow: tab === "ai" ? "0 4px 12px rgba(125,42,231,0.4)" : "none",
              color: tab === "ai" ? "white" : "#A78BFA",
            }}>
            <span className="text-[16px]">✨</span>
            AI 추천
          </button>
        </div>

        {/* Scrollable nav sections */}
        <div className="flex-1 overflow-y-auto px-2" style={{ scrollbarWidth: "none" }}>
          {sidebarSub === "automation" ? (
            <div>
              <button onClick={() => setSidebarSub(null)}
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] font-semibold text-white mb-1 rounded-lg hover:bg-white/5 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                자동화
              </button>
              <button onClick={() => setTab("automation")}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] transition-colors"
                style={{ background: tab === "automation" ? "rgba(125,42,231,0.15)" : "transparent", color: tab === "automation" ? "#A78BFA" : "#8E8EA0" }}>
                <span className="text-[15px]">📋</span>
                <span>전체 보기</span>
              </button>
              {AUTOMATION_SUB.map((item) => (
                item.id === "sns" ? (
                  <Link key={item.id} href="/sns"
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] transition-colors"
                    style={{ color: "#8E8EA0", textDecoration: "none" }}>
                    <span className="text-[15px]">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-[#7D2AE7] text-white">{item.badge}</span>}
                  </Link>
                ) : (
                  <button key={item.id}
                    onClick={() => setTab("automation")}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] transition-colors hover:bg-white/5"
                    style={{ color: "#8E8EA0" }}>
                    <span className="text-[15px]">{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-[#7D2AE7] text-white">{item.badge}</span>}
                  </button>
                )
              ))}
            </div>
          ) : (
            NAV_SECTIONS.map((section, si) => (
              <div key={si}>
                {si > 0 && <div className="h-px my-2 mx-2" style={{ background: "rgba(255,255,255,0.06)" }} />}
                {section.label && (
                  <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#6B6B80" }}>{section.label}</span>
                    {section.pro && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)", color: "white" }}>PRO</span>}
                  </div>
                )}
                {section.items.map((item) => {
                  const isAutomation = item.id === "automation";
                  const isActive = tab === item.id;
                  return (
                    <button key={item.id + item.label}
                      onClick={() => {
                        if (isAutomation) { setSidebarSub("automation"); setTab("automation"); }
                        else { setTab(item.id); }
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] transition-colors active:scale-[0.98]"
                      style={{
                        background: isActive ? "rgba(125,42,231,0.15)" : "transparent",
                        color: isActive ? "#A78BFA" : "#8E8EA0",
                      }}>
                      <span className="text-[15px]">{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-[#7D2AE7] text-white">{item.badge}</span>}
                      {isAutomation && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M9 18l6-6-6-6"/></svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Bottom actions */}
        <div className="px-2 py-3 shrink-0 space-y-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex gap-1">
            <button onClick={toggleDark}
              className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-[12px] transition-colors hover:bg-white/5"
              style={{ color: "#8E8EA0" }}>
              <span className="text-[14px]">{dark ? "☀️" : "🌙"}</span>
              <span>{dark ? "라이트" : "다크"}</span>
            </button>
            {hasSample ? (
              <button onClick={clearSample} disabled={sampleLoading}
                className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-[12px] transition-colors hover:bg-white/5"
                style={{ color: "#8E8EA0" }}>
                <span className="text-[14px]">{sampleLoading ? "⏳" : "📦"}</span>
                <span>샘플</span>
              </button>
            ) : (
              <button onClick={generateSample} disabled={sampleLoading}
                className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-[12px] transition-colors hover:bg-white/5"
                style={{ color: "#A78BFA" }}>
                <span className="text-[14px]">{sampleLoading ? "⏳" : "📦"}</span>
                <span>샘플</span>
              </button>
            )}
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/auth"); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[12px] transition-colors hover:bg-white/5"
            style={{ color: "#8E8EA0" }}>
            <span className="text-[14px]">🚪</span>
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* ═══ MOBILE — bottom tab bar + hamburger menu ═══ */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${tab === "website" ? "hidden" : ""}`}
        style={{ background: "#0D0D12", paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
        <div className="flex h-[var(--tab-h)]">
          {MOBILE_TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setMobileMenuOpen(false); }}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] transition-colors duration-200"
              style={{ color: tab === t.id ? "#A78BFA" : "#5A5A6E" }}>
              <span className="text-[20px] leading-none">{t.icon}</span>
              <span className="text-[9px] font-medium">{t.label}</span>
            </button>
          ))}
          {/* Hamburger menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px]"
            style={{ color: mobileMenuOpen ? "#A78BFA" : "#5A5A6E" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></> : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>}
            </svg>
            <span className="text-[9px] font-medium">{mobileMenuOpen ? "닫기" : "메뉴"}</span>
          </button>
        </div>
      </div>

      {/* ═══ MOBILE — Full-screen menu drawer ═══ */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 animate-[fadeIn_0.2s_ease]" style={{ background: "#0D0D12" }}>
          <div className="flex flex-col h-full overflow-y-auto pb-[calc(var(--tab-h)+env(safe-area-inset-bottom,0))]" style={{ scrollbarWidth: "none" }}>
            {/* Mobile menu header */}
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-extrabold text-white"
                style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)" }}>일</div>
              <div>
                <div className="text-[14px] font-bold text-white">{bizName}</div>
                <div className="text-[11px] text-[#6B6B80]">{dateLabel}</div>
              </div>
            </div>

            {/* AI Button (mobile) */}
            <div className="px-4 mb-2">
              <button onClick={() => { setTab("ai"); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 py-3 px-4 rounded-xl text-[14px] font-bold text-white active:scale-[0.97] transition-all"
                style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)" }}>
                <span className="text-[18px]">✨</span>
                AI 추천
              </button>
            </div>

            {/* Menu sections */}
            <div className="px-3 flex-1">
              {NAV_SECTIONS.map((section, si) => (
                <div key={si}>
                  {si > 0 && <div className="h-px my-2 mx-2" style={{ background: "rgba(255,255,255,0.06)" }} />}
                  {section.label && (
                    <div className="flex items-center gap-2 px-3 pt-3 pb-1">
                      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#6B6B80" }}>{section.label}</span>
                      {section.pro && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)", color: "white" }}>PRO</span>}
                    </div>
                  )}
                  {section.items.map((item) => (
                    <button key={item.id + item.label}
                      onClick={() => { setTab(item.id); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-[14px] transition-colors active:scale-[0.98]"
                      style={{
                        background: tab === item.id ? "rgba(125,42,231,0.15)" : "transparent",
                        color: tab === item.id ? "#A78BFA" : "#C0C0CC",
                      }}>
                      <span className="text-[18px]">{item.icon}</span>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {item.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-[#7D2AE7] text-white">{item.badge}</span>}
                    </button>
                  ))}
                </div>
              ))}

              {/* SNS link in mobile menu */}
              <div className="h-px my-2 mx-2" style={{ background: "rgba(255,255,255,0.06)" }} />
              <Link href="/sns" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-[14px] transition-colors active:scale-[0.98]"
                style={{ color: "#C0C0CC", textDecoration: "none" }}>
                <span className="text-[18px]">📸</span>
                <span className="flex-1 text-left font-medium">SNS 콘텐츠</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-[#7D2AE7] text-white">NEW</span>
              </Link>
            </div>

            {/* Mobile menu bottom actions */}
            <div className="px-3 py-4 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex gap-2">
                <button onClick={() => { toggleDark(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl text-[13px] font-medium"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#C0C0CC" }}>
                  <span>{dark ? "☀️" : "🌙"}</span>
                  <span>{dark ? "라이트 모드" : "다크 모드"}</span>
                </button>
                {hasSample ? (
                  <button onClick={() => { clearSample(); setMobileMenuOpen(false); }} disabled={sampleLoading}
                    className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl text-[13px] font-medium"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#C0C0CC" }}>
                    <span>{sampleLoading ? "⏳" : "📦"}</span>
                    <span>샘플 삭제</span>
                  </button>
                ) : (
                  <button onClick={() => { generateSample(); setMobileMenuOpen(false); }} disabled={sampleLoading}
                    className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl text-[13px] font-medium"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#A78BFA" }}>
                    <span>{sampleLoading ? "⏳" : "📦"}</span>
                    <span>샘플 추가</span>
                  </button>
                )}
              </div>
              <button onClick={async () => { await supabase.auth.signOut(); router.push("/auth"); }}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-[13px] font-medium"
                style={{ background: "rgba(255,255,255,0.05)", color: "#8E8EA0" }}>
                <span>🚪</span>
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 md:ml-[220px] min-h-screen" style={{ background: "var(--bg)" }}>
        {/* Mobile header */}
        <div className={`md:hidden sticky top-0 z-30 backdrop-blur-xl px-5 py-3 flex items-center justify-between ${tab === "website" ? "hidden" : ""}`}
          style={{ background: dark ? "rgba(28,28,30,0.9)" : "rgba(255,255,255,0.9)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white"
              style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)" }}>일</div>
            <div>
              <div className="text-sm font-bold">{bizName}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{dateLabel}</div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={toggleDark} className="text-sm">{dark ? "☀️" : "🌙"}</button>
            {hasSample ? (
              <button onClick={clearSample} disabled={sampleLoading} className="text-xs text-[var(--text-muted)]">{sampleLoading ? "..." : "📦"}</button>
            ) : (
              <button onClick={generateSample} disabled={sampleLoading} className="text-xs" style={{ color: "#7D2AE7" }}>{sampleLoading ? "..." : "📦"}</button>
            )}
            <button onClick={async () => { await supabase.auth.signOut(); router.push("/auth"); }} className="text-xs text-[var(--text-muted)]">나가기</button>
          </div>
        </div>

        {/* Website builder — full-bleed */}
        {tab === "website" && (
          <div className="fixed inset-0 md:left-[220px] z-20" style={{ background: "#0A1628" }}>
            <WebsiteBuilderPanel userId={user.id} plan={profile?.plan || "free"} />
          </div>
        )}

        <div className={`pb-[var(--tab-h)] md:pb-0 ${tab === "website" ? "hidden" : ""}`}>
          {tab === "home" && <HomePanel userId={user.id} profile={profile} setTab={setTab} />}
          {tab === "contacts" && <ContactsPanel userId={user.id} openModal={openModal} closeModal={closeModal} />}
          {tab === "calendar" && <CalendarPanel userId={user.id} openModal={openModal} closeModal={closeModal} />}
          {tab === "notes" && <NotesPanel userId={user.id} openModal={openModal} closeModal={closeModal} />}
          {tab === "todos" && <TodosPanel userId={user.id} />}
          {tab === "files" && <FilesPanel userId={user.id} />}
          {tab === "ledger" && <LedgerPanel userId={user.id} openModal={openModal} closeModal={closeModal} />}
          {tab === "reservations" && <ReservationsPanel userId={user.id} openModal={openModal} closeModal={closeModal} />}
          {tab === "quotes" && <QuotesPanel userId={user.id} openModal={openModal} closeModal={closeModal} />}
          {tab === "payroll" && <PayrollPanel userId={user.id} openModal={openModal} closeModal={closeModal} />}
          {tab === "report" && <ReportPanel userId={user.id} />}
          {tab === "ai" && <AIRecommendPanel userId={user.id} setTab={setTab} />}
        </div>
      </div>

      {/* Style 1: Fullscreen */}
      {modalOpen && modalStyle === "fullscreen" && (
        <div className="fixed inset-0 z-[200] overflow-y-auto animate-[slideUp_0.3s_ease]" style={{ background: "var(--bg)" }}>
          <div className="sticky top-0 z-10 backdrop-blur-xl px-5 py-3 flex items-center justify-between" style={{ background: dark ? "rgba(28,28,30,0.9)" : "rgba(255,255,255,0.9)", borderBottom: "1px solid var(--border)" }}>
            <button onClick={closeModal} className="text-[var(--primary)] text-sm font-medium">취소</button>
            <div className="text-base font-bold">{modalTitle}</div>
            <div className="w-10" />
          </div>
          <div className="p-5 max-w-lg mx-auto">{modalContent}</div>
        </div>
      )}

      {/* Style 2: Bottom Sheet */}
      {modalOpen && modalStyle === "bottom" && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[199] animate-[fadeIn_0.2s_ease]" onClick={closeModal} />
          <div className="fixed bottom-0 left-0 right-0 z-[200] rounded-t-2xl max-h-[85vh] overflow-y-auto animate-[slideUp_0.3s_ease] md:max-w-lg md:mx-auto" style={{ background: "var(--bg-card)" }}>
            <div className="w-9 h-1 rounded-full mx-auto mt-2 mb-1" style={{ background: "var(--text-ghost)" }} />
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <button onClick={closeModal} className="text-[var(--primary)] text-sm">취소</button>
              <div className="text-sm font-bold">{modalTitle}</div>
              <div className="w-10" />
            </div>
            <div className="p-5">{modalContent}</div>
          </div>
        </>
      )}

      {/* Style 3: Side Panel */}
      {modalOpen && modalStyle === "side" && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[199] animate-[fadeIn_0.2s_ease]" onClick={closeModal} />
          <div className="fixed top-0 right-0 bottom-0 z-[200] w-full max-w-md overflow-y-auto animate-[slideRight_0.3s_ease] shadow-2xl" style={{ background: "var(--bg)" }}>
            <div className="sticky top-0 z-10 backdrop-blur-xl px-5 py-3 flex items-center justify-between" style={{ background: dark ? "rgba(28,28,30,0.9)" : "rgba(255,255,255,0.9)", borderBottom: "1px solid var(--border)" }}>
              <button onClick={closeModal} className="text-[var(--primary)] text-sm font-medium">← 닫기</button>
              <div className="text-sm font-bold">{modalTitle}</div>
              <div className="w-10" />
            </div>
            <div className="p-5">{modalContent}</div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

// ══════════════════════════════
// CONTACTS
// ══════════════════════════════
function ContactsPanel({ userId, openModal, closeModal }: { userId: string; openModal: any; closeModal: any }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const colors = ["#0071E3", "#FF6B35", "#30D158", "#5856D6", "#FF2D55", "#FF9500"];

  const load = useCallback(async () => {
    let q = supabase.from("contacts").select("*").eq("user_id", userId).order("favorite", { ascending: false }).order("name");
    if (search) q = q.or(`name.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%`);
    const { data } = await q;
    setContacts(data || []);
  }, [userId, search]);

  useEffect(() => { load(); }, [load]);

  async function save(formData: any) {
    if (formData.id) {
      await supabase.from("contacts").update(formData).eq("id", formData.id);
    } else {
      await supabase.from("contacts").insert({ ...formData, user_id: userId });
    }
    closeModal();
    load();
  }

  async function del(id: number) {
    if (!confirm("삭제?")) return;
    await supabase.from("contacts").delete().eq("id", id);
    closeModal();
    load();
  }

  const [inlineOpen, setInlineOpen] = useState(false);
  const [inlineData, setInlineData] = useState({ name: "", phone: "", company: "" });
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  function openForm(c?: any, style: "fullscreen"|"bottom"|"side"|"inline" = "fullscreen") {
    if (style === "inline") { setInlineOpen(true); setInlineData({ name: "", phone: "", company: "" }); return; }
    openModal(c ? "연락처 수정" : "새 연락처", <ContactForm contact={c} onSave={save} onDelete={c ? () => del(c.id) : undefined} />, style);
  }

  async function handleImport(file: File) {
    setImporting(true);
    const text = await file.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) { alert("데이터가 없습니다."); setImporting(false); return; }

    // Parse header
    const sep = lines[0].includes("\t") ? "\t" : ",";
    const headers = lines[0].split(sep).map(h => h.trim().replace(/"/g, "").toLowerCase());

    // Map columns
    const nameIdx = headers.findIndex(h => /이름|name|성명/.test(h));
    const companyIdx = headers.findIndex(h => /회사|company|상호|업체/.test(h));
    const positionIdx = headers.findIndex(h => /직위|position|직급|직책/.test(h));
    const phoneIdx = headers.findIndex(h => /전화|phone|연락처|핸드폰|휴대폰/.test(h));
    const emailIdx = headers.findIndex(h => /이메일|email|메일/.test(h));
    const groupIdx = headers.findIndex(h => /그룹|group|분류|구분/.test(h));

    if (nameIdx === -1 && companyIdx === -1) {
      alert("이름 또는 회사 컬럼을 찾을 수 없습니다.\n첫 행에 '이름', '회사', '전화', '이메일' 등의 헤더가 필요합니다.");
      setImporting(false);
      return;
    }

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(sep).map(c => c.trim().replace(/"/g, ""));
      const name = nameIdx >= 0 ? cols[nameIdx] : "";
      const company = companyIdx >= 0 ? cols[companyIdx] : "";
      if (!name && !company) continue;

      rows.push({
        user_id: userId,
        name: name || company,
        company: nameIdx >= 0 ? (company || "") : "",
        position: positionIdx >= 0 ? (cols[positionIdx] || "") : "",
        phone: phoneIdx >= 0 ? (cols[phoneIdx] || "") : "",
        email: emailIdx >= 0 ? (cols[emailIdx] || "") : "",
        group_name: groupIdx >= 0 ? (cols[groupIdx] || "") : "",
        favorite: false,
      });
    }

    if (rows.length === 0) { alert("가져올 연락처가 없습니다."); setImporting(false); return; }

    // Batch insert
    const { error } = await supabase.from("contacts").insert(rows);
    if (error) { alert("오류: " + error.message); }
    else { alert(`${rows.length}명의 연락처를 가져왔습니다.`); }

    setImporting(false);
    if (importRef.current) importRef.current.value = "";
    load();
  }

  return (
    <div className="p-5">
      <input ref={importRef} type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleImport(e.target.files[0]); }} />
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold">연락처</h4>
        <div className="flex gap-1.5">
          <button onClick={() => importRef.current?.click()} disabled={importing}
            className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--gray-100)] dark:bg-gray-700 text-[var(--gray-700)]">
            {importing ? "..." : "📥 Import"}
          </button>
          <button onClick={() => openForm(undefined, "fullscreen")} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--gray-100)] text-[var(--gray-700)]">A</button>
          <button onClick={() => openForm(undefined, "bottom")} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--gray-100)] text-[var(--gray-700)]">B</button>
          <button onClick={() => openForm(undefined, "side")} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--gray-100)] text-[var(--gray-700)]">C</button>
          <button onClick={() => openForm(undefined, "inline")} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--primary)] text-white">D</button>
        </div>
      </div>
      {/* Inline form */}
      {inlineOpen && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--primary)] p-4 mb-4 animate-[fadeIn_0.2s_ease]">
          <input value={inlineData.name} onChange={(e) => setInlineData({...inlineData, name: e.target.value})} placeholder="이름" autoFocus className="w-full text-sm font-medium outline-none mb-2 pb-2 border-b border-[var(--gray-100)]" />
          <input value={inlineData.phone} onChange={(e) => setInlineData({...inlineData, phone: e.target.value})} placeholder="전화번호" className="w-full text-sm outline-none mb-2 pb-2 border-b border-[var(--gray-100)]" />
          <input value={inlineData.company} onChange={(e) => setInlineData({...inlineData, company: e.target.value})} placeholder="회사 (선택)" className="w-full text-xs text-[var(--gray-500)] outline-none mb-3" />
          <div className="flex gap-2">
            <button onClick={async () => { if (!inlineData.name) return; await save(inlineData); setInlineOpen(false); }} className="px-4 py-1.5 bg-[var(--primary)] text-white text-xs rounded-lg font-medium">저장</button>
            <button onClick={() => setInlineOpen(false)} className="px-4 py-1.5 text-xs text-[var(--gray-500)]">취소</button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 bg-[var(--gray-100)] rounded-xl px-4 py-2.5 mb-4">
        <span className="text-[var(--gray-400)]">🔍</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름, 회사, 전화번호 검색"
          className="flex-1 bg-transparent text-sm outline-none" />
      </div>
      {contacts.length === 0 ? (
        <div className="text-center py-16 text-[var(--gray-400)]">
          <div className="text-4xl mb-3">👤</div>연락처를 추가해보세요
        </div>
      ) : (
        contacts.map((c) => (
          <div key={c.id} onClick={() => openForm(c)}
            className="flex items-center gap-3 p-3 rounded-xl border mb-2 cursor-pointer active:bg-[var(--gray-50)]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: colors[c.name.charCodeAt(0) % colors.length] }}>{c.name[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{c.name}</div>
              <div className="text-xs text-[var(--gray-500)] truncate">{[c.company, c.position, c.phone].filter(Boolean).join(" · ")}</div>
            </div>
            {c.favorite && <span>⭐</span>}
            {c.phone && <a href={`tel:${c.phone}`} onClick={(e) => e.stopPropagation()} className="text-base">📞</a>}
          </div>
        ))
      )}
    </div>
  );
}

function ContactForm({ contact, onSave, onDelete }: { contact?: any; onSave: (d: any) => void; onDelete?: () => void }) {
  const [f, setF] = useState(contact || { name: "", company: "", position: "", phone: "", email: "", group_name: "", notes: "" });
  const set = (k: string, v: string) => setF((p: any) => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="ios-fields">
        <div className="ios-field"><label>이름</label><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="홍길동" /></div>
        <div className="ios-field"><label>회사</label><input value={f.company} onChange={(e) => set("company", e.target.value)} placeholder="(주)한국제조" /></div>
        <div className="ios-field"><label>직위</label><input value={f.position} onChange={(e) => set("position", e.target.value)} placeholder="과장" /></div>
        <div className="ios-field"><label>그룹</label><input value={f.group_name} onChange={(e) => set("group_name", e.target.value)} placeholder="거래처, 단골" /></div>
      </div>
      <div className="ios-fields">
        <div className="ios-field"><label>전화</label><input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="010-1234-5678" /></div>
        <div className="ios-field"><label>이메일</label><input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="email@example.com" /></div>
      </div>
      <div className="ios-fields">
        <div className="ios-field"><label>메모</label><textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="메모" /></div>
      </div>
      <button onClick={() => onSave(f)} className="w-full p-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm mt-2">저장</button>
      {onDelete && <div className="ios-danger" onClick={onDelete}>연락처 삭제</div>}
    </div>
  );
}

// ══════════════════════════════
// CALENDAR
// ══════════════════════════════
function CalendarPanel({ userId, openModal, closeModal }: { userId: string; openModal: any; closeModal: any }) {
  const [calDate, setCalDate] = useState(new Date());
  const [selected, setSelected] = useState(new Date().toISOString().split("T")[0]);
  const [events, setEvents] = useState<any[]>([]);
  const [inlineForm, setInlineForm] = useState(false);
  const [inlineData, setInlineData] = useState({ title: "", start_time: "", description: "" });
  const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

  const load = useCallback(async () => {
    const y = calDate.getFullYear(), m = calDate.getMonth() + 1;
    const ms = `${y}-${String(m).padStart(2, "0")}`;
    const start = `${ms}-01`;
    const end = `${y}-${String(m).padStart(2, "0")}-${new Date(y, m, 0).getDate()}`;
    const { data } = await supabase.from("schedules").select("*").eq("user_id", userId).gte("start_date", start).lte("start_date", end).order("start_time");
    setEvents(data || []);
  }, [userId, calDate]);

  useEffect(() => { load(); }, [load]);

  const y = calDate.getFullYear(), m = calDate.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];
  const eventDates = new Set(events.map((e) => e.start_date));
  const dayEvents = events.filter((e) => e.start_date === selected);

  async function saveEvent(f: any) {
    if (f.id) {
      await supabase.from("schedules").update(f).eq("id", f.id);
    } else {
      await supabase.from("schedules").insert({ ...f, user_id: userId });
    }
    closeModal();
    load();
  }

  async function delEvent(id: number) {
    if (!confirm("삭제?")) return;
    await supabase.from("schedules").delete().eq("id", id);
    closeModal();
    load();
  }

  return (
    <div>
      <div className="bg-[var(--bg-card)] border-b border-[var(--gray-200)] px-5 pb-3 sticky top-[52px] z-10">
        <div className="flex items-center justify-between py-3">
          <h3 className="text-xl font-extrabold text-[var(--danger)]">{monthNames[m]} {y}</h3>
          <div className="flex gap-2 items-center">
            <button onClick={() => { setCalDate(new Date()); setSelected(today); }} className="text-sm text-[var(--primary)] font-semibold">오늘</button>
            <button onClick={() => setCalDate(new Date(y, m - 1))} className="text-lg text-[var(--primary)]">‹</button>
            <button onClick={() => setCalDate(new Date(y, m + 1))} className="text-lg text-[var(--primary)]">›</button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-[var(--gray-500)]">
          {["일","월","화","수","목","금","토"].map((d, i) => <div key={d} className={i === 0 ? "text-[var(--danger)]" : ""}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 text-center">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`p${i}`} className="py-2 text-sm opacity-25">{new Date(y, m, 0).getDate() - firstDay + i + 1}</div>)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isToday = ds === today;
            const isSel = ds === selected;
            return (
              <div key={d} onClick={() => setSelected(ds)} className="py-1 cursor-pointer">
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm transition-all
                  ${isToday ? "bg-[var(--danger)] text-white font-bold" : isSel ? "bg-[var(--primary)] text-white" : ""}`}>
                  {d}
                </div>
                <div className="flex gap-0.5 justify-center mt-0.5 min-h-[6px]">
                  {eventDates.has(ds) && <div className={`w-1.5 h-1.5 rounded-full ${isToday || isSel ? "bg-[var(--bg-card)]" : "bg-[var(--primary)]"}`} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-[var(--gray-500)] uppercase">
            {new Date(selected + "T00:00:00").getMonth() + 1}월 {new Date(selected + "T00:00:00").getDate()}일 {["일","월","화","수","목","금","토"][new Date(selected + "T00:00:00").getDay()]}요일
          </div>
        </div>

        {dayEvents.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-3 opacity-30">📅</div>
            <p className="text-[var(--gray-400)] mb-4">이 날에 일정이 없습니다</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => openModal("새 일정", <EventForm event={{ start_date: selected }} onSave={saveEvent} />, "fullscreen")} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--gray-100)] text-[var(--gray-700)]">A. 풀스크린</button>
              <button onClick={() => openModal("새 일정", <EventForm event={{ start_date: selected }} onSave={saveEvent} />, "bottom")} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--gray-100)] text-[var(--gray-700)]">B. 바텀시트</button>
              <button onClick={() => openModal("새 일정", <EventForm event={{ start_date: selected }} onSave={saveEvent} />, "side")} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--gray-100)] text-[var(--gray-700)]">C. 사이드</button>
              <button onClick={() => { setInlineForm(true); setInlineData({ title: "", start_time: "", description: "" }); }} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white">D. 인라인</button>
            </div>
          </div>
        ) : (
          <>
            {dayEvents.map((e) => (
              <div key={e.id} onClick={() => openModal("일정 수정", <EventForm event={e} onSave={saveEvent} onDelete={() => delEvent(e.id)} />, "bottom")}
                className="flex items-start gap-3 py-3 border-b border-[var(--gray-100)] cursor-pointer">
                <div className="w-[3px] rounded min-h-[36px]" style={{ background: e.color || "var(--primary)" }} />
                <div className="text-xs text-[var(--gray-500)] min-w-[42px] pt-0.5">{e.start_time?.substring(0, 5) || "종일"}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.title}</div>
                  {e.description && <div className="text-xs text-[var(--gray-500)] mt-0.5">{e.description}</div>}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => openModal("새 일정", <EventForm event={{ start_date: selected }} onSave={saveEvent} />, "fullscreen")} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--gray-100)] text-[var(--gray-700)]">A. 풀스크린</button>
              <button onClick={() => openModal("새 일정", <EventForm event={{ start_date: selected }} onSave={saveEvent} />, "bottom")} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--gray-100)] text-[var(--gray-700)]">B. 바텀시트</button>
              <button onClick={() => openModal("새 일정", <EventForm event={{ start_date: selected }} onSave={saveEvent} />, "side")} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--gray-100)] text-[var(--gray-700)]">C. 사이드</button>
              <button onClick={() => { setInlineForm(true); setInlineData({ title: "", start_time: "", description: "" }); }} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white">D. 인라인</button>
            </div>
          </>
        )}

        {/* Style D: Inline form */}
        {inlineForm && (
          <div className="mt-4 bg-[var(--bg-card)] rounded-xl border border-[var(--primary)] p-4 animate-[fadeIn_0.2s_ease]">
            <input value={inlineData.title} onChange={(e) => setInlineData({...inlineData, title: e.target.value})}
              placeholder="일정 제목" autoFocus
              className="w-full text-sm font-medium outline-none mb-2 pb-2 border-b border-[var(--gray-100)]" />
            <div className="flex gap-2 mb-2">
              <input type="time" value={inlineData.start_time} onChange={(e) => setInlineData({...inlineData, start_time: e.target.value})}
                className="text-sm outline-none text-[var(--gray-500)] flex-1" />
            </div>
            <input value={inlineData.description} onChange={(e) => setInlineData({...inlineData, description: e.target.value})}
              placeholder="메모 (선택)" className="w-full text-xs text-[var(--gray-500)] outline-none mb-3" />
            <div className="flex gap-2">
              <button onClick={async () => {
                if (!inlineData.title) return;
                await saveEvent({ title: inlineData.title, start_date: selected, start_time: inlineData.start_time, description: inlineData.description });
                setInlineForm(false);
              }} className="px-4 py-1.5 bg-[var(--primary)] text-white text-xs rounded-lg font-medium">저장</button>
              <button onClick={() => setInlineForm(false)} className="px-4 py-1.5 text-xs text-[var(--gray-500)]">취소</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EventForm({ event, onSave, onDelete }: { event?: any; onSave: (d: any) => void; onDelete?: () => void }) {
  const [f, setF] = useState(event || { title: "", start_date: "", start_time: "", end_time: "", description: "" });
  const set = (k: string, v: string) => setF((p: any) => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="ios-fields"><div className="ios-field"><label>제목</label><input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="미팅, 납품 등" /></div></div>
      <div className="ios-fields">
        <div className="ios-field"><label>날짜</label><input type="date" value={f.start_date} onChange={(e) => set("start_date", e.target.value)} /></div>
        <div className="ios-field"><label>시작</label><input type="time" value={f.start_time || ""} onChange={(e) => set("start_time", e.target.value)} /></div>
        <div className="ios-field"><label>종료</label><input type="time" value={f.end_time || ""} onChange={(e) => set("end_time", e.target.value)} /></div>
      </div>
      <div className="ios-fields"><div className="ios-field"><label>메모</label><textarea value={f.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="메모" /></div></div>
      <button onClick={() => onSave(f)} className="w-full p-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm mt-2">저장</button>
      {onDelete && <div className="ios-danger" onClick={onDelete}>일정 삭제</div>}
    </div>
  );
}

// ══════════════════════════════
// NOTES
// ══════════════════════════════
function NotesPanel({ userId, openModal, closeModal }: { userId: string; openModal: any; closeModal: any }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    let q = supabase.from("notes").select("*").eq("user_id", userId).order("pinned", { ascending: false }).order("updated_at", { ascending: false });
    if (search) q = q.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    const { data } = await q;
    setNotes(data || []);
  }, [userId, search]);

  useEffect(() => { load(); }, [load]);

  async function save(f: any) {
    if (f.id) { await supabase.from("notes").update({ ...f, updated_at: new Date().toISOString() }).eq("id", f.id); }
    else { await supabase.from("notes").insert({ ...f, user_id: userId }); }
    closeModal(); load();
  }

  async function del(id: number) {
    if (!confirm("삭제?")) return;
    await supabase.from("notes").delete().eq("id", id);
    closeModal(); load();
  }

  const [inlineOpen, setInlineOpen] = useState(false);
  const [inlineData, setInlineData] = useState({ title: "", content: "" });

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold">메모</h4>
        <div className="flex gap-1.5">
          <button onClick={() => openModal("새 메모", <NoteForm onSave={save} />, "fullscreen")} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--gray-100)] text-[var(--gray-700)]">A</button>
          <button onClick={() => openModal("새 메모", <NoteForm onSave={save} />, "bottom")} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--gray-100)] text-[var(--gray-700)]">B</button>
          <button onClick={() => openModal("새 메모", <NoteForm onSave={save} />, "side")} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--gray-100)] text-[var(--gray-700)]">C</button>
          <button onClick={() => { setInlineOpen(true); setInlineData({ title: "", content: "" }); }} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--primary)] text-white">D</button>
        </div>
      </div>
      {/* Inline form */}
      {inlineOpen && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--primary)] p-4 mb-4 animate-[fadeIn_0.2s_ease]">
          <input value={inlineData.title} onChange={(e) => setInlineData({...inlineData, title: e.target.value})} placeholder="제목 (선택)" autoFocus className="w-full text-sm font-medium outline-none mb-2 pb-2 border-b border-[var(--gray-100)]" />
          <textarea value={inlineData.content} onChange={(e) => setInlineData({...inlineData, content: e.target.value})} placeholder="메모 내용" className="w-full text-sm outline-none mb-3 min-h-[80px] resize-none" />
          <div className="flex gap-2">
            <button onClick={async () => { if (!inlineData.content) return; await save(inlineData); setInlineOpen(false); }} className="px-4 py-1.5 bg-[var(--primary)] text-white text-xs rounded-lg font-medium">저장</button>
            <button onClick={() => setInlineOpen(false)} className="px-4 py-1.5 text-xs text-[var(--gray-500)]">취소</button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 bg-[var(--gray-100)] rounded-xl px-4 py-2.5 mb-4">
        <span className="text-[var(--gray-400)]">🔍</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="메모 검색" className="flex-1 bg-transparent text-sm outline-none" />
      </div>
      {notes.length === 0 ? (
        <div className="text-center py-16 text-[var(--gray-400)]"><div className="text-4xl mb-3">📝</div>메모를 추가해보세요</div>
      ) : (
        <div className="columns-2 gap-3">
          {notes.map((n) => (
            <div key={n.id} onClick={() => openModal("메모 수정", <NoteForm note={n} onSave={save} onDelete={() => del(n.id)} />)}
              className="break-inside-avoid rounded-xl p-4 border border-[var(--gray-200)] mb-3 cursor-pointer hover:shadow-sm"
              style={{ background: n.color || "white" }}>
              {n.title && <div className="font-semibold text-sm mb-1">{n.pinned ? "📌 " : ""}{n.title}</div>}
              <div className="text-xs text-[var(--gray-500)] line-clamp-3">{n.content}</div>
              <div className="text-[10px] text-[var(--gray-400)] mt-2">{n.updated_at?.split("T")[0]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteForm({ note, onSave, onDelete }: { note?: any; onSave: (d: any) => void; onDelete?: () => void }) {
  const [f, setF] = useState(note || { title: "", content: "", color: "#FFFFFF" });
  const COLORS = ["#FFFFFF", "#FFB74D", "#66BB6A", "#42A5F5", "#EF5350", "#AB47BC"];

  return (
    <div>
      <div className="ios-fields"><div className="ios-field"><label>제목</label><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="제목 (선택)" /></div></div>
      <div className="ios-fields"><div className="ios-field" style={{ alignItems: "flex-start" }}><label style={{ paddingTop: 8 }}>내용</label><textarea value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} placeholder="메모 내용" style={{ minHeight: 150 }} /></div></div>
      <div className="flex gap-2 py-3">
        {COLORS.map((c) => (
          <div key={c} onClick={() => setF({ ...f, color: c })}
            className="w-7 h-7 rounded-full cursor-pointer border-2" style={{ background: c, borderColor: f.color === c ? "var(--primary)" : "transparent" }} />
        ))}
      </div>
      <button onClick={() => onSave(f)} className="w-full p-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm mt-2">저장</button>
      {onDelete && <div className="ios-danger" onClick={onDelete}>메모 삭제</div>}
    </div>
  );
}

// ══════════════════════════════
// TODOS
// ══════════════════════════════
function TodosPanel({ userId }: { userId: string }) {
  const [todos, setTodos] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase.from("todos").select("*").eq("user_id", userId).order("completed").order("priority", { ascending: false }).order("created_at", { ascending: false });
    setTodos(data || []);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!input.trim()) return;
    await supabase.from("todos").insert({ user_id: userId, title: input.trim() });
    setInput(""); load();
  }

  async function toggle(id: number, done: boolean) {
    await supabase.from("todos").update({ completed: !done }).eq("id", id);
    load();
  }

  async function del(id: number) {
    await supabase.from("todos").delete().eq("id", id);
    load();
  }

  const pending = todos.filter((t) => !t.completed);
  const done = todos.filter((t) => t.completed);

  return (
    <div className="p-5">
      <h4 className="text-lg font-bold mb-3">할일</h4>
      <div className="flex gap-2 mb-4">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="할 일 입력 후 Enter" className="flex-1 p-3 bg-[var(--bg-card)] border border-[var(--gray-200)] rounded-xl text-sm outline-none focus:border-[var(--primary)]" />
        <button onClick={add} className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold">추가</button>
      </div>
      {pending.length === 0 && done.length === 0 && (
        <div className="text-center py-16 text-[var(--gray-400)]"><div className="text-4xl mb-3">✅</div>할 일을 입력해보세요</div>
      )}
      {pending.map((t) => (
        <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border mb-2">
          <div onClick={() => toggle(t.id, t.completed)} className="w-5 h-5 rounded-full border-2 border-[var(--gray-300)] cursor-pointer shrink-0" />
          <div className="flex-1 text-sm">{t.title}</div>
          <button onClick={() => del(t.id)} className="text-[var(--gray-400)] text-xs">✕</button>
        </div>
      ))}
      {done.length > 0 && (
        <>
          <div className="text-xs text-[var(--gray-400)] mt-6 mb-2">완료 ({done.length})</div>
          {done.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border mb-2 opacity-50">
              <div onClick={() => toggle(t.id, t.completed)}
                className="w-5 h-5 rounded-full bg-[var(--primary)] border-2 border-[var(--primary)] text-white flex items-center justify-center cursor-pointer text-[10px] shrink-0">✓</div>
              <div className="flex-1 text-sm line-through text-[var(--gray-500)]">{t.title}</div>
              <button onClick={() => del(t.id)} className="text-[var(--gray-400)] text-xs">✕</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════
// LEDGER
// ══════════════════════════════
function LedgerPanel({ userId, openModal, closeModal }: { userId: string; openModal: any; closeModal: any }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const load = useCallback(async () => {
    const month = new Date().toISOString().substring(0, 7);
    const { data } = await supabase.from("ledger").select("*").eq("user_id", userId).gte("entry_date", month + "-01").order("entry_date", { ascending: false }).order("id", { ascending: false });
    const list = data || [];
    setEntries(list);
    setIncome(list.filter((e: any) => e.entry_type === "income").reduce((s: number, e: any) => s + Number(e.amount), 0));
    setExpense(list.filter((e: any) => e.entry_type === "expense").reduce((s: number, e: any) => s + Number(e.amount), 0));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function save(f: any) {
    await supabase.from("ledger").insert({ ...f, user_id: userId });
    closeModal(); load();
  }

  async function del(id: number) {
    await supabase.from("ledger").delete().eq("id", id);
    load();
  }

  const fmt = (n: number) => "₩" + n.toLocaleString();

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold">매출장부</h4>
        <div className="flex gap-2">
          <button onClick={() => openModal("매출 입력", <LedgerForm type="income" onSave={save} />)} className="text-[var(--primary)] text-sm font-medium">+ 매출</button>
          <button onClick={() => openModal("지출 입력", <LedgerForm type="expense" onSave={save} />)} className="text-[var(--danger)] text-sm font-medium">+ 지출</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[var(--bg-card)] rounded-xl p-3 text-center border border-[var(--gray-200)]"><div className="text-[10px] text-[var(--gray-500)]">매출</div><div className="font-extrabold text-[var(--primary)]">{fmt(income)}</div></div>
        <div className="bg-[var(--bg-card)] rounded-xl p-3 text-center border border-[var(--gray-200)]"><div className="text-[10px] text-[var(--gray-500)]">지출</div><div className="font-extrabold text-[var(--danger)]">{fmt(expense)}</div></div>
        <div className="bg-[var(--bg-card)] rounded-xl p-3 text-center border border-[var(--gray-200)]"><div className="text-[10px] text-[var(--gray-500)]">순이익</div><div className="font-extrabold text-[var(--success)]">{fmt(income - expense)}</div></div>
      </div>
      {entries.length === 0 ? (
        <div className="text-center py-12 text-[var(--gray-400)]"><div className="text-4xl mb-3">💰</div>매출이나 지출을 입력해보세요</div>
      ) : (
        entries.map((e) => (
          <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl border mb-2">
            <div className="flex-1"><div className="font-semibold text-sm">{e.description || "기타"}</div><div className="text-[11px] text-[var(--gray-500)]">{e.entry_date}{e.payment_method ? ` · ${e.payment_method}` : ""}</div></div>
            <div className={`font-bold ${e.entry_type === "income" ? "text-[var(--primary)]" : "text-[var(--danger)]"}`}>{e.entry_type === "income" ? "+" : "-"}{fmt(Number(e.amount))}</div>
            <button onClick={() => del(e.id)} className="text-[var(--gray-400)] text-xs">✕</button>
          </div>
        ))
      )}
    </div>
  );
}

function LedgerForm({ type, onSave }: { type: string; onSave: (d: any) => void }) {
  const [f, setF] = useState({ entry_type: type, amount: "", description: "", entry_date: new Date().toISOString().split("T")[0], payment_method: "" });

  return (
    <div>
      <div className="ios-fields">
        <div className="ios-field"><label>금액</label><input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="0" style={{ fontSize: 20, fontWeight: 700 }} /></div>
        <div className="ios-field"><label>내용</label><input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder={type === "income" ? "점심 영업" : "식자재"} /></div>
        <div className="ios-field"><label>날짜</label><input type="date" value={f.entry_date} onChange={(e) => setF({ ...f, entry_date: e.target.value })} /></div>
        <div className="ios-field"><label>결제</label><select value={f.payment_method} onChange={(e) => setF({ ...f, payment_method: e.target.value })}>
          <option value="">선택</option><option value="현금">현금</option><option value="카드">카드</option><option value="계좌이체">계좌이체</option></select></div>
      </div>
      <button onClick={() => { if (!f.amount) return; onSave(f); }} className="w-full p-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm mt-2">저장</button>
    </div>
  );
}

// ══════════════════════════════
// RESERVATIONS
// ══════════════════════════════
function ReservationsPanel({ userId, openModal, closeModal }: { userId: string; openModal: any; closeModal: any }) {
  const [list, setList] = useState<any[]>([]);

  const load = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase.from("reservations").select("*").eq("user_id", userId).eq("reservation_date", today).order("reservation_time");
    setList(data || []);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function save(f: any) {
    await supabase.from("reservations").insert({ ...f, user_id: userId });
    closeModal(); load();
  }

  const [inlineOpen, setInlineOpen] = useState(false);
  const [inlineData, setInlineData] = useState({ customer_name: "", customer_phone: "", party_size: 2, reservation_time: "" });

  const total = list.reduce((s, r) => s + r.party_size, 0);
  const stl: Record<string, string> = { confirmed: "확인", completed: "완료", cancelled: "취소", noshow: "노쇼" };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold">오늘 예약</h4>
        <div className="flex gap-1.5">
          <button onClick={() => openModal("예약 추가", <ReservationForm onSave={save} />, "fullscreen")} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--gray-100)] text-[var(--gray-700)]">A</button>
          <button onClick={() => openModal("예약 추가", <ReservationForm onSave={save} />, "bottom")} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--gray-100)] text-[var(--gray-700)]">B</button>
          <button onClick={() => openModal("예약 추가", <ReservationForm onSave={save} />, "side")} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--gray-100)] text-[var(--gray-700)]">C</button>
          <button onClick={() => { setInlineOpen(true); setInlineData({ customer_name: "", customer_phone: "", party_size: 2, reservation_time: "" }); }} className="px-2.5 py-1 text-[10px] rounded-md bg-[var(--primary)] text-white">D</button>
        </div>
      </div>
      {/* Inline form */}
      {inlineOpen && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--primary)] p-4 mb-4 animate-[fadeIn_0.2s_ease]">
          <input value={inlineData.customer_name} onChange={(e) => setInlineData({...inlineData, customer_name: e.target.value})} placeholder="고객명" autoFocus className="w-full text-sm font-medium outline-none mb-2 pb-2 border-b border-[var(--gray-100)]" />
          <div className="flex gap-2 mb-2">
            <input value={inlineData.customer_phone} onChange={(e) => setInlineData({...inlineData, customer_phone: e.target.value})} placeholder="전화번호" className="flex-1 text-sm outline-none pb-2 border-b border-[var(--gray-100)]" />
            <input type="number" value={inlineData.party_size} onChange={(e) => setInlineData({...inlineData, party_size: parseInt(e.target.value)||1})} className="w-16 text-sm text-right outline-none pb-2 border-b border-[var(--gray-100)]" />
            <span className="text-xs text-[var(--gray-500)] self-end pb-2">명</span>
          </div>
          <input type="time" value={inlineData.reservation_time} onChange={(e) => setInlineData({...inlineData, reservation_time: e.target.value})} className="text-sm outline-none mb-3" />
          <div className="flex gap-2">
            <button onClick={async () => {
              if (!inlineData.customer_name) return;
              await save({...inlineData, reservation_date: new Date().toISOString().split("T")[0]});
              setInlineOpen(false);
            }} className="px-4 py-1.5 bg-[var(--primary)] text-white text-xs rounded-lg font-medium">저장</button>
            <button onClick={() => setInlineOpen(false)} className="px-4 py-1.5 text-xs text-[var(--gray-500)]">취소</button>
          </div>
        </div>
      )}
      {list.length === 0 ? (
        <div className="text-center py-12 text-[var(--gray-400)]"><div className="text-4xl mb-3">📋</div>오늘 예약이 없습니다</div>
      ) : (
        <>
          {list.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border mb-2">
              <div className="min-w-[45px] text-center font-bold text-[var(--primary)] text-sm">{r.reservation_time?.substring(0, 5)}</div>
              <div className="flex-1"><div className="font-semibold text-sm">{r.customer_name} · {r.party_size}명</div><div className="text-[11px] text-[var(--gray-500)]">{[r.service, r.notes].filter(Boolean).join(" · ")}</div></div>
              <span className="text-xs text-[var(--primary)]">{stl[r.status] || r.status}</span>
            </div>
          ))}
          <div className="text-center text-xs text-[var(--gray-500)] mt-3">{list.length}건 · {total}명</div>
        </>
      )}
    </div>
  );
}

function ReservationForm({ onSave }: { onSave: (d: any) => void }) {
  const [f, setF] = useState({ customer_name: "", customer_phone: "", party_size: 2, reservation_date: new Date().toISOString().split("T")[0], reservation_time: "", service: "", notes: "" });

  return (
    <div>
      <div className="ios-fields">
        <div className="ios-field"><label>고객명</label><input value={f.customer_name} onChange={(e) => setF({ ...f, customer_name: e.target.value })} placeholder="홍길동" /></div>
        <div className="ios-field"><label>전화</label><input value={f.customer_phone} onChange={(e) => setF({ ...f, customer_phone: e.target.value })} placeholder="010-1234-5678" /></div>
        <div className="ios-field"><label>인원</label><input type="number" value={f.party_size} onChange={(e) => setF({ ...f, party_size: parseInt(e.target.value) || 1 })} /></div>
      </div>
      <div className="ios-fields">
        <div className="ios-field"><label>날짜</label><input type="date" value={f.reservation_date} onChange={(e) => setF({ ...f, reservation_date: e.target.value })} /></div>
        <div className="ios-field"><label>시간</label><input type="time" value={f.reservation_time} onChange={(e) => setF({ ...f, reservation_time: e.target.value })} /></div>
        <div className="ios-field"><label>메뉴</label><input value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} placeholder="갈비탕 코스" /></div>
      </div>
      <button onClick={() => { if (!f.customer_name) return; onSave(f); }} className="w-full p-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm mt-2">저장</button>
    </div>
  );
}

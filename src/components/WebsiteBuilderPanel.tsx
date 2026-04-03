"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Website {
  id: number;
  user_id: string;
  slug: string;
  business_name: string;
  template: string;
  status: string;
  content: WebsiteContent;
  created_at: string;
  updated_at: string;
}

interface WebsiteContent {
  hero: { title: string; subtitle: string; image: string };
  about: { text: string; image: string };
  services: { name: string; description: string; price: string }[];
  hours: Record<string, string>;
  contact: { phone: string; email: string; address: string; kakao: string };
  gallery: string[];
  theme: { color: string; font: string };
}

const EMPTY_CONTENT: WebsiteContent = {
  hero: { title: "", subtitle: "", image: "" },
  about: { text: "", image: "" },
  services: [{ name: "", description: "", price: "" }],
  hours: { mon: "09:00 - 18:00", tue: "09:00 - 18:00", wed: "09:00 - 18:00", thu: "09:00 - 18:00", fri: "09:00 - 18:00", sat: "휴무", sun: "휴무" },
  contact: { phone: "", email: "", address: "", kakao: "" },
  gallery: [],
  theme: { color: "#0071E3", font: "default" },
};

const TEMPLATES = [
  { id: "restaurant", name: "음식점/카페", icon: "🍽️", desc: "메뉴, 예약, 위치 중심" },
  { id: "service", name: "서비스/뷰티", icon: "💇", desc: "서비스 목록, 예약 중심" },
  { id: "retail", name: "매장/쇼핑", icon: "🛍️", desc: "상품, 위치, 영업시간 중심" },
  { id: "office", name: "사무실/B2B", icon: "🏢", desc: "회사 소개, 서비스, 연락처 중심" },
];

const COLORS = ["#0071E3", "#FF6B35", "#30D158", "#5856D6", "#FF2D55", "#FF9500", "#000000", "#E53935"];
const DAY_LABELS: Record<string, string> = { mon: "월", tue: "화", wed: "수", thu: "목", fri: "금", sat: "토", sun: "일" };

// ══════════════════════════════
// MAIN PANEL
// ══════════════════════════════
export default function WebsiteBuilderPanel({ userId, plan, openModal, closeModal }: { userId: string; plan: string; openModal: any; closeModal: any }) {
  const [sites, setSites] = useState<Website[]>([]);
  const [editing, setEditing] = useState<Website | null>(null);
  const [creating, setCreating] = useState(false);
  const isPro = plan === "pro" || plan === "team";

  const load = useCallback(async () => {
    const { data } = await supabase.from("websites").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setSites((data as Website[]) || []);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const canCreate = isPro || sites.length === 0;

  if (editing) return <EditorPanel site={editing} isPro={isPro} onSave={async (s) => { await saveSite(s); setEditing(null); load(); }} onBack={() => setEditing(null)} onDelete={async (id) => { await deleteSite(id); setEditing(null); load(); }} />;
  if (creating) return <CreatePanel userId={userId} onCreated={(s) => { setCreating(false); setEditing(s); load(); }} onBack={() => setCreating(false)} />;

  return (
    <div className="p-5">
      {!isPro && (
        <div className="rounded-2xl p-5 mb-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0071E3, #5856D6)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "white", transform: "translate(30%, -30%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/20 text-white">PRO</span>
              <span className="text-white/80 text-xs">Tier 2</span>
            </div>
            <div className="text-white font-bold text-lg mb-1">AI 홈페이지 빌더</div>
            <div className="text-white/80 text-sm mb-3">대화형으로 내 가게 웹사이트를 만들어보세요</div>
            <div className="text-white/60 text-[11px]">사이트 1개 무료 체험 · 게시는 PRO 전용</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold">내 홈페이지</h4>
          <p className="text-xs text-[var(--text-muted)]">
            {isPro ? "사이트를 만들고 게시하세요" : `무료 체험: 1개 사이트${sites.length > 0 ? " (사용 중)" : ""}`}
          </p>
        </div>
        {canCreate && (
          <button onClick={() => setCreating(true)} className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold active:scale-[0.98]">
            + 새 사이트
          </button>
        )}
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <div className="text-5xl mb-4">🌐</div>
          <div className="font-semibold mb-1">아직 만든 사이트가 없습니다</div>
          <div className="text-sm mb-6">템플릿을 선택하면 바로 시작할 수 있어요</div>
          <div className="grid grid-cols-2 gap-3 text-left mb-6">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
                <div className="text-3xl mb-2">{t.icon}</div>
                <div className="font-semibold text-sm text-[var(--text)]">{t.name}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-1">{t.desc}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setCreating(true)} className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold">
            {isPro ? "홈페이지 만들기" : "무료로 체험하기"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((s) => (
            <div key={s.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: (s.content?.theme?.color || "#0071E3") + "15", color: s.content?.theme?.color || "#0071E3" }}>
                    {TEMPLATES.find(t => t.id === s.template)?.icon || "🌐"}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{s.business_name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{s.slug}.ilpro.ai</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.status === "published" ? "bg-[#30D15820] text-[#30D158]" : "bg-[var(--bg-hover)] text-[var(--text-muted)]"}`}>
                  {s.status === "published" ? "게시됨" : "초안"}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditing(s)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-[var(--primary)] text-white active:scale-[0.98]">
                  편집하기
                </button>
                {s.status === "published" && (
                  <a href={`/sites/${s.slug}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 text-xs font-medium rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] text-center active:scale-[0.98]">
                    방문 ↗
                  </a>
                )}
              </div>
            </div>
          ))}
          {!isPro && (
            <div className="rounded-xl border-2 border-dashed p-4 text-center mt-4" style={{ borderColor: "var(--primary)" }}>
              <div className="text-sm font-semibold mb-1" style={{ color: "var(--primary)" }}>사이트를 게시하려면?</div>
              <div className="text-xs text-[var(--text-muted)] mb-3">PRO 플랜으로 업그레이드하면 {"{가게}.ilpro.ai"}로 바로 게시됩니다</div>
              <button className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white" style={{ background: "linear-gradient(135deg, #0071E3, #5856D6)" }}>
                PRO 업그레이드 — ₩29,900/월
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════
// CREATE — template + slug
// ══════════════════════════════
function CreatePanel({ userId, onCreated, onBack }: { userId: string; onCreated: (s: Website) => void; onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState("");
  const [bizName, setBizName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [saving, setSaving] = useState(false);

  async function checkSlug(s: string) {
    if (!s) { setSlugError(""); return; }
    if (s.length < 2) { setSlugError("2자 이상 입력해주세요"); return; }
    if (!/^[a-z0-9-]+$/.test(s)) { setSlugError("영문 소문자, 숫자, 하이픈만 가능"); return; }
    const { data } = await supabase.from("websites").select("id").eq("slug", s).maybeSingle();
    if (data) { setSlugError("이미 사용 중인 주소입니다"); return; }
    setSlugError("");
  }

  async function create() {
    if (!template || !bizName || !slug || slugError) return;
    setSaving(true);
    const subtitles: Record<string, string> = { restaurant: "맛있는 음식과 따뜻한 분위기", service: "최고의 서비스를 제공합니다", retail: "좋은 상품을 합리적인 가격에", office: "신뢰할 수 있는 비즈니스 파트너" };
    const content = { ...EMPTY_CONTENT, hero: { ...EMPTY_CONTENT.hero, title: bizName, subtitle: subtitles[template] || "" } };
    const { data, error } = await supabase.from("websites").insert({ user_id: userId, slug, business_name: bizName, template, status: "draft", content }).select().single();
    setSaving(false);
    if (error) { alert("오류: " + error.message); return; }
    onCreated(data as Website);
  }

  return (
    <div className="p-5">
      <button onClick={onBack} className="text-[var(--primary)] text-sm font-medium mb-4">← 돌아가기</button>
      {step === 1 && (
        <>
          <h4 className="text-lg font-bold mb-1">템플릿 선택</h4>
          <p className="text-xs text-[var(--text-muted)] mb-4">업종에 맞는 템플릿을 선택하세요</p>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => { setTemplate(t.id); setStep(2); }}
                className="bg-[var(--bg-card)] border-2 rounded-xl p-4 text-left active:scale-[0.98] transition-all"
                style={{ borderColor: template === t.id ? "var(--primary)" : "var(--border)" }}>
                <div className="text-3xl mb-2">{t.icon}</div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <h4 className="text-lg font-bold mb-1">기본 정보</h4>
          <p className="text-xs text-[var(--text-muted)] mb-4">사이트 이름과 주소를 입력하세요</p>
          <div className="ios-fields mb-4">
            <div className="ios-field">
              <label>가게 이름</label>
              <input value={bizName} onChange={(e) => { setBizName(e.target.value); if (!slug) { const v = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 30); setSlug(v); } }} placeholder="맛있는한식당" autoFocus />
            </div>
            <div className="ios-field">
              <label>사이트 주소</label>
              <div className="flex items-center gap-1 flex-1">
                <input value={slug} onChange={(e) => { const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""); setSlug(v); checkSlug(v); }} placeholder="my-store" className="flex-1" />
                <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">.ilpro.ai</span>
              </div>
            </div>
          </div>
          {slugError && <div className="text-xs text-[var(--danger)] mb-3 px-1">{slugError}</div>}
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 py-3 text-sm font-medium rounded-xl bg-[var(--bg-hover)] text-[var(--text-secondary)]">뒤로</button>
            <button onClick={create} disabled={!bizName || !slug || !!slugError || saving} className="flex-1 py-3 text-sm font-semibold rounded-xl bg-[var(--primary)] text-white disabled:opacity-50">
              {saving ? "생성 중..." : "사이트 만들기"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════
// EDITOR — split pane: chat left + preview right
// ══════════════════════════════

interface ChatMessage {
  role: "system" | "user";
  text: string;
  section?: string;
}

function EditorPanel({ site, isPro, onSave, onBack, onDelete }: { site: Website; isPro: boolean; onSave: (s: Website) => void; onBack: () => void; onDelete: (id: number) => void }) {
  const [c, setC] = useState<WebsiteContent>(site.content || EMPTY_CONTENT);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(site.status);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", text: `"${site.business_name}" 홈페이지를 만들어볼게요! 아래 항목을 채워주세요. 하나씩 입력해도 되고, 한번에 여러 개 입력해도 돼요.` },
    { role: "system", text: "어떤 항목을 수정할까요?", section: "menu" },
  ]);
  const [input, setInput] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sections = [
    { id: "hero", icon: "🎯", label: "메인 타이틀", fields: ["제목", "부제목"] },
    { id: "about", icon: "📖", label: "소개글", fields: ["소개글"] },
    { id: "services", icon: "📋", label: site.template === "restaurant" ? "메뉴" : "서비스", fields: ["이름, 설명, 가격"] },
    { id: "hours", icon: "🕐", label: "영업시간", fields: ["월~일 영업시간"] },
    { id: "contact", icon: "📞", label: "연락처", fields: ["전화, 이메일, 주소"] },
    { id: "theme", icon: "🎨", label: "브랜드 컬러", fields: ["컬러 선택"] },
  ];

  function handleSectionClick(sectionId: string) {
    setActiveSection(sectionId);
    const sec = sections.find(s => s.id === sectionId);
    if (!sec) return;

    const hints: Record<string, string> = {
      hero: `메인 타이틀을 입력하세요.\n예: "맛있는한식당" / "정성을 담은 한 끼"`,
      about: `가게 소개를 자유롭게 작성해주세요.\n예: "20년 전통의 한식 전문점입니다. 매일 새벽 시장에서 직접 재료를 골라옵니다."`,
      services: `${site.template === "restaurant" ? "메뉴" : "서비스"}를 입력하세요. 한 줄에 하나씩:\n예:\n갈비탕 - 한우 갈비 - 15,000\n된장찌개 - 집된장 - 9,000\n불고기정식 - 1인분 - 12,000`,
      hours: `영업시간을 입력하세요.\n예:\n월~금 09:00-21:00\n토 10:00-18:00\n일 휴무`,
      contact: `연락처를 입력하세요.\n예:\n전화: 052-123-4567\n주소: 울산 남구 삼산동 123\n이메일: info@example.com`,
      theme: "아래에서 브랜드 컬러를 선택하세요.",
    };

    setMessages(prev => [...prev, { role: "system", text: hints[sectionId] || "", section: sectionId }]);
  }

  function parseAndApply(text: string) {
    if (!activeSection) return;
    const updated = { ...c };

    switch (activeSection) {
      case "hero": {
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines[0]) {
          const parts = lines[0].split(/[\/\|]/).map(s => s.trim());
          updated.hero = { ...updated.hero, title: parts[0] || updated.hero.title, subtitle: parts[1] || lines[1] || updated.hero.subtitle };
        }
        if (lines[1] && !lines[0].includes("/")) updated.hero.subtitle = lines[1];
        break;
      }
      case "about": {
        updated.about = { ...updated.about, text: text.trim() };
        break;
      }
      case "services": {
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        const svcs = lines.map(line => {
          const parts = line.split(/[-–—,]/).map(s => s.trim());
          return { name: parts[0] || "", description: parts[1] || "", price: parts[2] || "" };
        }).filter(s => s.name);
        if (svcs.length > 0) updated.services = [...updated.services.filter(s => s.name), ...svcs];
        break;
      }
      case "hours": {
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        const dayMap: Record<string, string[]> = {
          "월": ["mon"], "화": ["tue"], "수": ["wed"], "목": ["thu"], "금": ["fri"], "토": ["sat"], "일": ["sun"],
          "월~금": ["mon", "tue", "wed", "thu", "fri"], "월-금": ["mon", "tue", "wed", "thu", "fri"],
          "토~일": ["sat", "sun"], "토-일": ["sat", "sun"],
          "매일": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        };
        for (const line of lines) {
          for (const [key, days] of Object.entries(dayMap)) {
            if (line.startsWith(key)) {
              const time = line.replace(key, "").replace(/^[\s:]+/, "").trim();
              for (const d of days) updated.hours[d] = time;
            }
          }
        }
        break;
      }
      case "contact": {
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          const lower = line.toLowerCase();
          const val = line.replace(/^(전화|주소|이메일|카카오톡?|메일|email|phone|address)[\s:：]+/i, "").trim();
          if (lower.match(/^(전화|phone|tel)/)) updated.contact.phone = val;
          else if (lower.match(/^(주소|address)/)) updated.contact.address = val;
          else if (lower.match(/^(이메일|메일|email)/)) updated.contact.email = val;
          else if (lower.match(/^(카카오)/)) updated.contact.kakao = val;
          else if (line.match(/^\d{2,3}-\d{3,4}-\d{4}$/)) updated.contact.phone = line;
          else if (line.includes("@")) updated.contact.email = line;
          else updated.contact.address = line;
        }
        break;
      }
    }
    setC(updated);
  }

  function handleSend() {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");

    if (activeSection) {
      parseAndApply(text);
      setMessages(prev => [...prev, { role: "system", text: "적용했어요! 미리보기에서 확인하세요. 다른 항목을 수정할까요?", section: "menu" }]);
      setActiveSection(null);
    } else {
      // Try to guess which section from keywords
      const lower = text.toLowerCase();
      if (lower.match(/제목|타이틀|이름|메인/)) { setActiveSection("hero"); handleSectionClick("hero"); }
      else if (lower.match(/소개|설명|about/)) { setActiveSection("about"); handleSectionClick("about"); }
      else if (lower.match(/메뉴|서비스|가격|목록/)) { setActiveSection("services"); handleSectionClick("services"); }
      else if (lower.match(/시간|영업|오픈/)) { setActiveSection("hours"); handleSectionClick("hours"); }
      else if (lower.match(/연락|전화|주소|이메일/)) { setActiveSection("contact"); handleSectionClick("contact"); }
      else if (lower.match(/색|컬러|디자인|테마/)) { setActiveSection("theme"); handleSectionClick("theme"); }
      else {
        setMessages(prev => [...prev, { role: "system", text: "아래 버튼에서 수정할 항목을 선택해주세요.", section: "menu" }]);
      }
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function save(publish?: boolean) {
    setSaving(true);
    const newStatus = publish !== undefined ? (publish ? "published" : "draft") : status;
    await supabase.from("websites").update({ content: c, status: newStatus, updated_at: new Date().toISOString() }).eq("id", site.id);
    setStatus(newStatus);
    setSaving(false);
    onSave({ ...site, content: c, status: newStatus });
  }

  // ── Render ──
  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col" style={{ marginLeft: -20, marginRight: -20, marginTop: -20 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-[var(--primary)] text-sm font-medium">← 나가기</button>
          <div className="hidden sm:block">
            <span className="font-semibold text-sm">{site.business_name}</span>
            <span className="text-xs text-[var(--text-muted)] ml-2">{site.slug}.ilpro.ai</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile toggle */}
          <div className="flex md:hidden rounded-lg overflow-hidden border border-[var(--border)]">
            <button onClick={() => setMobileView("edit")}
              className="px-3 py-1.5 text-xs font-medium"
              style={{ background: mobileView === "edit" ? "var(--primary)" : "transparent", color: mobileView === "edit" ? "white" : "var(--text-secondary)" }}>
              편집
            </button>
            <button onClick={() => setMobileView("preview")}
              className="px-3 py-1.5 text-xs font-medium"
              style={{ background: mobileView === "preview" ? "var(--primary)" : "transparent", color: mobileView === "preview" ? "white" : "var(--text-secondary)" }}>
              미리보기
            </button>
          </div>

          <span className={`text-[10px] px-2 py-0.5 rounded-full ${status === "published" ? "bg-[#30D15820] text-[#30D158]" : "bg-[var(--bg-hover)] text-[var(--text-muted)]"}`}>
            {status === "published" ? "게시됨" : "초안"}
          </span>
          {status === "published" ? (
            <button onClick={() => save(false)} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)]">비공개</button>
          ) : isPro ? (
            <button onClick={() => save(true)} className="px-3 py-1.5 text-xs rounded-lg bg-[#30D158] text-white font-medium">게시</button>
          ) : (
            <button className="px-3 py-1.5 text-xs rounded-lg text-white font-medium" style={{ background: "linear-gradient(135deg, #0071E3, #5856D6)" }}
              onClick={() => alert("PRO 플랜으로 업그레이드하면 사이트를 게시할 수 있습니다.\n₩29,900/월")}>🔒 게시</button>
          )}
          <button onClick={() => save()} disabled={saving} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white font-medium">
            {saving ? "..." : "저장"}
          </button>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT — Chat input */}
        <div className={`${mobileView === "edit" ? "flex" : "hidden"} md:flex flex-col w-full md:w-1/2 lg:w-[45%]`} style={{ borderRight: "1px solid var(--border)", background: "var(--bg)" }}>
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === "system" ? (
                  <div>
                    <div className="inline-block max-w-[90%] rounded-2xl rounded-tl-md px-4 py-2.5 text-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <div className="whitespace-pre-wrap" style={{ color: "var(--text)" }}>{msg.text}</div>
                    </div>
                    {/* Section menu buttons */}
                    {msg.section === "menu" && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {sections.map(s => (
                          <button key={s.id} onClick={() => handleSectionClick(s.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-all"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                            <span>{s.icon}</span> {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Color picker inline */}
                    {msg.section === "theme" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {COLORS.map(color => (
                          <button key={color} onClick={() => {
                            setC(prev => ({ ...prev, theme: { ...prev.theme, color } }));
                            setMessages(prev => [...prev, { role: "user", text: `컬러: ${color}` }, { role: "system", text: "브랜드 컬러를 적용했어요! 다른 항목을 수정할까요?", section: "menu" }]);
                            setActiveSection(null);
                          }}
                            className="w-9 h-9 rounded-full border-2 transition-all active:scale-90"
                            style={{ background: color, borderColor: c.theme.color === color ? "var(--text)" : "transparent", transform: c.theme.color === color ? "scale(1.15)" : "scale(1)" }} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="inline-block max-w-[85%] rounded-2xl rounded-tr-md px-4 py-2.5 text-sm text-white" style={{ background: "var(--primary)" }}>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div className="shrink-0 p-3" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}>
            {activeSection && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                  {sections.find(s => s.id === activeSection)?.icon} {sections.find(s => s.id === activeSection)?.label} 수정 중
                </span>
                <button onClick={() => { setActiveSection(null); setMessages(prev => [...prev, { role: "system", text: "취소했어요. 다른 항목을 선택해주세요.", section: "menu" }]); }}
                  className="text-[11px] text-[var(--text-muted)]">취소</button>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={activeSection ? "내용을 입력하세요..." : "수정할 항목을 선택하거나 자유롭게 입력하세요"}
                className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none min-h-[44px] max-h-[120px]"
                style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                rows={1} />
              <button onClick={handleSend}
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white active:scale-95"
                style={{ background: input.trim() ? "var(--primary)" : "var(--border)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
              </button>
            </div>
          </div>

          {/* Delete at bottom */}
          <div className="shrink-0 px-4 py-2 text-center" style={{ borderTop: "1px solid var(--border)" }}>
            <button onClick={() => { if (confirm("이 사이트를 삭제하시겠습니까?")) onDelete(site.id); }} className="text-xs text-[var(--danger)]">사이트 삭제</button>
          </div>
        </div>

        {/* RIGHT — Live preview */}
        <div className={`${mobileView === "preview" ? "flex" : "hidden"} md:flex flex-col flex-1 items-center overflow-y-auto`} style={{ background: "var(--bg-hover)" }}>
          <div className="py-4 px-4 w-full max-w-[420px]">
            {/* URL bar */}
            <div className="flex items-center gap-2 rounded-t-xl px-3 py-2" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 text-center text-[11px] text-[var(--text-muted)] bg-[var(--bg)] rounded-md py-1 px-2">
                {site.slug}.ilpro.ai
              </div>
            </div>

            {/* Site preview */}
            <div className="rounded-b-xl overflow-hidden shadow-lg" style={{ background: "#FAFAFA" }}>
              {/* Hero */}
              <div className="relative" style={{ background: c.theme.color, minHeight: 160 }}>
                {c.hero.image && <img src={c.hero.image} alt="" className="w-full h-40 object-cover opacity-50" />}
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                  <div className="text-xl font-bold leading-tight">{c.hero.title || site.business_name}</div>
                  {c.hero.subtitle && <div className="text-sm opacity-80 mt-1">{c.hero.subtitle}</div>}
                  {c.contact.phone && (
                    <div className="mt-3 inline-block px-4 py-1.5 bg-white/20 backdrop-blur rounded-lg text-xs font-medium">
                      📞 {c.contact.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* About */}
              {c.about.text && (
                <div className="p-4">
                  <div className="text-xs font-bold mb-2" style={{ color: c.theme.color }}>소개</div>
                  <div className="text-[11px] leading-relaxed text-[#56565A] whitespace-pre-wrap">{c.about.text}</div>
                </div>
              )}

              {/* Services */}
              {c.services.some(s => s.name) && (
                <div className="px-4 pb-4">
                  <div className="text-xs font-bold mb-2" style={{ color: c.theme.color }}>
                    {site.template === "restaurant" ? "메뉴" : "서비스"}
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    {c.services.filter(s => s.name).map((svc, i) => (
                      <div key={i} className="flex justify-between items-center px-3 py-2.5" style={{ borderBottom: i < c.services.filter(s => s.name).length - 1 ? "1px solid #F0F0F0" : "none" }}>
                        <div>
                          <div className="text-[12px] font-semibold text-[#1D1D1F]">{svc.name}</div>
                          {svc.description && <div className="text-[10px] text-[#86868B]">{svc.description}</div>}
                        </div>
                        {svc.price && <div className="text-[12px] font-bold ml-2" style={{ color: c.theme.color }}>₩{svc.price}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hours */}
              {Object.values(c.hours).some(v => v) && (
                <div className="px-4 pb-4">
                  <div className="text-xs font-bold mb-2" style={{ color: c.theme.color }}>영업시간</div>
                  <div className="rounded-xl overflow-hidden" style={{ background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    {Object.entries(DAY_LABELS).map(([key, label]) => (
                      c.hours[key] ? (
                        <div key={key} className="flex justify-between px-3 py-2" style={{ borderBottom: "1px solid #F5F5F5", fontSize: 11 }}>
                          <span className="font-medium text-[#1D1D1F]">{label}요일</span>
                          <span style={{ color: c.hours[key] === "휴무" ? "#FF3B30" : "#86868B" }}>{c.hours[key]}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              {(c.contact.phone || c.contact.address || c.contact.email) && (
                <div className="px-4 pb-4">
                  <div className="text-xs font-bold mb-2" style={{ color: c.theme.color }}>연락처</div>
                  <div className="rounded-xl p-3 space-y-1.5" style={{ background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    {c.contact.phone && <div className="text-[11px]">📞 {c.contact.phone}</div>}
                    {c.contact.email && <div className="text-[11px]">📧 {c.contact.email}</div>}
                    {c.contact.address && <div className="text-[11px]">📍 {c.contact.address}</div>}
                    {c.contact.kakao && <div className="text-[11px]">💬 카카오톡: {c.contact.kakao}</div>}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="py-3 text-center text-[9px] text-[#AEAEB2]" style={{ borderTop: "1px solid #F0F0F0" }}>
                Powered by <span style={{ color: c.theme.color }}>일프로AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════
// HELPERS
// ══════════════════════════════
async function saveSite(site: Website) {
  await supabase.from("websites").update({ content: site.content, status: site.status, updated_at: new Date().toISOString() }).eq("id", site.id);
}

async function deleteSite(id: number) {
  await supabase.from("websites").delete().eq("id", id);
}

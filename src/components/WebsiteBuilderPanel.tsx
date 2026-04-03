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

interface ChatMessage {
  role: "system" | "user";
  text: string;
  action?: string;
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
  { id: "restaurant", name: "음식점/카페", icon: "🍽️" },
  { id: "service", name: "서비스/뷰티", icon: "💇" },
  { id: "retail", name: "매장/쇼핑", icon: "🛍️" },
  { id: "office", name: "사무실/B2B", icon: "🏢" },
];

const COLORS = ["#0071E3", "#FF6B35", "#30D158", "#5856D6", "#FF2D55", "#FF9500", "#000000", "#E53935"];
const DAY_LABELS: Record<string, string> = { mon: "월", tue: "화", wed: "수", thu: "목", fri: "금", sat: "토", sun: "일" };

const SUBTITLES: Record<string, string> = {
  restaurant: "맛있는 음식과 따뜻한 분위기",
  service: "최고의 서비스를 제공합니다",
  retail: "좋은 상품을 합리적인 가격에",
  office: "신뢰할 수 있는 비즈니스 파트너",
};

// ══════════════════════════════
// MAIN — starts in LLM chat UI immediately
// ══════════════════════════════
export default function WebsiteBuilderPanel({ userId, plan }: { userId: string; plan: string; openModal?: any; closeModal?: any }) {
  const isPro = plan === "pro" || plan === "team";

  // Site state
  const [site, setSite] = useState<Website | null>(null);
  const [c, setC] = useState<WebsiteContent>(EMPTY_CONTENT);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("draft");
  const [mobileView, setMobileView] = useState<"chat" | "preview">("chat");
  const [loaded, setLoaded] = useState(false);

  // Chat state
  const [step, setStep] = useState<"template" | "name" | "slug" | "edit">("template");
  const [template, setTemplate] = useState("");
  const [bizName, setBizName] = useState("");
  const [slug, setSlug] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", text: "안녕하세요! AI 홈페이지 빌더입니다.\n어떤 업종의 사이트를 만들까요?", action: "template" },
  ]);
  const [input, setInput] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load existing site
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("websites").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1);
      if (data && data.length > 0) {
        const s = data[0] as Website;
        setSite(s);
        setC(s.content || EMPTY_CONTENT);
        setStatus(s.status);
        setTemplate(s.template);
        setBizName(s.business_name);
        setSlug(s.slug);
        setStep("edit");
        setMessages([
          { role: "system", text: `"${s.business_name}" 사이트를 불러왔어요!\n어떤 항목을 수정할까요?`, action: "sections" },
        ]);
      }
      setLoaded(true);
    })();
  }, [userId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sections = [
    { id: "hero", icon: "🎯", label: "메인 타이틀" },
    { id: "about", icon: "📖", label: "소개글" },
    { id: "services", icon: "📋", label: template === "restaurant" ? "메뉴" : "서비스" },
    { id: "hours", icon: "🕐", label: "영업시간" },
    { id: "contact", icon: "📞", label: "연락처" },
    { id: "theme", icon: "🎨", label: "브랜드 컬러" },
  ];

  // ── Template selection ──
  function pickTemplate(id: string) {
    setTemplate(id);
    const t = TEMPLATES.find(t => t.id === id);
    setMessages(prev => [
      ...prev,
      { role: "user", text: `${t?.icon} ${t?.name}` },
      { role: "system", text: "좋아요! 가게(회사) 이름을 입력해주세요.", action: "name-input" },
    ]);
    setStep("name");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // ── Name → Slug ──
  function submitName() {
    if (!input.trim()) return;
    const name = input.trim();
    setBizName(name);
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 30);
    setSlug(autoSlug);
    setMessages(prev => [
      ...prev,
      { role: "user", text: name },
      { role: "system", text: `사이트 주소를 정해주세요.\n자동 생성: ${autoSlug}.ilpro.ai\n\n이대로 괜찮으면 "확인"을, 변경하려면 원하는 주소를 입력하세요.`, action: "slug-input" },
    ]);
    setInput("");
    setStep("slug");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // ── Slug → Create site ──
  async function submitSlug() {
    const text = input.trim();
    const finalSlug = text === "확인" || text === "" ? slug : text.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (finalSlug.length < 2) {
      setMessages(prev => [...prev, { role: "system", text: "주소는 2자 이상이어야 해요. 다시 입력해주세요." }]);
      return;
    }

    // Check duplicate
    const { data: existing } = await supabase.from("websites").select("id").eq("slug", finalSlug).maybeSingle();
    if (existing) {
      setMessages(prev => [...prev, { role: "system", text: `"${finalSlug}.ilpro.ai"는 이미 사용 중이에요. 다른 주소를 입력해주세요.` }]);
      return;
    }

    setSlug(finalSlug);
    setMessages(prev => [...prev, { role: "user", text: `${finalSlug}.ilpro.ai` }]);
    setInput("");

    // Create site in DB
    const content = { ...EMPTY_CONTENT, hero: { ...EMPTY_CONTENT.hero, title: bizName, subtitle: SUBTITLES[template] || "" } };
    const { data, error } = await supabase.from("websites").insert({
      user_id: userId, slug: finalSlug, business_name: bizName, template, status: "draft", content,
    }).select().single();

    if (error) {
      setMessages(prev => [...prev, { role: "system", text: "오류가 발생했어요: " + error.message }]);
      return;
    }

    const newSite = data as Website;
    setSite(newSite);
    setC(content);
    setStep("edit");
    setMessages(prev => [
      ...prev,
      { role: "system", text: `"${bizName}" 사이트가 생성됐어요! 🎉\n${finalSlug}.ilpro.ai\n\n이제 내용을 채워볼까요? 아래에서 항목을 선택하세요.`, action: "sections" },
    ]);
  }

  // ── Section editing ──
  function handleSectionClick(sectionId: string) {
    setActiveSection(sectionId);
    const hints: Record<string, string> = {
      hero: `메인 타이틀을 입력하세요.\n예: "맛있는한식당" / "정성을 담은 한 끼"\n\n제목과 부제를 / 로 구분하거나 두 줄로 입력하세요.`,
      about: `가게 소개를 자유롭게 작성해주세요.\n예: "20년 전통의 한식 전문점입니다. 매일 새벽 시장에서 직접 재료를 골라옵니다."`,
      services: `${template === "restaurant" ? "메뉴" : "서비스"}를 입력하세요. 한 줄에 하나씩:\n예:\n갈비탕 - 한우 갈비 - 15,000\n된장찌개 - 집된장 - 9,000`,
      hours: `영업시간을 입력하세요.\n예:\n월~금 09:00-21:00\n토 10:00-18:00\n일 휴무`,
      contact: `연락처를 입력하세요.\n예:\n전화: 052-123-4567\n주소: 울산 남구 삼산동 123\n이메일: info@example.com`,
      theme: "아래에서 브랜드 컬러를 선택하세요.",
    };
    setMessages(prev => [...prev, { role: "system", text: hints[sectionId] || "", action: sectionId === "theme" ? "colors" : undefined }]);
    setTimeout(() => inputRef.current?.focus(), 100);
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
      case "about":
        updated.about = { ...updated.about, text: text.trim() };
        break;
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

  // ── Send message ──
  function handleSend() {
    if (!input.trim()) return;
    const text = input.trim();

    if (step === "name") { submitName(); return; }
    if (step === "slug") { submitSlug(); return; }

    // Edit mode
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");

    if (activeSection) {
      parseAndApply(text);
      setMessages(prev => [...prev, { role: "system", text: "적용했어요! 미리보기를 확인하세요.\n다른 항목을 수정할까요?", action: "sections" }]);
      setActiveSection(null);
    } else {
      const lower = text.toLowerCase();
      if (lower.match(/제목|타이틀|이름|메인/)) handleSectionClick("hero");
      else if (lower.match(/소개|설명|about/)) handleSectionClick("about");
      else if (lower.match(/메뉴|서비스|가격|목록/)) handleSectionClick("services");
      else if (lower.match(/시간|영업|오픈/)) handleSectionClick("hours");
      else if (lower.match(/연락|전화|주소|이메일/)) handleSectionClick("contact");
      else if (lower.match(/색|컬러|디자인|테마/)) handleSectionClick("theme");
      else setMessages(prev => [...prev, { role: "system", text: "아래 버튼에서 수정할 항목을 선택해주세요.", action: "sections" }]);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function save(publish?: boolean) {
    if (!site) return;
    setSaving(true);
    const newStatus = publish !== undefined ? (publish ? "published" : "draft") : status;
    await supabase.from("websites").update({ content: c, status: newStatus, updated_at: new Date().toISOString() }).eq("id", site.id);
    setStatus(newStatus);
    setSaving(false);
  }

  async function deleteSite() {
    if (!site || !confirm("이 사이트를 삭제하시겠습니까?")) return;
    await supabase.from("websites").delete().eq("id", site.id);
    setSite(null);
    setC(EMPTY_CONTENT);
    setStep("template");
    setTemplate("");
    setBizName("");
    setSlug("");
    setMessages([{ role: "system", text: "사이트가 삭제됐어요.\n새로 만들까요? 업종을 선택해주세요.", action: "template" }]);
  }

  if (!loaded) return <div className="flex items-center justify-center h-[50vh]"><div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" /></div>;

  // ══════════════════════════════
  // RENDER — full-screen split pane
  // ══════════════════════════════
  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col" style={{ marginLeft: -20, marginRight: -20, marginTop: -20 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold" style={{ color: "#7D2AE7" }}>AI 홈페이지</div>
          {site && <span className="text-xs text-[var(--text-muted)]">{slug}.ilpro.ai</span>}
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile toggle */}
          <div className="flex md:hidden rounded-lg overflow-hidden border border-[var(--border)]">
            <button onClick={() => setMobileView("chat")} className="px-3 py-1.5 text-xs font-medium"
              style={{ background: mobileView === "chat" ? "var(--primary)" : "transparent", color: mobileView === "chat" ? "white" : "var(--text-secondary)" }}>채팅</button>
            <button onClick={() => setMobileView("preview")} className="px-3 py-1.5 text-xs font-medium"
              style={{ background: mobileView === "preview" ? "var(--primary)" : "transparent", color: mobileView === "preview" ? "white" : "var(--text-secondary)" }}>미리보기</button>
          </div>
          {site && (
            <>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${status === "published" ? "bg-[#30D15820] text-[#30D158]" : "bg-[var(--bg-hover)] text-[var(--text-muted)]"}`}>
                {status === "published" ? "게시됨" : "초안"}
              </span>
              {status === "published" ? (
                <button onClick={() => save(false)} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)]">비공개</button>
              ) : isPro ? (
                <button onClick={() => save(true)} className="px-3 py-1.5 text-xs rounded-lg bg-[#30D158] text-white font-medium">게시</button>
              ) : (
                <button className="px-3 py-1.5 text-xs rounded-lg text-white font-medium" style={{ background: "linear-gradient(135deg, #7D2AE7, #0071E3)" }}
                  onClick={() => alert("PRO 플랜으로 업그레이드하면 사이트를 게시할 수 있습니다.\n₩29,900/월")}>🔒 게시</button>
              )}
              <button onClick={() => save()} disabled={saving} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white font-medium">
                {saving ? "..." : "저장"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT — Chat */}
        <div className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-col w-full md:w-1/2 lg:w-[45%]`} style={{ borderRight: "1px solid var(--border)", background: "var(--bg)" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === "system" ? (
                  <div>
                    <div className="inline-block max-w-[90%] rounded-2xl rounded-tl-md px-4 py-2.5 text-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <div className="whitespace-pre-wrap" style={{ color: "var(--text)" }}>{msg.text}</div>
                    </div>
                    {/* Template picker */}
                    {msg.action === "template" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {TEMPLATES.map(t => (
                          <button key={t.id} onClick={() => pickTemplate(t.id)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium active:scale-[0.97] transition-all"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}>
                            <span className="text-xl">{t.icon}</span> {t.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Section picker */}
                    {msg.action === "sections" && (
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
                    {/* Color picker */}
                    {msg.action === "colors" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {COLORS.map(color => (
                          <button key={color} onClick={() => {
                            setC(prev => ({ ...prev, theme: { ...prev.theme, color } }));
                            setMessages(prev => [...prev, { role: "user", text: `컬러: ${color}` }, { role: "system", text: "적용했어요! 다른 항목을 수정할까요?", action: "sections" }]);
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
                    <div className="inline-block max-w-[85%] rounded-2xl rounded-tr-md px-4 py-2.5 text-sm text-white" style={{ background: "#7D2AE7" }}>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 p-3" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}>
            {activeSection && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(125,42,231,0.1)", color: "#7D2AE7" }}>
                  {sections.find(s => s.id === activeSection)?.icon} {sections.find(s => s.id === activeSection)?.label} 수정 중
                </span>
                <button onClick={() => { setActiveSection(null); setMessages(prev => [...prev, { role: "system", text: "취소했어요.", action: "sections" }]); }}
                  className="text-[11px] text-[var(--text-muted)]">취소</button>
              </div>
            )}
            {(step !== "template") && (
              <div className="flex gap-2 items-end">
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={step === "name" ? "가게 이름을 입력하세요" : step === "slug" ? "확인 또는 원하는 주소 입력" : activeSection ? "내용을 입력하세요..." : "수정할 항목을 선택하거나 입력하세요"}
                  className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none min-h-[44px] max-h-[120px]"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                  rows={1} />
                <button onClick={handleSend}
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white active:scale-95"
                  style={{ background: input.trim() ? "#7D2AE7" : "var(--border)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                </button>
              </div>
            )}
          </div>

          {/* Delete */}
          {site && (
            <div className="shrink-0 px-4 py-2 text-center" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={deleteSite} className="text-xs text-[var(--danger)]">사이트 삭제</button>
            </div>
          )}
        </div>

        {/* RIGHT — Live preview */}
        <div className={`${mobileView === "preview" ? "flex" : "hidden"} md:flex flex-col flex-1 items-center overflow-y-auto`} style={{ background: "var(--bg-hover)" }}>
          <div className="py-4 px-4 w-full max-w-[420px]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 rounded-t-xl px-3 py-2" style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 text-center text-[11px] text-[var(--text-muted)] bg-[var(--bg)] rounded-md py-1 px-2">
                {slug || "my-store"}.ilpro.ai
              </div>
            </div>

            {/* Site preview */}
            <div className="rounded-b-xl overflow-hidden shadow-lg" style={{ background: "#FAFAFA" }}>
              {/* Hero */}
              <div className="relative" style={{ background: c.theme.color, minHeight: 160 }}>
                {c.hero.image && <img src={c.hero.image} alt="" className="w-full h-40 object-cover opacity-50" />}
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                  <div className="text-xl font-bold leading-tight">{c.hero.title || bizName || "가게 이름"}</div>
                  {(c.hero.subtitle || SUBTITLES[template]) && <div className="text-sm opacity-80 mt-1">{c.hero.subtitle || SUBTITLES[template]}</div>}
                  {c.contact.phone && <div className="mt-3 inline-block px-4 py-1.5 bg-white/20 backdrop-blur rounded-lg text-xs font-medium">📞 {c.contact.phone}</div>}
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
                  <div className="text-xs font-bold mb-2" style={{ color: c.theme.color }}>{template === "restaurant" ? "메뉴" : "서비스"}</div>
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

              {/* Empty state */}
              {!c.about.text && !c.services.some(s => s.name) && !c.contact.phone && (
                <div className="p-8 text-center text-[#AEAEB2] text-xs">
                  왼쪽 채팅에서 내용을 입력하면<br/>여기에 실시간으로 반영됩니다
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

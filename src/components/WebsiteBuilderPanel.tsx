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
  hours: { mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "" },
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
      try {
        const { data, error } = await supabase.from("websites").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1);
        if (!error && data && data.length > 0) {
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
      } catch (e) {
        // Table might not exist yet — continue with fresh state
      }
      setLoaded(true);
    })();
  }, [userId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sections = [
    { id: "hero", icon: "🎯", label: "메인 타이틀" },
    { id: "about", icon: "📖", label: "소개글" },
    { id: "services", icon: "📋", label: template === "restaurant" ? "메뉴" : "서비스" },
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
    <div className="flex flex-col overflow-hidden h-full">
      {/* Split pane — no top bar, cleaner */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT — Chat (narrow panel) */}
        <div className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-col w-full md:w-[380px] lg:w-[420px] shrink-0`}
          style={{ background: "#0D0D12" }}>
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#7D2AE7" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              </div>
              <span className="text-[12px] font-semibold text-white/80">AI 홈페이지</span>
              {site && <span className="text-[10px] text-white/30">{slug}.ilpro.ai</span>}
            </div>
            <div className="flex items-center gap-1.5">
              {/* Mobile toggle */}
              <button onClick={() => setMobileView(mobileView === "chat" ? "preview" : "chat")}
                className="md:hidden text-[10px] px-2 py-1 rounded-md text-white/50" style={{ background: "rgba(255,255,255,0.06)" }}>
                {mobileView === "chat" ? "미리보기" : "채팅"}
              </button>
              {site && (
                <>
                  {status === "published" ? (
                    <button onClick={() => save(false)} className="text-[10px] px-2 py-1 rounded-md text-white/50" style={{ background: "rgba(255,255,255,0.06)" }}>비공개</button>
                  ) : isPro ? (
                    <button onClick={() => save(true)} className="text-[10px] px-2 py-1 rounded-md text-white font-medium" style={{ background: "#30D158" }}>게시</button>
                  ) : (
                    <button className="text-[10px] px-2 py-1 rounded-md text-white font-medium" style={{ background: "#7D2AE7" }}
                      onClick={() => alert("PRO 플랜으로 업그레이드하면 사이트를 게시할 수 있습니다.\n₩29,900/월")}>PRO</button>
                  )}
                  <button onClick={() => save()} disabled={saving} className="text-[10px] px-2 py-1 rounded-md text-white/70" style={{ background: "rgba(255,255,255,0.08)" }}>
                    {saving ? "..." : "저장"}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ scrollbarWidth: "none" }}>
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === "system" ? (
                  <div>
                    <div className="inline-block max-w-[95%] rounded-2xl rounded-tl-md px-3 py-2 text-[12px] leading-relaxed"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                    {/* Template picker */}
                    {msg.action === "template" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {TEMPLATES.map(t => (
                          <button key={t.id} onClick={() => pickTemplate(t.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium active:scale-[0.97] transition-all"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}>
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
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-medium active:scale-[0.97] transition-all"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
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
                            className="w-7 h-7 rounded-full border-2 transition-all active:scale-90"
                            style={{ background: color, borderColor: c.theme.color === color ? "white" : "transparent", transform: c.theme.color === color ? "scale(1.15)" : "scale(1)" }} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="inline-block max-w-[90%] rounded-2xl rounded-tr-md px-3 py-2 text-[12px] text-white" style={{ background: "#7D2AE7" }}>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 p-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {activeSection && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(125,42,231,0.15)", color: "#A78BFA" }}>
                  {sections.find(s => s.id === activeSection)?.icon} {sections.find(s => s.id === activeSection)?.label}
                </span>
                <button onClick={() => { setActiveSection(null); setMessages(prev => [...prev, { role: "system", text: "취소했어요.", action: "sections" }]); }}
                  className="text-[10px] text-white/30">취소</button>
              </div>
            )}
            {(step !== "template") && (
              <div className="flex gap-1.5 items-end">
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={step === "name" ? "가게 이름" : step === "slug" ? "확인 또는 주소 입력" : activeSection ? "내용 입력..." : "항목을 선택하세요"}
                  className="flex-1 resize-none rounded-lg px-3 py-2 text-[12px] outline-none min-h-[38px] max-h-[100px] text-white/80 placeholder-white/20"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  rows={1} />
                <button onClick={handleSend}
                  className="shrink-0 w-[38px] h-[38px] rounded-lg flex items-center justify-center text-white active:scale-95"
                  style={{ background: input.trim() ? "#7D2AE7" : "rgba(255,255,255,0.06)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          {site && (
            <div className="shrink-0 px-3 py-2 flex justify-center gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <button onClick={() => {
                if (!confirm("모든 내용을 초기화하시겠습니까?")) return;
                const fresh = { ...EMPTY_CONTENT, hero: { ...EMPTY_CONTENT.hero, title: bizName, subtitle: SUBTITLES[template] || "" } };
                setC(fresh);
                setMessages(prev => [...prev, { role: "system", text: "초기화했어요!", action: "sections" }]);
                setActiveSection(null);
              }} className="text-[10px] text-white/25 hover:text-white/50 transition-colors">초기화</button>
              <button onClick={deleteSite} className="text-[10px] text-[#FF453A]/60 hover:text-[#FF453A] transition-colors">삭제</button>
            </div>
          )}
        </div>

        {/* RIGHT — Live preview */}
        {(() => {
          const hasContent = c.hero.title || c.about.text || c.services.some(s => s.name) || c.contact.phone;
          return (
            <div className={`${mobileView === "preview" ? "flex" : "hidden"} md:flex flex-col flex-1 overflow-hidden relative`}>
              {!hasContent ? (
                /* ═══ OCEAN SCENE — inspirational empty state ═══ */
                <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
                  style={{ background: "linear-gradient(180deg, #0A1628 0%, #0E2A47 30%, #1A5276 55%, #2E86AB 75%, #48B1BF 90%, #A8E6CF 100%)" }}>
                  {/* Stars */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                      <div key={i} className="absolute rounded-full bg-white" style={{
                        width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
                        top: `${Math.random() * 40}%`, left: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.6 + 0.2,
                      }} />
                    ))}
                  </div>
                  {/* Moon glow */}
                  <div className="absolute top-[12%] right-[20%] w-16 h-16 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)" }} />
                  <div className="absolute top-[14%] right-[22%] w-8 h-8 rounded-full"
                    style={{ background: "rgba(255,255,255,0.08)" }} />
                  {/* Waves */}
                  <div className="absolute bottom-0 left-0 right-0" style={{ height: "45%" }}>
                    <svg viewBox="0 0 1440 320" className="absolute bottom-[120px] left-0 w-[200%] opacity-20"
                      style={{ animation: "waveMove 8s ease-in-out infinite" }}>
                      <path fill="#48B1BF" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,165.3C1248,171,1344,213,1392,234.7L1440,256L1440,320L0,320Z" />
                    </svg>
                    <svg viewBox="0 0 1440 320" className="absolute bottom-[80px] left-0 w-[200%] opacity-30"
                      style={{ animation: "waveMove 6s ease-in-out infinite reverse" }}>
                      <path fill="#2E86AB" d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z" />
                    </svg>
                    <svg viewBox="0 0 1440 320" className="absolute bottom-[30px] left-0 w-[200%] opacity-40"
                      style={{ animation: "waveMove 7s ease-in-out infinite" }}>
                      <path fill="#1A5276" d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,250.7C672,267,768,277,864,266.7C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L0,320Z" />
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 h-[40px]" style={{ background: "#0E2236" }} />
                  </div>
                  {/* Text */}
                  <div className="relative z-10 text-center px-8 -mt-16">
                    <div className="text-[32px] font-extrabold text-white leading-tight tracking-tight mb-4"
                      style={{ textShadow: "0 4px 30px rgba(0,0,0,0.4)" }}>
                      당신의 상상력을<br/>펼쳐 보세요
                    </div>
                    <div className="text-[14px] text-white/40 leading-relaxed">
                      왼쪽에서 업종을 선택하고<br/>대화를 시작하면 사이트가 만들어집니다
                    </div>
                    <div className="mt-8 flex justify-center gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.3)", animation: `waveDot 1.5s ease-in-out ${i * 0.3}s infinite` }} />
                      ))}
                    </div>
                  </div>
                  <style>{`
                    @keyframes waveMove { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-25%); } }
                    @keyframes waveDot { 0%,100% { opacity: 0.3; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-4px); } }
                  `}</style>
                </div>
              ) : (
                /* ═══ SITE PREVIEW — shows when content exists ═══ */
                <div className="flex-1 flex flex-col items-center overflow-y-auto"
                  style={{ background: "linear-gradient(160deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%)" }}>
                  <div className="py-6 px-6 w-full max-w-[560px]">
                    {/* Browser chrome */}
                    <div className="flex items-center gap-2 rounded-t-2xl px-4 py-2.5"
                      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                        <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                      </div>
                      <div className="flex-1 text-center text-[11px] text-white/40 rounded-lg py-1 px-3"
                        style={{ background: "rgba(255,255,255,0.06)" }}>
                        {slug}.ilpro.ai
                      </div>
                    </div>

                    <div className="rounded-b-2xl overflow-hidden" style={{ background: "#0A0A0F", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
                      {/* Hero */}
                      <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
                        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${c.theme.color}CC 0%, ${c.theme.color}44 50%, #0A0A0F 100%)` }} />
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30" style={{ background: c.theme.color, filter: "blur(60px)" }} />
                        <div className="absolute bottom-0 -left-10 w-32 h-32 rounded-full opacity-20" style={{ background: "#A78BFA", filter: "blur(50px)" }} />
                        {c.hero.image && <img src={c.hero.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity" />}
                        <div className="relative px-6 pt-12 pb-8">
                          <div className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: c.theme.color }}>
                            {TEMPLATES.find(t => t.id === template)?.name || "WEBSITE"}
                          </div>
                          <div className="text-[26px] font-extrabold text-white leading-tight tracking-tight">{c.hero.title || bizName}</div>
                          {c.hero.subtitle && <div className="text-[13px] text-white/50 mt-2 leading-relaxed">{c.hero.subtitle}</div>}
                          <div className="flex gap-2 mt-5">
                            <div className="px-5 py-2 rounded-full text-[11px] font-semibold text-white" style={{ background: c.theme.color }}>
                              {c.contact.phone ? `📞 ${c.contact.phone}` : "연락하기"}
                            </div>
                            <div className="px-5 py-2 rounded-full text-[11px] font-semibold text-white/70"
                              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>더 알아보기</div>
                          </div>
                        </div>
                      </div>

                      {/* About */}
                      {c.about.text && (
                        <div className="px-5 py-5">
                          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: c.theme.color }}>소개</div>
                            <div className="text-[12px] leading-[1.8] text-white/60 whitespace-pre-wrap">{c.about.text}</div>
                          </div>
                        </div>
                      )}

                      {/* Services */}
                      {c.services.some(s => s.name) && (
                        <div className="px-5 pb-5">
                          <div className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: c.theme.color }}>
                            {template === "restaurant" ? "MENU" : "SERVICES"}
                          </div>
                          <div className="space-y-2">
                            {c.services.filter(s => s.name).map((svc, i) => (
                              <div key={i} className="flex justify-between items-center px-4 py-3 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold"
                                    style={{ background: `${c.theme.color}15`, color: c.theme.color }}>{String(i + 1).padStart(2, "0")}</div>
                                  <div>
                                    <div className="text-[12px] font-semibold text-white/90">{svc.name}</div>
                                    {svc.description && <div className="text-[10px] text-white/35 mt-0.5">{svc.description}</div>}
                                  </div>
                                </div>
                                {svc.price && <div className="text-[13px] font-bold ml-3 shrink-0" style={{ color: c.theme.color }}>₩{svc.price}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact */}
                      {(c.contact.phone || c.contact.address || c.contact.email) && (
                        <div className="px-5 pb-5">
                          <div className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: c.theme.color }}>CONTACT</div>
                          <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            {c.contact.phone && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.theme.color}15` }}><span className="text-[13px]">📞</span></div><div className="text-[12px] text-white/70">{c.contact.phone}</div></div>}
                            {c.contact.email && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.theme.color}15` }}><span className="text-[13px]">📧</span></div><div className="text-[12px] text-white/70">{c.contact.email}</div></div>}
                            {c.contact.address && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.theme.color}15` }}><span className="text-[13px]">📍</span></div><div className="text-[12px] text-white/70">{c.contact.address}</div></div>}
                            {c.contact.kakao && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.theme.color}15` }}><span className="text-[13px]">💬</span></div><div className="text-[12px] text-white/70">카카오톡: {c.contact.kakao}</div></div>}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="py-4 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="text-[9px] text-white/15">Powered by <span style={{ color: `${c.theme.color}88` }}>일프로AI</span></div>
                      </div>
                    </div>
                    <div className="h-8 mx-8 rounded-b-3xl opacity-30" style={{ background: `linear-gradient(to bottom, ${c.theme.color}15, transparent)`, filter: "blur(8px)" }} />
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

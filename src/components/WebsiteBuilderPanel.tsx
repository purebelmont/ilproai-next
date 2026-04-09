"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Website {
  id: number; user_id: string; slug: string; business_name: string;
  template: string; status: string; content: WebsiteContent;
  created_at: string; updated_at: string;
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

interface ChatMessage { role: "system" | "user"; text: string; action?: string }

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
  { id: "medical", name: "병원/의원", icon: "🏥" },
  { id: "education", name: "학원/교육", icon: "📚" },
  { id: "fitness", name: "헬스/스포츠", icon: "💪" },
  { id: "lodging", name: "숙박/펜션", icon: "🏨" },
  { id: "repair", name: "수리/정비", icon: "🔧" },
  { id: "legal", name: "법률/세무", icon: "⚖️" },
  { id: "realestate", name: "부동산", icon: "🏠" },
  { id: "pet", name: "반려동물", icon: "🐾" },
  { id: "wedding", name: "웨딩/이벤트", icon: "💐" },
  { id: "manufacturing", name: "제조/공장", icon: "🏭" },
  { id: "logistics", name: "물류/운송", icon: "🚚" },
  { id: "freelance", name: "프리랜서", icon: "💻" },
];

const COLORS = ["#0071E3", "#FF6B35", "#30D158", "#5856D6", "#FF2D55", "#FF9500", "#000000", "#E53935", "#7D2AE7", "#00B4D8", "#2D6A4F", "#E85D04"];

type Step = "template" | "name" | "description" | "contact" | "generating" | "edit";

export default function WebsiteBuilderPanel({ userId, plan }: { userId: string; plan: string }) {
  const isPro = plan === "pro" || plan === "team";
  const [site, setSite] = useState<Website | null>(null);
  const [c, setC] = useState<WebsiteContent>(EMPTY_CONTENT);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("draft");
  const [mobileView, setMobileView] = useState<"chat" | "preview">("chat");
  const [loaded, setLoaded] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState("");

  const [step, setStep] = useState<Step>("template");
  const [template, setTemplate] = useState("");
  const [bizName, setBizName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", text: "안녕하세요! AI 홈페이지 빌더입니다.\n몇 가지 질문에 답하시면 완성된 웹사이트를 만들어 드릴게요.\n\n어떤 업종인가요?", action: "template" },
  ]);
  const [input, setInput] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sections = [
    { id: "hero", icon: "🎯", label: "메인 타이틀" },
    { id: "about", icon: "📖", label: "소개글" },
    { id: "services", icon: "📋", label: template === "restaurant" ? "메뉴" : "서비스" },
    { id: "contact", icon: "📞", label: "연락처" },
    { id: "theme", icon: "🎨", label: "브랜드 컬러" },
  ];

  // Load existing site
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("websites").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1);
        if (!error && data && data.length > 0) {
          const s = data[0] as Website;
          setSite(s); setC(s.content || EMPTY_CONTENT); setStatus(s.status);
          setTemplate(s.template); setBizName(s.business_name); setSlug(s.slug);
          if ((s.content as any)?.html) setGeneratedHtml((s.content as any).html);
          setStep("edit");
          setMessages([
            { role: "system", text: `"${s.business_name}" 사이트를 불러왔어요!\n수정할 항목을 선택하거나, 자유롭게 입력하세요.`, action: "sections" },
          ]);
        }
      } catch {}
      setLoaded(true);
    })();
  }, [userId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ═══ STEP HANDLERS ═══

  function pickTemplate(id: string) {
    setTemplate(id);
    const t = TEMPLATES.find(t => t.id === id);
    setMessages(prev => [
      ...prev,
      { role: "user", text: `${t?.icon} ${t?.name}` },
      { role: "system", text: "가게(회사) 이름이 뭔가요?" },
    ]);
    setStep("name");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function submitName() {
    const name = input.trim();
    if (!name) return;
    setBizName(name);
    setMessages(prev => [
      ...prev,
      { role: "user", text: name },
      { role: "system", text: "어떤 곳인지 한 줄로 설명해 주세요.\n예: \"20년 전통 한식당\", \"울산 최고의 네일샵\"" },
    ]);
    setInput("");
    setStep("description");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function submitDescription() {
    const desc = input.trim();
    if (!desc) return;
    setDescription(desc);
    setMessages(prev => [
      ...prev,
      { role: "user", text: desc },
      { role: "system", text: "연락처를 알려주세요.\n전화번호, 주소, 이메일 등 아는 만큼 입력하시면 돼요.\n\n예: 052-123-4567, 울산 남구 삼산동 123" },
    ]);
    setInput("");
    setStep("contact");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function submitContact() {
    const contact = input.trim();
    setContactInfo(contact);
    setMessages(prev => [...prev, { role: "user", text: contact || "(건너뛰기)" }]);
    setInput("");

    // Generate slug
    const autoSlug = bizName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 30) || "my-site";
    setSlug(autoSlug);

    // Show generating state
    setStep("generating");
    setMessages(prev => [...prev, { role: "system", text: "AI가 웹사이트를 만들고 있어요... ✨", action: "loading" }]);

    // Call AI API — generates full HTML website
    try {
      const res = await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, bizName, description, contact, features: "" }),
      });
      const { html, source } = await res.json();

      setGeneratedHtml(html);

      // Store HTML in content for DB
      const contentWithHtml = { ...EMPTY_CONTENT, html, hero: { title: bizName, subtitle: description, image: "" } };
      setC(contentWithHtml as any);

      // Save to DB
      const { data: existing } = await supabase.from("websites").select("id").eq("slug", autoSlug).maybeSingle();
      const finalSlug = existing ? autoSlug + Math.floor(Math.random() * 100) : autoSlug;
      setSlug(finalSlug);

      const { data, error } = await supabase.from("websites").insert({
        user_id: userId, slug: finalSlug, business_name: bizName, template, status: "draft", content: contentWithHtml,
      }).select().single();

      if (error) {
        setMessages(prev => [...prev, { role: "system", text: "저장 중 오류: " + error.message }]);
        setStep("edit");
        return;
      }

      setSite(data as Website);
      setStep("edit");
      setMobileView("preview");
      setMessages(prev => [
        ...prev.filter(m => m.action !== "loading"),
        { role: "system", text: `웹사이트가 완성됐어요! 🎉\n\n${source === "ai" ? "🧠 Claude AI가 디자인했습니다." : "📐 템플릿으로 생성했습니다."}\n📍 ${finalSlug}.contavelo.ai\n\n오른쪽 미리보기를 확인하세요.\n수정하려면 아래에서 요청하세요.`, action: "sections" },
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev.filter(m => m.action !== "loading"),
        { role: "system", text: "생성 중 오류가 발생했어요. 다시 시도해 주세요." },
      ]);
      setStep("contact");
    }
  }

  // ═══ EDIT MODE — section editing ═══

  function handleSectionClick(sectionId: string) {
    setActiveSection(sectionId);
    const hints: Record<string, string> = {
      hero: `메인 타이틀을 수정하세요.\n제목 / 부제목 형식으로 입력하세요.`,
      about: `소개글을 수정하세요. 자유롭게 작성하시면 됩니다.`,
      services: `${template === "restaurant" ? "메뉴" : "서비스"}를 수정하세요.\n이름 - 설명 - 가격 형식으로 한 줄에 하나씩.`,
      contact: `연락처를 수정하세요.\n전화, 주소, 이메일 등.`,
      theme: "브랜드 컬러를 선택하세요.",
    };
    setMessages(prev => [...prev, { role: "system", text: hints[sectionId] || "", action: sectionId === "theme" ? "colors" : undefined }]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function parseAndApply(text: string) {
    if (!activeSection) return;
    const updated = { ...c };
    switch (activeSection) {
      case "hero": {
        const parts = text.split(/[\/\|]/).map(s => s.trim());
        updated.hero = { ...updated.hero, title: parts[0] || updated.hero.title, subtitle: parts[1] || updated.hero.subtitle };
        break;
      }
      case "about": updated.about = { ...updated.about, text: text.trim() }; break;
      case "services": {
        const svcs = text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
          const p = line.split(/[-–—,]/).map(s => s.trim());
          return { name: p[0] || "", description: p[1] || "", price: p[2] || "" };
        }).filter(s => s.name);
        if (svcs.length) updated.services = svcs;
        break;
      }
      case "contact": {
        for (const line of text.split("\n").map(l => l.trim()).filter(Boolean)) {
          const val = line.replace(/^(전화|주소|이메일|카카오톡?|메일)[\s:：]+/i, "").trim();
          if (line.match(/\d{2,3}-\d{3,4}-\d{4}/)) updated.contact.phone = line.match(/\d{2,3}-\d{3,4}-\d{4}/)![0];
          else if (line.includes("@")) updated.contact.email = val;
          else if (line.toLowerCase().match(/^(전화|phone)/)) updated.contact.phone = val;
          else if (line.toLowerCase().match(/^(주소|address)/)) updated.contact.address = val;
          else if (line.toLowerCase().match(/^(이메일|email)/)) updated.contact.email = val;
          else if (line.length > 5) updated.contact.address = val;
        }
        break;
      }
    }
    setC(updated);
  }

  // ═══ SEND ═══

  function handleSend() {
    if (!input.trim()) return;
    const text = input.trim();

    if (step === "name") { submitName(); return; }
    if (step === "description") { submitDescription(); return; }
    if (step === "contact") { submitContact(); return; }

    // Edit mode
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");

    if (activeSection) {
      parseAndApply(text);
      setMessages(prev => [...prev, { role: "system", text: "수정했어요! 미리보기를 확인하세요.", action: "sections" }]);
      setActiveSection(null);
    } else {
      const lower = text.toLowerCase();
      if (lower.match(/제목|타이틀|이름|메인/)) handleSectionClick("hero");
      else if (lower.match(/소개|설명|about/)) handleSectionClick("about");
      else if (lower.match(/메뉴|서비스|가격|목록/)) handleSectionClick("services");
      else if (lower.match(/연락|전화|주소|이메일/)) handleSectionClick("contact");
      else if (lower.match(/색|컬러|디자인|테마/)) handleSectionClick("theme");
      else setMessages(prev => [...prev, { role: "system", text: "아래에서 수정할 항목을 선택해주세요.", action: "sections" }]);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function save(publish?: boolean) {
    if (!site) return;
    setSaving(true);
    const newStatus = publish !== undefined ? (publish ? "published" : "draft") : status;
    await supabase.from("websites").update({ content: c, status: newStatus, updated_at: new Date().toISOString() }).eq("id", site.id);
    setStatus(newStatus); setSaving(false);
  }

  async function deleteSite() {
    if (!site || !confirm("사이트를 삭제하시겠습니까?")) return;
    await supabase.from("websites").delete().eq("id", site.id);
    setSite(null); setC(EMPTY_CONTENT); setGeneratedHtml(""); setStep("template"); setTemplate(""); setBizName(""); setSlug("");
    setMessages([{ role: "system", text: "삭제했어요. 새로 만들까요?", action: "template" }]);
  }

  if (!loaded) return <div className="flex items-center justify-center h-full"><div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" /></div>;

  const hasContent = generatedHtml || c.hero.title || c.about.text || c.services.some(s => s.name) || c.contact.phone;

  // ═══ RENDER ═══
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div className="flex flex-1 min-h-0">
        {/* ═══ LEFT — Chat ═══ */}
        <div className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-col w-full md:w-[380px] lg:w-[420px] shrink-0`}
          style={{ background: "var(--bg-card)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#7D2AE7" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              </div>
              <span className="text-[12px] font-semibold" style={{ color: "var(--text)" }}>AI 홈페이지</span>
              {site && <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{slug}.ilpro.ai</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setMobileView(mobileView === "chat" ? "preview" : "chat")}
                className="md:hidden text-[10px] px-2 py-1 rounded-md" style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}>
                {mobileView === "chat" ? "미리보기" : "채팅"}
              </button>
              {site && (
                <>
                  {status !== "published" && isPro && (
                    <button onClick={() => save(true)} className="text-[10px] px-2 py-1 rounded-md text-white font-medium" style={{ background: "#30D158" }}>게시</button>
                  )}
                  <button onClick={() => save()} disabled={saving} className="text-[10px] px-2 py-1 rounded-md"
                    style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>{saving ? "..." : "저장"}</button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ scrollbarWidth: "none", background: "var(--bg)" }}>
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === "system" ? (
                  <div>
                    <div className="inline-block max-w-[95%] rounded-2xl rounded-tl-md px-3 py-2 text-[12px] leading-relaxed"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                    {msg.action === "template" && (
                      <div className="grid grid-cols-2 gap-1.5 mt-2">
                        {TEMPLATES.map(t => (
                          <button key={t.id} onClick={() => pickTemplate(t.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium active:scale-[0.97] transition-all"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}>
                            <span>{t.icon}</span> {t.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.action === "sections" && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {sections.map(s => (
                          <button key={s.id} onClick={() => handleSectionClick(s.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-medium active:scale-[0.97]"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                            <span>{s.icon}</span> {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.action === "colors" && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {COLORS.map(color => (
                          <button key={color} onClick={() => {
                            setC(prev => ({ ...prev, theme: { ...prev.theme, color } }));
                            setMessages(prev => [...prev, { role: "user", text: color }, { role: "system", text: "적용했어요!", action: "sections" }]);
                            setActiveSection(null);
                          }} className="w-7 h-7 rounded-full border-2 transition-all active:scale-90"
                            style={{ background: color, borderColor: c.theme.color === color ? "var(--text)" : "transparent" }} />
                        ))}
                      </div>
                    )}
                    {msg.action === "loading" && (
                      <div className="flex gap-1 mt-2">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full" style={{ background: "#7D2AE7", animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }} />
                        ))}
                        <style>{`@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }`}</style>
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
          <div className="shrink-0 p-2.5" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}>
            {activeSection && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                  {sections.find(s => s.id === activeSection)?.icon} {sections.find(s => s.id === activeSection)?.label}
                </span>
                <button onClick={() => { setActiveSection(null); setMessages(prev => [...prev, { role: "system", text: "취소했어요.", action: "sections" }]); }}
                  className="text-[10px]" style={{ color: "var(--text-muted)" }}>취소</button>
              </div>
            )}
            {step !== "template" && step !== "generating" && (
              <div className="flex gap-1.5 items-end">
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={step === "name" ? "이름을 입력하세요" : step === "description" ? "한 줄 소개" : step === "contact" ? "전화, 주소 등" : "자유롭게 입력하세요"}
                  className="flex-1 resize-none rounded-lg px-3 py-2 text-[12px] outline-none min-h-[38px] max-h-[100px]"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  rows={1} />
                <button onClick={handleSend}
                  className="shrink-0 w-[38px] h-[38px] rounded-lg flex items-center justify-center text-white active:scale-95"
                  style={{ background: input.trim() ? "#7D2AE7" : "var(--bg-hover)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "white" : "var(--text-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                </button>
              </div>
            )}
          </div>

          {site && (
            <div className="shrink-0 px-3 py-2 flex justify-center gap-3" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={() => {
                if (!confirm("초기화하시겠습니까?")) return;
                setC(EMPTY_CONTENT); setStep("template"); setSite(null);
                setMessages([{ role: "system", text: "초기화했어요. 다시 시작할까요?", action: "template" }]);
              }} className="text-[10px]" style={{ color: "var(--text-muted)" }}>초기화</button>
              <button onClick={deleteSite} className="text-[10px] text-[var(--danger)]">삭제</button>
            </div>
          )}
        </div>

        {/* ═══ RIGHT — Preview (iframe) ═══ */}
        <div className={`${mobileView === "preview" ? "flex" : "hidden"} md:flex flex-col flex-1 overflow-hidden relative`}>
          {!hasContent ? (
            /* Empty state — ocean photo */
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format"
                alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.4) 100%)" }} />
              <div className="relative z-10 text-center px-8">
                <div className="text-[38px] font-extrabold text-white leading-tight tracking-tight mb-5"
                  style={{ textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}>
                  당신의 상상력을<br/>펼쳐 보세요
                </div>
                <div className="text-[15px] text-white/70 leading-relaxed" style={{ textShadow: "0 1px 20px rgba(0,0,0,0.5)" }}>
                  {step === "generating" ? "AI가 멋진 웹사이트를 만들고 있어요..." : "몇 가지 질문에 답하시면\nAI가 완성된 웹사이트를 디자인합니다"}
                </div>
                {step === "generating" && (
                  <div className="mt-8 flex justify-center gap-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full bg-white" style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                    <style>{`@keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }`}</style>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Generated site — rendered in iframe */
            <div className="flex-1 flex flex-col" style={{ background: "#1a1a2e" }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ background: "#2D2D44", borderBottom: "1px solid #3D3D55" }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 text-center text-[11px] text-white/50 rounded-lg py-1.5 px-3 mx-8" style={{ background: "#1a1a2e" }}>
                  {slug || "my-store"}.contavelo.ai
                </div>
              </div>
              {/* iframe with generated HTML */}
              <iframe
                srcDoc={generatedHtml}
                className="flex-1 w-full border-0"
                style={{ background: "white" }}
                title="Website Preview"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

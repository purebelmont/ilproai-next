"use client";

import { useState, useEffect, useRef } from "react";
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
  html?: string;
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

const SAMPLE_DATA: Record<string, { name: string; description: string; contact: string }> = {
  restaurant: { name: "맛있는 식당", description: "정성 가득한 한식 전문점", contact: "02-1234-5678, 서울 강남구 역삼동 123" },
  service: { name: "뷰티살롱 아름", description: "프리미엄 헤어 & 뷰티 케어", contact: "010-1234-5678, 서울 마포구 합정동 45" },
  retail: { name: "트렌디 스토어", description: "감각적인 라이프스타일 편집숍", contact: "02-9876-5432, 서울 성동구 성수동 78" },
  office: { name: "스마트 솔루션즈", description: "비즈니스 성장을 위한 IT 컨설팅", contact: "02-555-1234, 서울 서초구 서초동 200" },
  medical: { name: "미소 의원", description: "가족 모두를 위한 건강 주치의", contact: "02-777-8888, 서울 송파구 잠실동 50" },
  education: { name: "밝은미래 학원", description: "1:1 맞춤 교육 전문 학원", contact: "02-333-4444, 서울 노원구 중계동 100" },
  fitness: { name: "파워짐 피트니스", description: "체계적인 1:1 PT 전문 헬스장", contact: "010-5555-6666, 서울 용산구 이태원동 30" },
  lodging: { name: "바다펜션", description: "오션뷰 프리미엄 숙소", contact: "033-123-4567, 강원도 양양군 현북면 해변길 15" },
  repair: { name: "든든 수리센터", description: "전자제품 수리 전문점", contact: "031-888-9999, 경기도 수원시 팔달구 100" },
  legal: { name: "정의 법률사무소", description: "20년 경력 민사·형사 전문 변호사", contact: "02-111-2222, 서울 서초구 법원로 10" },
  realestate: { name: "행복 공인중개사", description: "지역 1등 부동산 전문가", contact: "02-444-5555, 서울 강남구 대치동 300" },
  pet: { name: "해피펫 동물병원", description: "반려동물 건강을 책임지는 곳", contact: "02-666-7777, 서울 마포구 연남동 55" },
  wedding: { name: "로맨틱 웨딩홀", description: "특별한 하루를 만드는 웨딩 플래너", contact: "02-222-3333, 서울 강남구 논현동 80" },
  manufacturing: { name: "대한정밀 산업", description: "고품질 정밀 부품 제조 전문", contact: "032-999-1111, 인천 남동구 논현동 공단 5" },
  logistics: { name: "빠른배송 물류", description: "전국 당일 배송 물류 서비스", contact: "031-777-8888, 경기도 이천시 물류단지 20" },
  freelance: { name: "크리에이티브 스튜디오", description: "브랜딩 & 웹디자인 프리랜서", contact: "010-9999-0000, hello@creative.kr" },
};

function isSkipPhrase(text: string): boolean {
  const skip = text.trim().toLowerCase();
  return /^(그냥|걍)\s*(만들어|만들어줘|해줘|해|시작|고|ㄱ)|^(만들어|만들어줘|건너뛰기|넘어가|패스|skip|스킵|몰라|없어|됐어|빨리)/.test(skip);
}

type Step = "template" | "name" | "description" | "contact" | "generating" | "edit";

function highlightHtml(line: string) {
  return line
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(&lt;\/?)([\w-]+)/g, '<span style="color:#F97583">$1$2</span>')
    .replace(/([\w-]+)(=)/g, '<span style="color:#79B8FF">$1</span><span style="color:#E1E4E8">$2</span>')
    .replace(/(")(.*?)(")/g, '<span style="color:#9ECBFF">$1$2$3</span>')
    .replace(/(\/\*.*?\*\/|&lt;!--.*?--&gt;)/g, '<span style="color:#6A737D">$1</span>');
}

export default function WebsiteBuilderPanel({ userId, plan }: { userId: string; plan: string }) {
  const isPro = plan === "pro" || plan === "team";
  const [site, setSite] = useState<Website | null>(null);
  const [c, setC] = useState<WebsiteContent>(EMPTY_CONTENT);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("draft");
  const [mobileView, setMobileView] = useState<"chat" | "preview">("chat");
  const [loaded, setLoaded] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [streamingCode, setStreamingCode] = useState("");

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
  const [isComposing, setIsComposing] = useState(false);
  const justSentRef = useRef(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const codeScrollRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
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

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamingCode]);

  // Auto-save when HTML changes (after edits)
  useEffect(() => {
    if (!site || !generatedHtml || step !== "edit") return;
    const timer = setTimeout(async () => {
      const contentToSave = { ...c, html: generatedHtml };
      await supabase.from("websites").update({ content: contentToSave, updated_at: new Date().toISOString() }).eq("id", site.id);
    }, 1000);
    return () => clearTimeout(timer);
  }, [generatedHtml]);
  useEffect(() => {
    requestAnimationFrame(() => {
      if (codeScrollRef.current) codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
    });
  }, [streamingCode]);

  // Only render final HTML in iframe (no streaming updates = no flicker)
  useEffect(() => {
    if (!previewRef.current || !generatedHtml) return;
    previewRef.current.srcdoc = generatedHtml;
  }, [generatedHtml]);

  // ═══ STEP HANDLERS ═══

  function pickTemplate(id: string) {
    setTemplate(id);
    const t = TEMPLATES.find(t => t.id === id);
    setMessages(prev => [
      ...prev,
      { role: "user", text: `${t?.icon} ${t?.name}` },
      { role: "system", text: `${t?.icon} ${t?.name} 업종이시군요!\n가게(회사) 이름이 뭔가요?` },
    ]);
    setStep("name");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function submitName() {
    const raw = input.trim();
    if (!raw) return;
    setInput("");

    if (isSkipPhrase(raw)) {
      const sample = SAMPLE_DATA[template] || SAMPLE_DATA.service;
      setBizName(sample.name);
      setDescription(sample.description);
      setContactInfo(sample.contact);
      setMessages(prev => [
        ...prev,
        { role: "user", text: raw },
        { role: "system", text: `샘플로 만들어 드릴게요!\n\"${sample.name}\" — ${sample.description}` },
      ]);
      triggerGenerate(sample.name, sample.description, sample.contact);
      return;
    }

    setBizName(raw);
    const t = TEMPLATES.find(t => t.id === template);
    setMessages(prev => [
      ...prev,
      { role: "user", text: raw },
      { role: "system", text: `\"${raw}\" — 좋은 이름이네요!\n어떤 ${t?.name || "곳"}인지 한 줄로 설명해 주세요.\n예: \"20년 전통 한식당\", \"울산 최고의 네일샵\"` },
    ]);
    setStep("description");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function submitDescription() {
    const raw = input.trim();
    if (!raw) return;
    setInput("");

    if (isSkipPhrase(raw)) {
      const sample = SAMPLE_DATA[template] || SAMPLE_DATA.service;
      const desc = sample.description;
      setDescription(desc);
      setContactInfo(sample.contact);
      setMessages(prev => [
        ...prev,
        { role: "user", text: raw },
        { role: "system", text: `\"${bizName}\" 샘플 설명으로 만들게요!` },
      ]);
      triggerGenerate(bizName, desc, sample.contact);
      return;
    }

    setDescription(raw);
    setMessages(prev => [
      ...prev,
      { role: "user", text: raw },
      { role: "system", text: `\"${bizName}\" — ${raw}\n멋져요! 마지막으로 연락처를 알려주세요.\n전화번호, 주소, 이메일 등 아는 만큼 입력하시면 돼요.\n\n예: 052-123-4567, 울산 남구 삼산동 123` },
    ]);
    setStep("contact");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function triggerGenerate(name: string, desc: string, contact: string) {
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9가-힣]/g, "").substring(0, 30) || "my-site";
    setSlug(autoSlug);
    setStep("generating");
    setStreamingCode("");
    setGeneratedHtml("");
    setMessages(prev => [...prev, { role: "system", text: `\"${name}\" 웹사이트를 만들고 있어요... ✨`, action: "loading" }]);

    try {
      // Try streaming first
      const res = await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, bizName: name, description: desc, contact, features: "", stream: true }),
      });

      let html = "";
      let source: "ai" | "template" = "ai";

      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        // Stream the response — throttle UI updates for smooth preview
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let lastUpdate = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.error) throw new Error("Stream error");
              if (parsed.text) {
                html += parsed.text;
                const now = Date.now();
                if (now - lastUpdate > 300) {
                  setStreamingCode(html);
                  lastUpdate = now;
                }
              }
              if (parsed.done) break;
            } catch (e) {
              if (e instanceof Error && e.message === "Stream error") throw e;
            }
          }
        }
        // Final update with complete HTML
        setStreamingCode(html);
      } else {
        // Fallback: non-streaming JSON response
        const data = await res.json();
        html = data.html;
        source = data.source;
      }

      setStreamingCode("");
      setGeneratedHtml(html);
      const contentWithHtml = { ...EMPTY_CONTENT, html, hero: { title: name, subtitle: desc, image: "" } };
      setC(contentWithHtml as any);

      const { data: existing } = await supabase.from("websites").select("id").eq("slug", autoSlug).maybeSingle();
      const finalSlug = existing ? autoSlug + Math.floor(Math.random() * 100) : autoSlug;
      setSlug(finalSlug);

      const { data, error } = await supabase.from("websites").insert({
        user_id: userId, slug: finalSlug, business_name: name, template, status: "draft", content: contentWithHtml,
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
        { role: "system", text: `웹사이트가 완성됐어요! 🎉\n\n${source === "ai" ? "🧠 Claude AI가 디자인했습니다." : "📐 템플릿으로 생성했습니다."}\n\n"게시" 버튼을 누르면 아래 주소에서 확인 가능:\n🔗 /sites/${finalSlug}\n\n수정하려면 아래에서 요청하세요.`, action: "sections" },
      ]);
    } catch (e) {
      setStreamingCode("");
      setMessages(prev => [
        ...prev.filter(m => m.action !== "loading"),
        { role: "system", text: "생성 중 오류가 발생했어요. 다시 시도해 주세요." },
      ]);
      setStep("contact");
    }
  }

  async function submitContact() {
    const raw = input.trim();
    setInput("");

    if (isSkipPhrase(raw) || !raw) {
      const sample = SAMPLE_DATA[template] || SAMPLE_DATA.service;
      const contact = sample.contact;
      setContactInfo(contact);
      setMessages(prev => [...prev, { role: "user", text: raw || "(건너뛰기)" }]);
      triggerGenerate(bizName, description, contact);
      return;
    }

    setContactInfo(raw);
    setMessages(prev => [...prev, { role: "user", text: raw }]);
    triggerGenerate(bizName, description, raw);
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
    let htmlUpdated = generatedHtml;

    switch (activeSection) {
      case "hero": {
        const parts = text.split(/[\/\|]/).map(s => s.trim());
        const newTitle = parts[0] || updated.hero.title;
        const newSub = parts[1] || updated.hero.subtitle;
        // Update structured data
        updated.hero = { ...updated.hero, title: newTitle, subtitle: newSub };
        // Update AI HTML — replace <h1> content and first <p> after it
        if (htmlUpdated) {
          htmlUpdated = htmlUpdated.replace(/(<h1[^>]*>)([\s\S]*?)(<\/h1>)/, `$1${newTitle}$3`);
          if (newSub && updated.hero.subtitle !== newSub) {
            // Replace the subtitle — typically the first <p> inside hero or after h1
            const heroMatch = htmlUpdated.match(/(<h1[^>]*>[\s\S]*?<\/h1>\s*(?:<[^>]+>\s*)*<p[^>]*>)([\s\S]*?)(<\/p>)/);
            if (heroMatch) {
              htmlUpdated = htmlUpdated.replace(heroMatch[0], `${heroMatch[1]}${newSub}${heroMatch[3]}`);
            }
          }
        }
        break;
      }
      case "about": {
        updated.about = { ...updated.about, text: text.trim() };
        // Update about section text in AI HTML
        if (htmlUpdated) {
          const aboutRegex = /(<(?:section|div)[^>]*(?:id|class)\s*=\s*["'][^"']*about[^"']*["'][^>]*>[\s\S]*?<p[^>]*>)([\s\S]*?)(<\/p>)/i;
          const match = htmlUpdated.match(aboutRegex);
          if (match) htmlUpdated = htmlUpdated.replace(match[0], `${match[1]}${text.trim()}${match[3]}`);
        }
        break;
      }
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
    if (htmlUpdated !== generatedHtml) {
      setGeneratedHtml(htmlUpdated);
      // Also update the html in content for DB save
      updated.html = htmlUpdated;
      setC({ ...updated });
    }
  }

  // ═══ SEND ═══

  function handleSend() {
    if (!input.trim()) return;
    const text = input.trim();
    // Guard against IME ghost characters after clearing input
    justSentRef.current = true;
    setTimeout(() => { justSentRef.current = false; }, 100);

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
    const contentToSave = { ...c, html: generatedHtml } as any;
    await supabase.from("websites").update({ content: contentToSave, status: newStatus, updated_at: new Date().toISOString() }).eq("id", site.id);
    setStatus(newStatus); setSaving(false);
  }

  function downloadHtml() {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || bizName || "website"}.html`;
    a.click();
    URL.revokeObjectURL(url);
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
                  {status === "published" ? (
                    <a href={`/sites/${slug}`} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] px-2 py-1 rounded-md text-white font-medium" style={{ background: "#0071E3" }}>미리보기</a>
                  ) : (
                    <button onClick={() => save(true)} className="text-[10px] px-2 py-1 rounded-md text-white font-medium" style={{ background: "#30D158" }}>게시</button>
                  )}
                  {generatedHtml && (
                    <button onClick={downloadHtml} className="text-[10px] px-2 py-1 rounded-md"
                      style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>HTML 다운로드</button>
                  )}
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
            {/* Live code streaming in chat */}
            {streamingCode && (
              <div>
                <div className="rounded-2xl rounded-tl-md overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: "#1e1e2e", borderBottom: "1px solid #333" }}>
                    <div className="w-2 h-2 rounded-full bg-[#7D2AE7]" style={{ animation: "codePulse 1.2s ease-in-out infinite" }} />
                    <span className="text-[10px] text-[#b388ff] font-medium">코드 생성 중</span>
                    <span className="text-[9px] text-[#aaa] font-mono ml-auto">{streamingCode.split("\n").length} lines</span>
                  </div>
                  <div ref={codeScrollRef} className="overflow-y-auto max-h-[300px] p-2 font-mono text-[10px] leading-[1.6]" style={{ background: "#1e1e2e", scrollBehavior: "smooth" }}>
                    {streamingCode.split("\n").map((line, i) => (
                      <div key={i} className="flex">
                        <span className="select-none w-[32px] shrink-0 text-right pr-2" style={{ color: "#666" }}>{i + 1}</span>
                        <span style={{ color: "#ddd" }} dangerouslySetInnerHTML={{ __html: highlightHtml(line) }} />
                      </div>
                    ))}
                  </div>
                </div>
                <style>{`@keyframes codePulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
              </div>
            )}
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
                <textarea ref={inputRef} value={input}
                  onChange={(e) => { if (!justSentRef.current) setInput(e.target.value); }}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={(e) => { setIsComposing(false); if (justSentRef.current) e.preventDefault(); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !isComposing && e.keyCode !== 229) { e.preventDefault(); handleSend(); } }}
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
            <div className="shrink-0 px-3 py-2 flex justify-center" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={async () => {
                if (!confirm("사이트를 삭제하고 처음부터 다시 시작하시겠습니까?")) return;
                await supabase.from("websites").delete().eq("id", site.id);
                setSite(null); setC(EMPTY_CONTENT); setGeneratedHtml(""); setStreamingCode("");
                setStep("template"); setTemplate(""); setBizName(""); setSlug(""); setDescription(""); setContactInfo(""); setStatus("draft");
                setMessages([{ role: "system", text: "초기화했어요. 새로 만들까요?", action: "template" }]);
              }} className="text-[10px]" style={{ color: "var(--text-muted)" }}>초기화</button>
            </div>
          )}
        </div>

        {/* ═══ RIGHT — Preview (iframe) ═══ */}
        <div className={`${mobileView === "preview" ? "flex" : "hidden"} md:flex flex-col flex-1 overflow-hidden relative`}>
          {generatedHtml ? (
            /* Final preview — rendered once, no flicker */
            <div className="flex-1 flex flex-col" style={{ background: "#1a1a2e" }}>
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
              <iframe
                ref={previewRef}
                className="flex-1 w-full border-0"
                style={{ background: "white" }}
                title="Website Preview"
              />
            </div>
          ) : streamingCode ? (
            /* Building animation during streaming */
            <div className="flex-1 flex flex-col items-center justify-center" style={{ background: "#0d1117" }}>
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7D2AE7, #EC4899)" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="absolute -inset-3 rounded-3xl" style={{ border: "2px solid #7D2AE7", opacity: 0.3, animation: "buildPulse 2s ease-in-out infinite" }} />
              </div>
              <div className="text-[18px] font-bold text-white mb-2">웹사이트 생성 중</div>
              <div className="text-[13px] text-white/50 mb-6">AI가 코드를 작성하고 있어요</div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full" style={{ background: "rgba(125,42,231,0.15)", border: "1px solid rgba(125,42,231,0.3)" }}>
                <div className="w-2 h-2 rounded-full bg-[#7D2AE7]" style={{ animation: "buildDot 1s ease-in-out infinite" }} />
                <span className="text-[12px] text-[#b388ff] font-mono">{streamingCode.split("\n").length} lines</span>
                <span className="text-[11px] text-white/30">|</span>
                <span className="text-[12px] text-[#b388ff] font-mono">{(streamingCode.length / 1000).toFixed(1)}KB</span>
              </div>
              <style>{`
                @keyframes buildPulse { 0%,100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.15); opacity: 0; } }
                @keyframes buildDot { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
              `}</style>
            </div>
          ) : (
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
                  몇 가지 질문에 답하시면{"\n"}AI가 완성된 웹사이트를 디자인합니다
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

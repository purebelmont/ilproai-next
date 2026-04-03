"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function WebsiteBuilderPanel({ userId, plan, openModal, closeModal }: { userId: string; plan: string; openModal: any; closeModal: any }) {
  const [sites, setSites] = useState<Website[]>([]);
  const [editing, setEditing] = useState<Website | null>(null);
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<Website | null>(null);
  const isPro = plan === "pro" || plan === "team";

  const load = useCallback(async () => {
    const { data } = await supabase.from("websites").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setSites((data as Website[]) || []);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // Free users: can create 1 site, pick template, edit content — but "게시하기" is locked
  const canCreate = isPro || sites.length === 0;

  // ── Sub-views ──
  if (preview) return <PreviewPanel site={preview} onBack={() => setPreview(null)} />;
  if (editing) return <EditorPanel site={editing} isPro={isPro} onSave={async (s) => { await saveSite(s); setEditing(null); load(); }} onBack={() => setEditing(null)} onDelete={async (id) => { await deleteSite(id); setEditing(null); load(); }} />;
  if (creating) return <CreatePanel userId={userId} onCreated={(s) => { setCreating(false); setEditing(s); load(); }} onBack={() => setCreating(false)} />;

  return (
    <div className="p-5">
      {/* PRO Header banner for free users */}
      {!isPro && (
        <div className="rounded-2xl p-5 mb-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0071E3, #5856D6)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "white", transform: "translate(30%, -30%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/20 text-white">PRO</span>
              <span className="text-white/80 text-xs">Tier 2</span>
            </div>
            <div className="text-white font-bold text-lg mb-1">AI 홈페이지 빌더</div>
            <div className="text-white/80 text-sm mb-3">5분만에 내 가게 웹사이트를 만들어보세요</div>
            <div className="flex items-center gap-3">
              <div className="text-white/60 text-xs line-through">₩29,900/월</div>
              <div className="text-white font-bold">무료 체험</div>
            </div>
            <div className="text-white/60 text-[11px] mt-1">사이트 1개 무료 생성 · 게시는 PRO 전용</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold">내 홈페이지</h4>
          <p className="text-xs text-[var(--text-muted)]">
            {isPro ? "사이트를 만들고 게시하세요" : `무료 체험: 1개 사이트 생성 가능${sites.length > 0 ? " (사용 중)" : ""}`}
          </p>
        </div>
        {canCreate && (
          <button onClick={() => setCreating(true)}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold active:scale-[0.98]">
            + 새 사이트
          </button>
        )}
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <div className="text-5xl mb-4">🌐</div>
          <div className="font-semibold mb-1">아직 만든 사이트가 없습니다</div>
          <div className="text-sm mb-6">템플릿을 선택하면 바로 시작할 수 있어요</div>

          {/* Template preview cards — visible to everyone */}
          <div className="grid grid-cols-2 gap-3 text-left mb-6">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
                <div className="text-3xl mb-2">{t.icon}</div>
                <div className="font-semibold text-sm text-[var(--text)]">{t.name}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-1">{t.desc}</div>
              </div>
            ))}
          </div>

          <button onClick={() => setCreating(true)}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold">
            {isPro ? "홈페이지 만들기" : "무료로 체험하기"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((s) => (
            <div key={s.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ background: (s.content?.theme?.color || "#0071E3") + "15", color: s.content?.theme?.color || "#0071E3" }}>
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
                <button onClick={() => setEditing(s)}
                  className="flex-1 py-2 text-xs font-medium rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] active:scale-[0.98]">
                  수정
                </button>
                <button onClick={() => setPreview(s)}
                  className="flex-1 py-2 text-xs font-medium rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] active:scale-[0.98]">
                  미리보기
                </button>
                {s.status === "published" ? (
                  <a href={`/sites/${s.slug}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-2 text-xs font-medium rounded-lg bg-[var(--primary)] text-white text-center active:scale-[0.98]">
                    방문
                  </a>
                ) : (
                  <div className="flex-1 py-2 text-xs font-medium rounded-lg text-center active:scale-[0.98]"
                    style={{ background: isPro ? "var(--primary)" : "linear-gradient(135deg, #0071E3, #5856D6)", color: "white" }}>
                    {isPro ? "게시하기" : "🔒 PRO"}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Upgrade nudge for free users */}
          {!isPro && (
            <div className="rounded-xl border-2 border-dashed p-4 text-center mt-4" style={{ borderColor: "var(--primary)" }}>
              <div className="text-sm font-semibold mb-1" style={{ color: "var(--primary)" }}>사이트를 게시하려면?</div>
              <div className="text-xs text-[var(--text-muted)] mb-3">PRO 플랜으로 업그레이드하면 {"{가게}.ilpro.ai"}로 바로 게시됩니다</div>
              <button className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, #0071E3, #5856D6)" }}>
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

  function toSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9가-힣ㄱ-ㅎ]/g, "").replace(/\s+/g, "-").substring(0, 30);
  }

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
    const content = { ...EMPTY_CONTENT, hero: { ...EMPTY_CONTENT.hero, title: bizName, subtitle: getSubtitle(template) } };
    const { data, error } = await supabase.from("websites").insert({
      user_id: userId, slug, business_name: bizName, template, status: "draft",
      content,
    }).select().single();
    setSaving(false);
    if (error) { alert("오류: " + error.message); return; }
    onCreated(data as Website);
  }

  function getSubtitle(t: string) {
    const map: Record<string, string> = {
      restaurant: "맛있는 음식과 따뜻한 분위기",
      service: "최고의 서비스를 제공합니다",
      retail: "좋은 상품을 합리적인 가격에",
      office: "신뢰할 수 있는 비즈니스 파트너",
    };
    return map[t] || "";
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
              <input value={bizName} onChange={(e) => { setBizName(e.target.value); if (!slug) setSlug(toSlug(e.target.value)); }}
                placeholder="맛있는한식당" autoFocus />
            </div>
            <div className="ios-field">
              <label>사이트 주소</label>
              <div className="flex items-center gap-1 flex-1">
                <input value={slug} onChange={(e) => { const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""); setSlug(v); checkSlug(v); }}
                  placeholder="my-store" className="flex-1" />
                <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">.ilpro.ai</span>
              </div>
            </div>
          </div>
          {slugError && <div className="text-xs text-[var(--danger)] mb-3 px-1">{slugError}</div>}
          <div className="bg-[var(--bg-hover)] rounded-xl p-3 mb-4">
            <div className="text-xs text-[var(--text-muted)]">사이트 주소 미리보기</div>
            <div className="font-semibold text-sm mt-1" style={{ color: "var(--primary)" }}>
              {slug || "my-store"}.ilpro.ai
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 py-3 text-sm font-medium rounded-xl bg-[var(--bg-hover)] text-[var(--text-secondary)]">뒤로</button>
            <button onClick={create} disabled={!bizName || !slug || !!slugError || saving}
              className="flex-1 py-3 text-sm font-semibold rounded-xl bg-[var(--primary)] text-white disabled:opacity-50">
              {saving ? "생성 중..." : "사이트 만들기"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════
// EDITOR — edit site content
// ══════════════════════════════
function EditorPanel({ site, isPro, onSave, onBack, onDelete }: { site: Website; isPro: boolean; onSave: (s: Website) => void; onBack: () => void; onDelete: (id: number) => void }) {
  const [c, setC] = useState<WebsiteContent>(site.content || EMPTY_CONTENT);
  const [section, setSection] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(site.status);

  const sections = [
    { id: "hero", icon: "🎯", label: "메인" },
    { id: "about", icon: "📖", label: "소개" },
    { id: "services", icon: "📋", label: "서비스" },
    { id: "hours", icon: "🕐", label: "영업시간" },
    { id: "contact", icon: "📞", label: "연락처" },
    { id: "theme", icon: "🎨", label: "디자인" },
  ];

  async function save(publish?: boolean) {
    setSaving(true);
    const newStatus = publish !== undefined ? (publish ? "published" : "draft") : status;
    const updated = { ...site, content: c, status: newStatus, updated_at: new Date().toISOString() };
    await supabase.from("websites").update({ content: c, status: newStatus, updated_at: new Date().toISOString() }).eq("id", site.id);
    setStatus(newStatus);
    setSaving(false);
    onSave(updated);
  }

  function updateService(idx: number, key: string, val: string) {
    const svcs = [...c.services];
    svcs[idx] = { ...svcs[idx], [key]: val };
    setC({ ...c, services: svcs });
  }

  function addService() {
    setC({ ...c, services: [...c.services, { name: "", description: "", price: "" }] });
  }

  function removeService(idx: number) {
    if (c.services.length <= 1) return;
    setC({ ...c, services: c.services.filter((_, i) => i !== idx) });
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-[var(--primary)] text-sm font-medium">← 돌아가기</button>
        <div className="flex gap-2">
          {status === "published" ? (
            <button onClick={() => save(false)} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)]">
              비공개로
            </button>
          ) : isPro ? (
            <button onClick={() => save(true)} className="px-3 py-1.5 text-xs rounded-lg bg-[#30D158] text-white font-medium">
              게시하기
            </button>
          ) : (
            <button className="px-3 py-1.5 text-xs rounded-lg text-white font-medium"
              style={{ background: "linear-gradient(135deg, #0071E3, #5856D6)" }}
              onClick={() => alert("PRO 플랜으로 업그레이드하면 사이트를 게시할 수 있습니다.\n₩29,900/월")}>
              🔒 게시 (PRO)
            </button>
          )}
          <button onClick={() => save()} disabled={saving}
            className="px-3 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white font-medium">
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-lg font-bold">{site.business_name}</h4>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${status === "published" ? "bg-[#30D15820] text-[#30D158]" : "bg-[var(--bg-hover)] text-[var(--text-muted)]"}`}>
          {status === "published" ? "게시됨" : "초안"}
        </span>
      </div>
      <div className="text-xs text-[var(--text-muted)] mb-4">{site.slug}.ilpro.ai</div>

      {/* Section tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
        {sections.map((s) => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all"
            style={{ background: section === s.id ? "var(--primary)" : "var(--bg-hover)", color: section === s.id ? "white" : "var(--text-secondary)" }}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Hero */}
      {section === "hero" && (
        <div>
          <div className="ios-fields">
            <div className="ios-field"><label>제목</label><input value={c.hero.title} onChange={(e) => setC({ ...c, hero: { ...c.hero, title: e.target.value } })} placeholder="가게 이름" /></div>
            <div className="ios-field"><label>부제</label><input value={c.hero.subtitle} onChange={(e) => setC({ ...c, hero: { ...c.hero, subtitle: e.target.value } })} placeholder="한줄 소개" /></div>
            <div className="ios-field"><label>이미지 URL</label><input value={c.hero.image} onChange={(e) => setC({ ...c, hero: { ...c.hero, image: e.target.value } })} placeholder="https://..." /></div>
          </div>
          <div className="mt-4 bg-[var(--bg-hover)] rounded-xl p-4">
            <div className="text-[10px] text-[var(--text-muted)] mb-2">미리보기</div>
            <div className="rounded-lg overflow-hidden" style={{ background: c.theme.color, minHeight: 120 }}>
              {c.hero.image && <img src={c.hero.image} alt="" className="w-full h-32 object-cover opacity-60" />}
              <div className="p-4 text-white" style={{ marginTop: c.hero.image ? -60 : 0, position: "relative" }}>
                <div className="text-xl font-bold">{c.hero.title || "가게 이름"}</div>
                <div className="text-sm opacity-80 mt-1">{c.hero.subtitle || "한줄 소개"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About */}
      {section === "about" && (
        <div className="ios-fields">
          <div className="ios-field" style={{ alignItems: "flex-start" }}>
            <label style={{ paddingTop: 8 }}>소개글</label>
            <textarea value={c.about.text} onChange={(e) => setC({ ...c, about: { ...c.about, text: e.target.value } })}
              placeholder="가게에 대한 소개를 작성하세요" style={{ minHeight: 120 }} />
          </div>
          <div className="ios-field"><label>이미지 URL</label><input value={c.about.image} onChange={(e) => setC({ ...c, about: { ...c.about, image: e.target.value } })} placeholder="https://..." /></div>
        </div>
      )}

      {/* Services */}
      {section === "services" && (
        <div>
          {c.services.map((svc, i) => (
            <div key={i} className="ios-fields mb-3">
              <div className="ios-field">
                <label>{site.template === "restaurant" ? "메뉴" : "서비스"} {i + 1}</label>
                <input value={svc.name} onChange={(e) => updateService(i, "name", e.target.value)} placeholder="이름" />
              </div>
              <div className="ios-field"><label>설명</label><input value={svc.description} onChange={(e) => updateService(i, "description", e.target.value)} placeholder="간단한 설명" /></div>
              <div className="ios-field">
                <label>가격</label>
                <div className="flex items-center gap-2 flex-1">
                  <input value={svc.price} onChange={(e) => updateService(i, "price", e.target.value)} placeholder="10,000" />
                  {c.services.length > 1 && <button onClick={() => removeService(i)} className="text-[var(--danger)] text-xs shrink-0">삭제</button>}
                </div>
              </div>
            </div>
          ))}
          <button onClick={addService} className="w-full py-2.5 text-sm text-[var(--primary)] font-medium rounded-xl border border-dashed border-[var(--primary)] active:scale-[0.98]">
            + {site.template === "restaurant" ? "메뉴" : "서비스"} 추가
          </button>
        </div>
      )}

      {/* Hours */}
      {section === "hours" && (
        <div className="ios-fields">
          {Object.entries(DAY_LABELS).map(([key, label]) => (
            <div key={key} className="ios-field">
              <label>{label}</label>
              <input value={c.hours[key] || ""} onChange={(e) => setC({ ...c, hours: { ...c.hours, [key]: e.target.value } })} placeholder="09:00 - 18:00" />
            </div>
          ))}
        </div>
      )}

      {/* Contact */}
      {section === "contact" && (
        <div className="ios-fields">
          <div className="ios-field"><label>전화</label><input value={c.contact.phone} onChange={(e) => setC({ ...c, contact: { ...c.contact, phone: e.target.value } })} placeholder="052-123-4567" /></div>
          <div className="ios-field"><label>이메일</label><input value={c.contact.email} onChange={(e) => setC({ ...c, contact: { ...c.contact, email: e.target.value } })} placeholder="info@example.com" /></div>
          <div className="ios-field"><label>주소</label><input value={c.contact.address} onChange={(e) => setC({ ...c, contact: { ...c.contact, address: e.target.value } })} placeholder="울산 남구 삼산동 123" /></div>
          <div className="ios-field"><label>카카오톡</label><input value={c.contact.kakao} onChange={(e) => setC({ ...c, contact: { ...c.contact, kakao: e.target.value } })} placeholder="카카오톡 채널 ID" /></div>
        </div>
      )}

      {/* Theme */}
      {section === "theme" && (
        <div>
          <div className="text-sm font-semibold mb-3">브랜드 컬러</div>
          <div className="flex gap-2 flex-wrap mb-6">
            {COLORS.map((color) => (
              <button key={color} onClick={() => setC({ ...c, theme: { ...c.theme, color } })}
                className="w-10 h-10 rounded-full border-2 transition-all"
                style={{ background: color, borderColor: c.theme.color === color ? "var(--text)" : "transparent", transform: c.theme.color === color ? "scale(1.15)" : "scale(1)" }} />
            ))}
          </div>
          <div className="text-sm font-semibold mb-3">미리보기</div>
          <div className="rounded-xl overflow-hidden border border-[var(--border)]">
            <div className="p-6 text-white" style={{ background: c.theme.color }}>
              <div className="text-xl font-bold">{site.business_name}</div>
              <div className="text-sm opacity-80 mt-1">{c.hero.subtitle || "한줄 소개"}</div>
            </div>
            <div className="p-4 bg-[var(--bg-card)]">
              <div className="text-sm font-semibold mb-2" style={{ color: c.theme.color }}>서비스</div>
              <div className="text-xs text-[var(--text-muted)]">콘텐츠가 이 스타일로 표시됩니다</div>
            </div>
          </div>
        </div>
      )}

      {/* Delete button */}
      <div className="mt-8 pt-4 border-t border-[var(--border)]">
        <button onClick={() => { if (confirm("이 사이트를 삭제하시겠습니까?")) onDelete(site.id); }}
          className="w-full py-3 text-sm text-[var(--danger)] font-medium rounded-xl">
          사이트 삭제
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════
// PREVIEW — live preview
// ══════════════════════════════
function PreviewPanel({ site, onBack }: { site: Website; onBack: () => void }) {
  const c = site.content || EMPTY_CONTENT;
  const color = c.theme?.color || "#0071E3";

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-[var(--primary)] text-sm font-medium">← 돌아가기</button>
        <a href={`/sites/${site.slug}`} target="_blank" rel="noopener noreferrer"
          className="text-xs text-[var(--primary)] font-medium">새 탭에서 열기 ↗</a>
      </div>

      {/* Phone frame */}
      <div className="mx-auto max-w-[375px] rounded-[2rem] border-4 border-[var(--text)] overflow-hidden shadow-2xl" style={{ background: "var(--bg)" }}>
        {/* Status bar */}
        <div className="h-6 flex items-center justify-center text-[10px] text-[var(--text-muted)]" style={{ background: "var(--bg-card)" }}>
          {site.slug}.ilpro.ai
        </div>

        {/* Hero */}
        <div className="relative" style={{ background: color, minHeight: 180 }}>
          {c.hero.image && <img src={c.hero.image} alt="" className="w-full h-44 object-cover opacity-50" />}
          <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
            <div className="text-2xl font-bold">{c.hero.title || site.business_name}</div>
            <div className="text-sm opacity-80 mt-1">{c.hero.subtitle}</div>
          </div>
        </div>

        {/* About */}
        {c.about.text && (
          <div className="p-5">
            <div className="text-sm font-bold mb-2" style={{ color }}>소개</div>
            <div className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{c.about.text}</div>
          </div>
        )}

        {/* Services */}
        {c.services.some(s => s.name) && (
          <div className="p-5 pt-0">
            <div className="text-sm font-bold mb-3" style={{ color }}>
              {site.template === "restaurant" ? "메뉴" : "서비스"}
            </div>
            {c.services.filter(s => s.name).map((svc, i) => (
              <div key={i} className="flex justify-between items-start py-2 border-b border-[var(--border)]">
                <div>
                  <div className="text-sm font-medium">{svc.name}</div>
                  {svc.description && <div className="text-[11px] text-[var(--text-muted)]">{svc.description}</div>}
                </div>
                {svc.price && <div className="text-sm font-bold shrink-0 ml-3" style={{ color }}>₩{svc.price}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Hours */}
        {Object.values(c.hours).some(v => v) && (
          <div className="p-5 pt-0">
            <div className="text-sm font-bold mb-3" style={{ color }}>영업시간</div>
            {Object.entries(DAY_LABELS).map(([key, label]) => (
              c.hours[key] && (
                <div key={key} className="flex justify-between py-1.5 text-xs">
                  <span className="font-medium">{label}요일</span>
                  <span className="text-[var(--text-muted)]">{c.hours[key]}</span>
                </div>
              )
            ))}
          </div>
        )}

        {/* Contact */}
        {(c.contact.phone || c.contact.address) && (
          <div className="p-5 pt-0">
            <div className="text-sm font-bold mb-3" style={{ color }}>연락처</div>
            {c.contact.phone && <div className="text-xs mb-1.5">📞 {c.contact.phone}</div>}
            {c.contact.email && <div className="text-xs mb-1.5">📧 {c.contact.email}</div>}
            {c.contact.address && <div className="text-xs mb-1.5">📍 {c.contact.address}</div>}
            {c.contact.kakao && <div className="text-xs mb-1.5">💬 카카오톡: {c.contact.kakao}</div>}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 text-center text-[10px] text-[var(--text-muted)] border-t border-[var(--border)]">
          Powered by 일프로AI
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════
// HELPERS
// ══════════════════════════════
async function saveSite(site: Website) {
  await supabase.from("websites").update({
    content: site.content,
    status: site.status,
    updated_at: new Date().toISOString(),
  }).eq("id", site.id);
}

async function deleteSite(id: number) {
  await supabase.from("websites").delete().eq("id", id);
}

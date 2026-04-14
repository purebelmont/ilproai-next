'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// ──── Data ────

const PROMPTS = [
  { icon: '🍕', text: '주말 메뉴 이벤트' },
  { icon: '☕', text: '신메뉴 출시' },
  { icon: '🎉', text: '오픈 기념 할인' },
  { icon: '📸', text: '후기 이벤트' },
  { icon: '💇', text: '시즌 할인' },
  { icon: '💪', text: '회원 모집' },
  { icon: '🐕', text: '일상 공유' },
  { icon: '🎁', text: '감사 이벤트' },
];

// 키워드 → 영어 검색어 매핑 (Unsplash는 영어 검색이 더 정확)
const KO_TO_EN: Record<string, string> = {
  갈비: 'korean beef ribs soup', 탕: 'korean soup', 찜: 'korean stew', 국밥: 'korean rice soup',
  피자: 'pizza', 치킨: 'fried chicken', 삼겹: 'korean pork belly', 불고기: 'bulgogi',
  한식: 'korean food', 카페: 'coffee cafe', 커피: 'coffee latte', 라떼: 'latte art',
  빵: 'bakery bread', 케이크: 'cake dessert', 디저트: 'dessert',
  미용: 'hair salon', 헤어: 'hairstyle', 네일: 'nail art', 뷰티: 'beauty salon',
  헬스: 'gym fitness', 운동: 'workout', 요가: 'yoga', 필라테스: 'pilates',
  강아지: 'cute puppy', 고양이: 'cute cat', 반려: 'pet dog',
  학원: 'classroom education', 교육: 'education study',
  꽃: 'flowers bouquet', 인테리어: 'interior design', 사무실: 'modern office',
  음식: 'korean food', 맛집: 'delicious food restaurant', 식당: 'restaurant interior',
};

function getPhoto(text: string, i = 0) {
  // 키워드에서 영어 검색어 추출
  let query = 'korean business';
  for (const [ko, en] of Object.entries(KO_TO_EN)) {
    if (text.includes(ko)) { query = en; break; }
  }
  // Unsplash Source — 검색어 기반 랜덤 이미지 (무료, API 키 불필요)
  return `https://source.unsplash.com/600x600/?${encodeURIComponent(query)}&sig=${i + Date.now() % 100}`;
}

// Video scene templates
const VIDEO_TEMPLATES = [
  { id: 'hook', name: '후크→CTA', icon: '⚡', scenes: ['🍕 주말에 피자 두 판?!', '화덕에서 갓 구운 바삭한 모짜렐라', '금~일 라지 주문 시 1판 무료!', '📍 지금 주문하세요!'] },
  { id: 'list', name: 'TOP 리스트', icon: '📊', scenes: ['☕ 봄 신메뉴 TOP 3', '3️⃣ 피치 스파클링', '2️⃣ 그린티 블로썸', '1️⃣ 딸기 로즈 라떼'] },
  { id: 'before', name: '비포/애프터', icon: '✨', scenes: ['BEFORE 💇 칙칙한 머리..', '✂️ 원장 직접 시술', 'AFTER ✨ 완전 다른 사람!', '오픈 기념 30% OFF'] },
  { id: 'review', name: '고객 후기', icon: '⭐', scenes: ['"진짜 인생 맛집..."', '⭐⭐⭐⭐⭐ 네이버 4.9점', '직접 경험해보세요!'] },
];

// ──── Component ────

interface Post { id: string; prompt: string; text: string }

export function SNSPanel({ embedded }: { embedded?: boolean }) {
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [posts, setPosts] = useState<Post[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // Video state
  const [videoTemplate, setVideoTemplate] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoScene, setVideoScene] = useState(0);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Video auto-play
  useEffect(() => {
    if (!videoPlaying) return;
    const scenes = VIDEO_TEMPLATES[videoTemplate].scenes;
    const iv = setInterval(() => setVideoScene(p => (p + 1) % scenes.length), 2500);
    return () => clearInterval(iv);
  }, [videoPlaying, videoTemplate]);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  async function generate(promptText: string) {
    setLoading(true);
    const id = Date.now().toString();
    setPosts([{ id, prompt: promptText, text: '' }]);

    const fullPrompt = `다음 내용으로 인스타그램용 SNS 게시물을 만들어주세요:\n\n${promptText}\n[톤: 친근한] [길이: 5~8줄 정도로]\n해시태그도 포함해주세요.`;
    try {
      const res = await fetch('/api/sns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          const current = full;
          setPosts(prev => prev.map(p => p.id === id ? { ...p, text: current } : p));
        }
      }
    } catch {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, text: '오류가 발생했어요. 다시 시도해주세요.' } : p));
    }
    setLoading(false);
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    generate(input.trim());
    setInput('');
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const scenes = VIDEO_TEMPLATES[videoTemplate].scenes;

  return (
    <div className={embedded ? "h-full flex flex-col" : "min-h-screen flex flex-col"} style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <style>{`
        @keyframes igSpin { to { transform: rotate(360deg); } }
        @keyframes igPulse { 0%,100%{opacity:.3} 50%{opacity:.7} }
        @keyframes sceneFade { from{opacity:0;transform:scale(1.05)} to{opacity:1;transform:scale(1)} }
        .ig-ring{background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);padding:2px;border-radius:50%}
        .ig-scroll::-webkit-scrollbar{display:none} .ig-scroll{scrollbar-width:none}
      `}</style>

      {/* ═══ Outer wrapper — centers phone on desktop, full on mobile ═══ */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto ig-scroll py-4 px-4">
        {/* Phone frame */}
        <div className="w-full max-w-[420px] flex flex-col rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', maxHeight: embedded ? 'calc(100vh - 120px)' : 'calc(100vh - 32px)' }}>

          {/* ═══ App Header ═══ */}
          <div className="shrink-0 flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              {!embedded && (
                <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </Link>
              )}
              <span className="text-base font-bold">SNS</span>
            </div>
            {/* Mode toggle */}
            <div className="flex rounded-full p-0.5" style={{ background: 'var(--bg-hover)' }}>
              <button onClick={() => setMode('image')}
                className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
                style={{ background: mode === 'image' ? '#0095F6' : 'transparent', color: mode === 'image' ? '#fff' : 'var(--text-muted)' }}>
                이미지
              </button>
              <button onClick={() => setMode('video')}
                className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
                style={{ background: mode === 'video' ? '#0095F6' : 'transparent', color: mode === 'video' ? '#fff' : 'var(--text-muted)' }}>
                동영상
              </button>
            </div>
          </div>

          {/* ═══ Scrollable Content ═══ */}
          <div ref={feedRef} className="flex-1 overflow-y-auto ig-scroll">

            {/* ══════════════════════════════════════ */}
            {/* ═══ IMAGE MODE ═══ */}
            {/* ══════════════════════════════════════ */}
            {mode === 'image' && (
              <>
                {/* Stories row */}
                <div className="px-3 py-3 flex gap-3 overflow-x-auto ig-scroll" style={{ borderBottom: '1px solid var(--border)' }}>
                  {PROMPTS.map((s, i) => (
                    <button key={i} onClick={() => !loading && generate(s.text)}
                      disabled={loading}
                      className="flex flex-col items-center gap-1 shrink-0 disabled:opacity-30 active:scale-90 transition-transform" style={{ width: 58 }}>
                      <div className="ig-ring">
                        <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-lg" style={{ background: 'var(--bg)' }}>
                          {s.icon}
                        </div>
                      </div>
                      <span className="text-[9px] truncate w-full text-center" style={{ color: 'var(--text-muted)' }}>{s.text}</span>
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <form onSubmit={submit} className="flex items-center gap-2">
                    <div className="ig-ring shrink-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--bg)' }}>AI</div>
                    </div>
                    <input id="ig-input" value={input} onChange={e => setInput(e.target.value)} disabled={loading}
                      placeholder="무엇을 홍보할까요?"
                      className="flex-1 bg-transparent text-sm focus:outline-none disabled:opacity-40"
                      style={{ color: 'var(--text)' }} />
                    {input.trim() ? (
                      <button type="submit" disabled={loading} className="text-sm font-bold disabled:opacity-30" style={{ color: '#0095F6' }}>생성</button>
                    ) : (
                      <button type="button" onClick={() => !loading && generate(PROMPTS[Math.floor(Math.random() * PROMPTS.length)].text)}
                        disabled={loading} className="text-[11px] font-semibold px-2.5 py-1 rounded-full disabled:opacity-30" style={{ background: '#0095F6', color: '#fff' }}>
                        자동생성
                      </button>
                    )}
                  </form>
                </div>

                {/* Loading skeleton */}
                {loading && posts[0]?.text === '' && (
                  <div style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-full" style={{ background: 'var(--bg-hover)' }} />
                      <div className="h-3 rounded" style={{ background: 'var(--bg-hover)', width: 100 }} />
                    </div>
                    <div className="aspect-square" style={{ background: 'var(--bg-card)', animation: 'igPulse 1.5s ease infinite' }} />
                    <div className="px-4 py-3 space-y-2">
                      <div className="h-3 rounded" style={{ background: 'var(--bg-hover)', width: '80%' }} />
                      <div className="h-3 rounded" style={{ background: 'var(--bg-hover)', width: '50%' }} />
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {posts.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ border: '2px solid var(--border)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="var(--text-muted)"/></svg>
                    </div>
                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>SNS 게시물을 만들어 보세요</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>스토리를 탭하거나, 자동생성을 눌러보세요</div>
                  </div>
                )}

                {/* Post Feed */}
                {posts.filter(p => p.text).map((post, idx) => (
                  <div key={post.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    {/* Post header */}
                    <div className="flex items-center gap-2.5 px-4 py-2.5">
                      <div className="ig-ring">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--bg)' }}>AI</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold truncate">{post.prompt}</div>
                      </div>
                      <button onClick={() => copy(post.text, post.id)} style={{ color: 'var(--text-muted)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                      </button>
                    </div>
                    {/* Image */}
                    <div className="aspect-square relative overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                      <img src={getPhoto(post.prompt, idx)} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
                    </div>
                    {/* Actions */}
                    <div className="flex items-center px-4 py-2">
                      <div className="flex items-center gap-4 flex-1">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </div>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    {/* Caption */}
                    <div className="px-4 pb-3">
                      <div className={`text-[13px] whitespace-pre-wrap leading-relaxed ${expanded.has(post.id) ? '' : 'line-clamp-4'}`}
                        style={{ color: 'var(--text-secondary)' }}>
                        {post.text}
                      </div>
                      {post.text.split('\n').length > 4 && (
                        <button onClick={() => toggleExpand(post.id)} className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {expanded.has(post.id) ? '접기' : '더 보기'}
                        </button>
                      )}
                    </div>
                    {/* Copy */}
                    <div className="px-4 pb-3">
                      <button onClick={() => copy(post.text, post.id)}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                        style={{ background: copied === post.id ? 'var(--bg-hover)' : '#0095F6', color: '#fff' }}>
                        {copied === post.id ? '✓ 복사됨' : '📋 복사'}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ══════════════════════════════════════ */}
            {/* ═══ VIDEO MODE ═══ */}
            {/* ══════════════════════════════════════ */}
            {mode === 'video' && (
              <>
                {/* Template selector */}
                <div className="px-4 py-3 flex gap-2 overflow-x-auto ig-scroll" style={{ borderBottom: '1px solid var(--border)' }}>
                  {VIDEO_TEMPLATES.map((t, i) => (
                    <button key={t.id} onClick={() => { setVideoTemplate(i); setVideoPlaying(false); setVideoScene(0); }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                      style={{
                        background: videoTemplate === i ? '#0095F6' : 'var(--bg-hover)',
                        color: videoTemplate === i ? '#fff' : 'var(--text-secondary)',
                      }}>
                      <span>{t.icon}</span> {t.name}
                    </button>
                  ))}
                </div>

                {/* Loading state */}
                {videoLoading && (
                  <div className="px-8 py-12 text-center">
                    <div className="w-10 h-10 rounded-full mx-auto mb-3" style={{ border: '3px solid var(--bg-hover)', borderTopColor: '#0095F6', animation: 'igSpin 0.8s linear infinite' }} />
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>동영상을 만들고 있어요...</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>잠시만 기다려주세요</div>
                  </div>
                )}

                {/* Empty state — before generation */}
                {!videoGenerated && !videoLoading && (
                  <div className="px-8 py-12 text-center">
                    <div className="text-4xl mb-3">🎬</div>
                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>템플릿을 선택하고</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>아래 "동영상 만들기" 버튼을 눌러주세요</div>
                  </div>
                )}

                {/* Phone preview — 9:16 vertical video */}
                {videoGenerated && !videoLoading && <div className="px-8 py-6">
                  <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '9/16', background: '#111' }}>
                    {/* Background image */}
                    <img src={getPhoto(scenes[videoScene] || '', videoScene)} alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    {/* Scene content */}
                    <div className="absolute inset-0 flex items-center justify-center p-8"
                      style={{ animation: videoPlaying ? 'sceneFade 0.5s ease' : 'none' }}>
                      <div className="text-center">
                        <div className="text-white text-xl font-black leading-tight drop-shadow-lg"
                          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                          {scenes[videoScene]}
                        </div>
                      </div>
                    </div>
                    {/* Progress dots */}
                    <div className="absolute top-3 left-3 right-3 flex gap-1">
                      {scenes.map((_, i) => (
                        <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-300"
                          style={{ background: i === videoScene ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                      ))}
                    </div>
                    {/* Play/pause overlay */}
                    {!videoPlaying && (
                      <button onClick={() => setVideoPlaying(true)}
                        className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="8 5 19 12 8 19 8 5"/></svg>
                        </div>
                      </button>
                    )}
                    {videoPlaying && (
                      <button onClick={() => setVideoPlaying(false)} className="absolute inset-0" />
                    )}
                    {/* Reels UI overlay */}
                    <div className="absolute bottom-4 right-3 flex flex-col items-center gap-4">
                      <div className="flex flex-col items-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <span className="text-[10px] text-white mt-0.5">1.2K</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <span className="text-[10px] text-white mt-0.5">48</span>
                      </div>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </div>
                    <div className="absolute bottom-4 left-3 right-14">
                      <div className="text-white text-[11px] font-semibold">@our_store</div>
                      <div className="text-white/60 text-[10px] mt-0.5 truncate">{VIDEO_TEMPLATES[videoTemplate].name} 템플릿</div>
                    </div>
                  </div>
                </div>}

                {/* Scene editor — only after generation */}
                <div className="px-4 pb-6">
                {videoGenerated && (<>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">장면 편집</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{scenes.length}컷</span>
                  </div>
                  <div className="space-y-2">
                    {scenes.map((scene, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button onClick={() => { setVideoScene(i); setVideoPlaying(false); }}
                          className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold transition-all"
                          style={{ background: videoScene === i ? '#0095F6' : 'var(--bg-hover)', color: videoScene === i ? '#fff' : 'var(--text-muted)' }}>
                          {i + 1}
                        </button>
                        <div className="flex-1 text-[12px] py-2 px-3 rounded-lg" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                          {scene}
                        </div>
                      </div>
                    ))}
                  </div>
                </>)}
                  {/* Generate button */}
                  <button onClick={() => {
                    setVideoLoading(true);
                    setVideoGenerated(false);
                    setVideoPlaying(false);
                    const tmpl = Math.floor(Math.random() * VIDEO_TEMPLATES.length);
                    setVideoTemplate(tmpl);
                    setVideoScene(0);
                    setTimeout(() => { setVideoLoading(false); setVideoGenerated(true); setVideoPlaying(true); }, 2000);
                  }}
                    disabled={videoLoading}
                    className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-transform disabled:opacity-50"
                    style={{ background: '#0095F6' }}>
                    {videoLoading ? '생성 중...' : '🎬 동영상 만들기'}
                  </button>
                </div>
              </>
            )}

            <div className="h-16" />
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SNSPage() {
  return <SNSPanel />;
}

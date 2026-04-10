'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// ──── Data ────

const STORY_PROMPTS = [
  { icon: '🍕', text: '주말 메뉴 이벤트' },
  { icon: '☕', text: '신메뉴 출시 알림' },
  { icon: '🎉', text: '오픈 기념 할인' },
  { icon: '📸', text: '고객 후기 이벤트' },
  { icon: '💇', text: '시즌 할인 홍보' },
  { icon: '💪', text: '신규 회원 모집' },
  { icon: '🐕', text: '귀여운 일상 공유' },
  { icon: '🎁', text: '감사 이벤트' },
];

const PHOTO_DB: Record<string, string[]> = {
  피자: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=600&fit=crop',
  ],
  미용: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=600&fit=crop',
  ],
  카페: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=600&fit=crop',
  ],
  헬스: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop',
  ],
  반려동물: [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop',
  ],
  학원: [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1523050854058-8df90110c6f6?w=600&h=600&fit=crop',
  ],
  기본: [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=600&h=600&fit=crop',
  ],
};

function getPhoto(category: string, index = 0): string {
  const key = Object.keys(PHOTO_DB).find(k => category.includes(k)) || '기본';
  const photos = PHOTO_DB[key];
  return photos[index % photos.length];
}

function detectCategory(text: string): string {
  const t = text.toLowerCase();
  if (/피자|음식|식당|치킨|맛집|메뉴|점심/.test(t)) return '피자';
  if (/미용|헤어|살롱|네일|뷰티/.test(t)) return '미용';
  if (/카페|커피|라떼|신메뉴/.test(t)) return '카페';
  if (/헬스|운동|피트|요가|회원/.test(t)) return '헬스';
  if (/반려|펫|강아지|고양이|동물|귀여운/.test(t)) return '반려동물';
  if (/학원|교육|특강/.test(t)) return '학원';
  return '기본';
}

// ──── Component ────

interface Post { id: string; prompt: string; text: string }

export function SNSPanel({ embedded }: { embedded?: boolean }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [usedStories, setUsedStories] = useState<Set<number>>(new Set());
  const feedRef = useRef<HTMLDivElement>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  async function generate(promptText: string) {
    setLoading(true);
    const id = Date.now().toString();
    const newPost: Post = { id, prompt: promptText, text: '' };
    setPosts(prev => [newPost, ...prev]);

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
      setPosts(prev => prev.map(p => p.id === id ? { ...p, text: '생성 중 오류가 발생했어요. 다시 시도해주세요.' } : p));
    }
    setLoading(false);
    setTimeout(() => feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    generate(input.trim());
    setInput('');
  };

  const tapStory = (i: number) => {
    if (loading) return;
    setUsedStories(prev => new Set(prev).add(i));
    generate(STORY_PROMPTS[i].text);
  };

  // SVG icons as components for cleanliness
  const Heart = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
  const Comment = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
  const Send = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
  const Bookmark = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;

  return (
    <div className={embedded ? "h-full flex flex-col overflow-hidden" : "min-h-screen flex flex-col"} style={{ background: '#000', color: '#fff' }}>
      <style>{`
        @keyframes igSpin { to { transform: rotate(360deg); } }
        @keyframes igPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        .ig-ring { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); padding: 2px; border-radius: 50%; }
        .ig-ring-used { background: #333; padding: 2px; border-radius: 50%; }
        .ig-hide-scroll::-webkit-scrollbar { display: none; }
        .ig-hide-scroll { scrollbar-width: none; }
      `}</style>

      {/* ═══ Header ═══ */}
      <header className="shrink-0 px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid #262626' }}>
        <div className="flex items-center gap-2">
          {!embedded && (
            <Link href="/dashboard" className="text-white/40 hover:text-white/70 mr-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </Link>
          )}
          <span className="text-lg font-semibold" style={{ fontFamily: '-apple-system, sans-serif' }}>
            {embedded ? 'SNS' : '일프로 SNS'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {loading && (
            <div className="w-4 h-4 rounded-full mr-2"
              style={{ border: '2px solid #333', borderTopColor: '#0095F6', animation: 'igSpin 0.6s linear infinite' }} />
          )}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/80">
            <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
          </svg>
        </div>
      </header>

      {/* ═══ Scrollable Feed ═══ */}
      <div ref={feedRef} className="flex-1 overflow-y-auto ig-hide-scroll">

        {/* Stories row */}
        <div className="px-4 py-3 overflow-x-auto ig-hide-scroll flex gap-4" style={{ borderBottom: '1px solid #262626' }}>
          {/* "새 글" story (always first) */}
          <button onClick={() => document.getElementById('ig-input')?.focus()}
            className="flex flex-col items-center gap-1 shrink-0 active:scale-95 transition-transform" style={{ width: 64 }}>
            <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center relative" style={{ border: '1px dashed #555' }}>
              <span className="text-2xl">✏️</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0095F6' }}>+</div>
            </div>
            <span className="text-[10px] text-white/50">새 글</span>
          </button>
          {STORY_PROMPTS.map((s, i) => (
            <button key={i} onClick={() => tapStory(i)} disabled={loading}
              className="flex flex-col items-center gap-1 shrink-0 disabled:opacity-30 active:scale-95 transition-transform" style={{ width: 64 }}>
              <div className={usedStories.has(i) ? 'ig-ring-used' : 'ig-ring'}>
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-lg" style={{ background: '#000' }}>
                  {s.icon}
                </div>
              </div>
              <span className="text-[10px] text-white/50 truncate w-full text-center">{s.text.slice(0, 6)}</span>
            </button>
          ))}
        </div>

        {/* Input bar — like Instagram's comment/DM input */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #262626' }}>
          <form onSubmit={submit} className="flex items-center gap-3">
            <div className="ig-ring shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#000', color: '#fff' }}>AI</div>
            </div>
            <input id="ig-input" value={input} onChange={e => setInput(e.target.value)} disabled={loading}
              placeholder="무엇을 홍보할까요?"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none disabled:opacity-40" />
            {input.trim() && (
              <button type="submit" disabled={loading}
                className="text-sm font-bold shrink-0 disabled:opacity-30"
                style={{ color: '#0095F6' }}>
                생성
              </button>
            )}
          </form>
        </div>

        {/* Empty state */}
        {posts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ border: '2px solid #333' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="#555"/></svg>
            </div>
            <div className="text-sm font-semibold text-white/60 mb-1">AI가 SNS 게시물을 만들어 드려요</div>
            <div className="text-xs text-white/30">위에 주제를 입력하거나, 스토리를 탭하세요</div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && posts[0]?.text === '' && (
          <div style={{ borderBottom: '1px solid #262626' }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full" style={{ background: '#262626' }} />
              <div className="h-3 rounded" style={{ background: '#262626', width: 100 }} />
            </div>
            <div className="aspect-square" style={{ background: '#111', animation: 'igPulse 1.5s ease infinite' }} />
            <div className="px-4 py-3 space-y-2">
              <div className="h-3 rounded" style={{ background: '#262626', width: '80%' }} />
              <div className="h-3 rounded" style={{ background: '#262626', width: '60%' }} />
              <div className="h-3 rounded" style={{ background: '#262626', width: '40%' }} />
            </div>
          </div>
        )}

        {/* ═══ Post Feed ═══ */}
        {posts.filter(p => p.text).map((post, idx) => {
          const cat = detectCategory(post.prompt);
          return (
            <div key={post.id} style={{ borderBottom: '1px solid #262626' }}>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-2.5">
                <div className="ig-ring">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#000' }}>AI</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate">{post.prompt}</div>
                </div>
                <button onClick={() => copy(post.text, post.id)} className="text-white/40 hover:text-white/70 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </div>

              {/* Image */}
              <div className="aspect-square relative overflow-hidden" style={{ background: '#111' }}>
                <img src={getPhoto(cat, idx)} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
              </div>

              {/* Actions */}
              <div className="flex items-center px-4 py-2.5">
                <div className="flex items-center gap-4 flex-1">
                  <span className="cursor-pointer hover:opacity-50 transition-opacity">{Heart}</span>
                  <span className="cursor-pointer hover:opacity-50 transition-opacity">{Comment}</span>
                  <span className="cursor-pointer hover:opacity-50 transition-opacity">{Send}</span>
                </div>
                <span className="cursor-pointer hover:opacity-50 transition-opacity">{Bookmark}</span>
              </div>

              {/* Caption */}
              <div className="px-4 pb-4">
                <div className="text-[13px] text-white/90 whitespace-pre-wrap leading-relaxed"
                  style={{ display: '-webkit-box', WebkitLineClamp: 8, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.text}
                </div>
                {post.text.split('\n').length > 8 && (
                  <button className="text-[13px] text-white/40 mt-1">더 보기</button>
                )}
              </div>

              {/* Copy button */}
              <div className="px-4 pb-3">
                <button onClick={() => copy(post.text, post.id)}
                  className="text-[12px] font-semibold px-4 py-2 rounded-lg transition-all active:scale-95"
                  style={{ background: copied === post.id ? '#262626' : '#0095F6', color: '#fff' }}>
                  {copied === post.id ? '✓ 복사됨' : '📋 텍스트 복사'}
                </button>
              </div>
            </div>
          );
        })}

        {/* Bottom spacer for embedded mode */}
        <div className="h-20" />
      </div>
    </div>
  );
}

export default function SNSPage() {
  return <SNSPanel />;
}

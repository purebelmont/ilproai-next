'use client';

import { useState, useEffect } from 'react';

const TEMPLATES = [
  { id: 'hook-cta', name: '후크 → CTA', desc: '관심 끌기 → 행동 유도', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop' },
  { id: 'listicle', name: 'TOP 리스트', desc: '순위형 콘텐츠', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop' },
  { id: 'before-after', name: '비포/애프터', desc: '변화 비교', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop' },
  { id: 'review', name: '고객 후기', desc: '리뷰 하이라이트', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop' },
];

const SAMPLE_SCENES: Record<string, string[]> = {
  'hook-cta': ['🍕 주말에 피자가 두 판?!', '화덕에서 갓 구운 바삭한 모짜렐라', '금~일 라지 주문 시 1판 무료!', '📍 지금 주문하세요!'],
  listicle: ['☕ 봄 신메뉴 TOP 3', '3️⃣ 피치 스파클링', '2️⃣ 그린티 블로썸', '1️⃣ 딸기 로즈 라떼'],
  'before-after': ['BEFORE 💇 칙칙한 머리..', '✂️ 원장 직접 시술', 'AFTER ✨ 완전 다른 사람!', '오픈 기념 30% OFF'],
  review: ['"여기 진짜 인생 맛집..."', '⭐⭐⭐⭐⭐ 네이버 4.9점', '직접 경험해보세요!'],
};

export default function VideoPanel() {
  const [selectedTemplate, setSelectedTemplate] = useState('hook-cta');
  const [scenes, setScenes] = useState<string[]>(['', '', '', '']);
  const [playing, setPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);

  const template = TEMPLATES.find(t => t.id === selectedTemplate)!;

  // Auto-play scenes
  useEffect(() => {
    if (!playing) { setCurrentScene(0); return; }
    const filled = scenes.filter(s => s.trim());
    if (filled.length < 2) { setPlaying(false); return; }
    const interval = setInterval(() => {
      setCurrentScene(prev => (prev + 1) % filled.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [playing, scenes]);

  const fillExample = () => {
    const example = SAMPLE_SCENES[selectedTemplate] || SAMPLE_SCENES['hook-cta'];
    setScenes([...example, ...Array(4 - example.length).fill('')].slice(0, 4));
  };

  const filledScenes = scenes.filter(s => s.trim());

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-4">
          <div className="text-2xl mb-1">🎬</div>
          <h2 className="text-base font-bold">숏폼 비디오 만들기</h2>
          <p className="text-[11px] text-white/40 mt-1">장면만 적으면 비디오가 만들어져요</p>
        </div>

        {/* Template selection — small pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => { setSelectedTemplate(t.id); setPlaying(false); }}
              className="shrink-0 rounded-xl overflow-hidden transition-all"
              style={{ border: selectedTemplate === t.id ? '2px solid #0071E3' : '2px solid rgba(255,255,255,0.08)', width: 90 }}>
              <div className="aspect-square relative">
                <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white text-center px-1">{t.name}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Phone-style video preview */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#000' }}>
          {/* Reels header */}
          <div className="flex items-center justify-between px-3 py-2" style={{ background: '#111' }}>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              <span className="text-xs font-semibold text-white">릴스 미리보기</span>
            </div>
            <span className="text-[10px] text-white/40">{template.name}</span>
          </div>

          {/* Video area — 9:16 ratio */}
          <div className="aspect-[9/16] relative cursor-pointer" onClick={() => filledScenes.length >= 2 && setPlaying(!playing)}
            style={{ background: '#111', maxHeight: 500 }}>
            <img src={template.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-black/30" />

            {/* Scene text */}
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
              {filledScenes.length > 0 ? (
                <div className="text-white font-black text-xl leading-snug whitespace-pre-line transition-all duration-300"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
                  {playing ? filledScenes[currentScene] : filledScenes[0]}
                </div>
              ) : (
                <div className="text-white/30 text-sm">아래에 장면을 입력하세요</div>
              )}
            </div>

            {/* Progress bar */}
            {playing && (
              <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-3">
                {filledScenes.map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full" style={{
                    background: i <= currentScene ? '#fff' : 'rgba(255,255,255,0.25)',
                  }} />
                ))}
              </div>
            )}

            {/* Play button */}
            {!playing && filledScenes.length >= 2 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                  <span className="text-black text-xl ml-1">▶</span>
                </div>
              </div>
            )}
          </div>

          {/* Reels side icons */}
          <div className="flex items-center gap-4 px-4 py-2.5" style={{ background: '#111' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span className="ml-auto text-[10px] text-white/40">{filledScenes.length} 장면</span>
          </div>
        </div>

        {/* Scene inputs — simple */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/50">장면 입력</span>
            <button onClick={fillExample} className="text-[10px] px-2 py-1 rounded text-white/40 hover:text-white/60" style={{ background: 'rgba(255,255,255,0.06)' }}>
              예시 채우기
            </button>
          </div>
          {scenes.map((text, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-[10px] text-white/30 w-4 text-right shrink-0">{i + 1}</span>
              <input value={text} onChange={e => { const n = [...scenes]; n[i] = e.target.value; setScenes(n); setPlaying(false); }}
                placeholder={i === 0 ? '후크 — 시선 끄는 첫 문장' : i === 3 ? 'CTA — 행동 유도' : `장면 ${i + 1}`}
                className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }} />
            </div>
          ))}
        </div>

        {/* 상세 설정 */}
        <details className="mb-4">
          <summary className="text-[11px] text-white/30 cursor-pointer hover:text-white/50 select-none">⚙️ 상세 설정</summary>
          <div className="mt-2 p-3 rounded-lg space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <label className="text-[10px] text-white/40 block mb-1">화면 비율</label>
              <div className="flex gap-1.5">
                {['세로 (릴스)', '정사각형', '가로'].map(r => (
                  <button key={r} className="px-2 py-1 rounded text-[10px]" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1">장면당 시간</label>
              <div className="flex gap-1.5">
                {['2초', '3초', '5초'].map(t => (
                  <button key={t} className="px-2 py-1 rounded text-[10px]" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        </details>

        {/* Action button */}
        <button disabled={filledScenes.length < 2}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
          style={{ background: '#0071E3' }}
          onClick={() => alert('비디오 다운로드는 준비 중이에요!')}>
          🎬 비디오 다운로드 (준비중)
        </button>
      </div>
    </div>
  );
}

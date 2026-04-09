'use client';

import { useState } from 'react';

interface Hashtag {
  tag: string;
  posts: string;
  reach: string;
  competition: 'low' | 'medium' | 'high';
  recommended: boolean;
}

const HASHTAG_DATA: Record<string, Hashtag[]> = {
  카페: [
    { tag: '#울산카페', posts: '45.2K', reach: '12K', competition: 'medium', recommended: true },
    { tag: '#카페추천', posts: '892K', reach: '35K', competition: 'high', recommended: false },
    { tag: '#울산남구카페', posts: '8.3K', reach: '5K', competition: 'low', recommended: true },
    { tag: '#봄음료', posts: '23K', reach: '15K', competition: 'low', recommended: true },
    { tag: '#시즌메뉴', posts: '67K', reach: '20K', competition: 'medium', recommended: true },
    { tag: '#카페스타그램', posts: '2.1M', reach: '50K', competition: 'high', recommended: false },
    { tag: '#신메뉴출시', posts: '12K', reach: '8K', competition: 'low', recommended: true },
    { tag: '#분위기좋은카페', posts: '156K', reach: '25K', competition: 'medium', recommended: true },
    { tag: '#데이트카페', posts: '78K', reach: '18K', competition: 'medium', recommended: false },
    { tag: '#핑크라떼', posts: '3.2K', reach: '4K', competition: 'low', recommended: true },
  ],
  음식점: [
    { tag: '#울산맛집', posts: '120K', reach: '30K', competition: 'high', recommended: true },
    { tag: '#맛스타그램', posts: '5.6M', reach: '80K', competition: 'high', recommended: false },
    { tag: '#울산남구맛집', posts: '15K', reach: '8K', competition: 'low', recommended: true },
    { tag: '#주말이벤트', posts: '34K', reach: '12K', competition: 'low', recommended: true },
    { tag: '#화덕피자', posts: '28K', reach: '10K', competition: 'medium', recommended: true },
    { tag: '#배달맛집', posts: '245K', reach: '40K', competition: 'high', recommended: false },
    { tag: '#가족외식', posts: '42K', reach: '15K', competition: 'medium', recommended: true },
    { tag: '#이벤트', posts: '1.2M', reach: '60K', competition: 'high', recommended: false },
  ],
  뷰티: [
    { tag: '#울산미용실', posts: '12K', reach: '6K', competition: 'low', recommended: true },
    { tag: '#헤어스타그램', posts: '1.8M', reach: '45K', competition: 'high', recommended: false },
    { tag: '#울산남구미용실', posts: '3.5K', reach: '3K', competition: 'low', recommended: true },
    { tag: '#오픈이벤트', posts: '45K', reach: '15K', competition: 'medium', recommended: true },
    { tag: '#커트할인', posts: '8K', reach: '5K', competition: 'low', recommended: true },
    { tag: '#프리미엄살롱', posts: '22K', reach: '10K', competition: 'medium', recommended: true },
  ],
};

const compColor = { low: '#30D158', medium: '#FFD60A', high: '#FF453A' };
const compLabel = { low: '낮음', medium: '보통', high: '높음' };

export default function HashtagPanel() {
  const [category, setCategory] = useState('카페');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const hashtags = HASHTAG_DATA[category] || HASHTAG_DATA['카페'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  const copySelected = () => {
    navigator.clipboard.writeText([...selectedTags].join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalReach = hashtags
    .filter(h => selectedTags.has(h.tag))
    .reduce((sum, h) => sum + parseInt(h.reach.replace('K', '000').replace('M', '000000')), 0);

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-base font-bold">해시태그 분석</h3>
        <p className="text-xs text-white/40">인기도와 경쟁도를 분석하여 최적의 해시태그를 추천합니다</p>
      </div>

      {/* 카테고리 */}
      <div className="flex gap-2 mb-5">
        {['카페', '음식점', '뷰티'].map(c => (
          <button
            key={c}
            onClick={() => { setCategory(c); setSelectedTags(new Set()); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: category === c ? 'rgba(0,113,227,0.3)' : 'rgba(255,255,255,0.05)',
              color: category === c ? '#fff' : 'rgba(255,255,255,0.5)',
              border: '1px solid ' + (category === c ? 'rgba(0,113,227,0.5)' : 'rgba(255,255,255,0.1)'),
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 선택된 태그 요약 */}
      {selectedTags.size > 0 && (
        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(0,113,227,0.1)', border: '1px solid rgba(0,113,227,0.2)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white/60">선택된 해시태그 ({selectedTags.size}개)</span>
            <button
              onClick={copySelected}
              className="text-xs px-3 py-1 rounded-lg font-medium"
              style={{ background: copied ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.1)', color: copied ? '#30D158' : '#fff' }}
            >
              {copied ? '✓ 복사됨' : '📋 전체 복사'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[...selectedTags].map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,113,227,0.2)', color: '#5AC8FA' }}>
                {tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-white/40">
            예상 총 도달: <span className="font-bold text-white">{(totalReach / 1000).toFixed(1)}K</span>
          </div>
        </div>
      )}

      {/* 해시태그 리스트 */}
      <div className="space-y-2">
        {hashtags.map((h, i) => (
          <div
            key={i}
            onClick={() => toggleTag(h.tag)}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
            style={{
              background: selectedTags.has(h.tag) ? 'rgba(0,113,227,0.1)' : 'rgba(255,255,255,0.03)',
              border: selectedTags.has(h.tag) ? '1px solid rgba(0,113,227,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="w-5 h-5 rounded flex items-center justify-center text-xs shrink-0" style={{
              background: selectedTags.has(h.tag) ? '#0071E3' : 'rgba(255,255,255,0.1)',
            }}>
              {selectedTags.has(h.tag) ? '✓' : ''}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: '#5AC8FA' }}>{h.tag}</span>
                {h.recommended && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(48,209,88,0.15)', color: '#30D158' }}>
                    추천
                  </span>
                )}
              </div>
              <div className="text-xs text-white/40">게시물 {h.posts}</div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-bold text-white/70">{h.reach} 도달</div>
              <div className="flex items-center gap-1 justify-end">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: compColor[h.competition] }} />
                <span className="text-[10px]" style={{ color: compColor[h.competition] }}>경쟁 {compLabel[h.competition]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 전략 팁 */}
      <div className="rounded-xl p-4 mt-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-xs font-bold text-white/40 mb-2">💡 해시태그 전략 팁</div>
        <ul className="text-xs text-white/50 space-y-1">
          <li>• 경쟁 낮음 + 추천 태그를 5-7개 사용하면 노출 확률 UP</li>
          <li>• 경쟁 높은 인기 태그는 2-3개만 섞어 사용</li>
          <li>• 지역 태그(#울산남구)는 필수 포함</li>
        </ul>
      </div>
    </div>
  );
}

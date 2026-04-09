'use client';

import { useState } from 'react';

interface ABVersion {
  id: string;
  label: string;
  content: string;
  tone: string;
  score: number;
}

const DEMO_AB: Record<string, ABVersion[]> = {
  카페: [
    {
      id: 'a', label: 'A안 — 감성 스타일', tone: '감성적',
      content: `☕ 봄바람이 불어오는 오후,\n향긋한 딸기 로즈 라떼 한 잔으로\n작은 행복을 선물하세요 🌸\n\n지금, 당신을 위한 봄이 피어납니다.\n\n#봄카페 #딸기라떼 #카페추천 #울산카페`,
      score: 78,
    },
    {
      id: 'b', label: 'B안 — 직접적 스타일', tone: '직접적',
      content: `🍓 신메뉴 출시! 딸기 로즈 라떼 5,500원\n\n✅ 국내산 딸기 100%\n✅ 장미 시럽 블렌딩\n✅ 인스타 감성 비주얼\n\n📍 울산 남구 카페거리\n⏰ 3/15부터 한정 판매!\n\n#울산카페 #신메뉴 #딸기라떼 #시즌한정`,
      score: 85,
    },
  ],
  피자: [
    {
      id: 'a', label: 'A안 — 유머 스타일', tone: '유머러스',
      content: `🍕 금요일이 왜 좋으냐고요?\n피자가 두 판이니까요! 🤤\n\n이번 주말 1+1 이벤트\n화덕피자의 진심을 두 배로!\n\n친구 태그하고 같이 먹어요~\n\n#피자 #주말이벤트 #1플러스1 #울산맛집`,
      score: 82,
    },
    {
      id: 'b', label: 'B안 — 프리미엄 스타일', tone: '프리미엄',
      content: `🔥 400°C 화덕에서 90초.\n장인이 만든 나폴리 스타일 피자.\n\n이번 주말, 라지 피자 주문 시\n같은 메뉴 1판을 선물합니다.\n\n프리미엄 모짜렐라의 참맛,\n직접 경험해보세요.\n\n#화덕피자 #울산피자 #프리미엄피자`,
      score: 71,
    },
  ],
  기본: [
    {
      id: 'a', label: 'A안 — 친근한 스타일', tone: '친근함',
      content: `안녕하세요! 😊\n저희 가게에 특별한 소식이 있어요!\n\n이번 주 방문해주시는 모든 분께\n깜짝 선물을 준비했답니다 🎁\n\n자세한 내용은 매장에서 확인하세요~\n\n#이벤트 #특별이벤트 #우리동네맛집`,
      score: 75,
    },
    {
      id: 'b', label: 'B안 — 긴급 스타일', tone: '긴급/FOMO',
      content: `⚡ [한정] 이번 주만!\n\n선착순 50명에게 드리는\n특별한 혜택을 놓치지 마세요.\n\n🕐 마감까지 3일 남았습니다.\n\n지금 바로 방문하세요!\n📍위치: 울산 남구\n\n#한정이벤트 #선착순 #놓치면후회`,
      score: 88,
    },
  ],
};

export default function ABTestPanel() {
  const [category, setCategory] = useState('카페');
  const [selected, setSelected] = useState<string | null>(null);

  const versions = DEMO_AB[category] || DEMO_AB['기본'];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold">A/B 테스트</h3>
          <p className="text-xs text-white/40">같은 주제, 다른 스타일 — 더 효과적인 버전을 선택하세요</p>
        </div>
      </div>

      {/* 카테고리 선택 */}
      <div className="flex gap-2 mb-5">
        {['카페', '피자', '기본'].map(c => (
          <button
            key={c}
            onClick={() => { setCategory(c); setSelected(null); }}
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

      {/* A/B 카드 비교 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {versions.map(v => (
          <div
            key={v.id}
            onClick={() => setSelected(v.id)}
            className="rounded-xl p-4 cursor-pointer transition-all"
            style={{
              background: selected === v.id ? 'rgba(0,113,227,0.1)' : 'rgba(255,255,255,0.05)',
              border: selected === v.id ? '2px solid #0071E3' : '2px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold">{v.label}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {v.tone}
              </span>
            </div>

            <div className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed mb-4 min-h-[120px]">
              {v.content}
            </div>

            {/* 예상 성과 */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${v.score}%`,
                    background: v.score > 80 ? '#30D158' : v.score > 70 ? '#FFD60A' : '#FF453A',
                  }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: v.score > 80 ? '#30D158' : v.score > 70 ? '#FFD60A' : '#FF453A' }}>
                {v.score}점
              </span>
            </div>

            {selected === v.id && (
              <div className="mt-3 text-center">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#0071E3', color: '#fff' }}>
                  ✓ 이 버전 선택
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)' }}>
          <span className="text-sm font-bold" style={{ color: '#30D158' }}>
            ✓ {versions.find(v => v.id === selected)?.label} 선택됨 — 게시 예약으로 이동할 수 있습니다
          </span>
        </div>
      )}
    </div>
  );
}

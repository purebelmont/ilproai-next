'use client';

import { useState } from 'react';

const SAMPLE_CONTENT = {
  instagram: `☕ 봄바람이 불어오는 오후,\n향긋한 딸기 로즈 라떼 한 잔으로\n작은 행복을 선물하세요 🌸\n\n지금, 당신을 위한 봄이 피어납니다.\n\n📍 울산 남구 카페거리\n⏰ 매일 9:00~22:00`,
  hashtags: '#봄카페 #딸기라떼 #카페추천 #울산카페 #울산남구카페 #봄음료 #시즌메뉴 #신메뉴출시 #분위기좋은카페 #핑크라떼',
  blog: `### ☕ [울산 카페 추천] 봄 시즌 한정 메뉴 3종 출시!\n\n안녕하세요, OO카페입니다!\n\n올해도 어김없이 봄 시즌 메뉴를 준비했어요.\n이번 봄에는 꽃과 과일을 테마로 3가지 특별한 음료를 만들었습니다.\n\n🌸 딸기 로즈 라떼 (5,500원)\n🍃 그린티 블로썸 (5,500원)\n🍑 피치 스파클링 (5,500원)\n\n판매 기간: 3/15 ~ 5/31`,
  facebook: `🌸 봄이 왔어요! 시즌 한정 메뉴 3종 출시\n\n딸기 로즈 라떼, 그린티 블로썸, 피치 스파클링 ☕\n\n봄 향기 가득한 음료, 소중한 사람과 함께 마셔보세요!\n"같이 카페 가자~" 하고 싶은 친구를 태그해주세요 💕`,
};

export default function EditPanel() {
  const [content, setContent] = useState(SAMPLE_CONTENT);
  const [activeField, setActiveField] = useState<keyof typeof SAMPLE_CONTENT>('instagram');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const charCount = content[activeField].length;
  const maxChars: Record<string, number> = { instagram: 2200, hashtags: 500, blog: 10000, facebook: 5000 };
  const platformLabels: Record<string, { label: string; icon: string; color: string }> = {
    instagram: { label: '인스타그램 캡션', icon: '📸', color: '#E1306C' },
    hashtags: { label: '해시태그', icon: '#️⃣', color: '#5AC8FA' },
    blog: { label: '블로그 본문', icon: '📝', color: '#03C75A' },
    facebook: { label: '페이스북 게시글', icon: '👥', color: '#1877F2' },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold">콘텐츠 수정</h3>
          <p className="text-xs text-white/40">AI가 생성한 콘텐츠를 직접 수정하고 저장하세요</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
          style={{ background: saved ? '#30D158' : '#0071E3' }}
        >
          {saved ? '✓ 저장됨' : '💾 저장'}
        </button>
      </div>

      {/* 플랫폼 탭 */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {Object.entries(platformLabels).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setActiveField(key as keyof typeof SAMPLE_CONTENT)}
            className="px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{
              background: activeField === key ? 'rgba(0,113,227,0.3)' : 'transparent',
              color: activeField === key ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          >
            {val.icon} {val.label}
          </button>
        ))}
      </div>

      {/* 에디터 */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <span>{platformLabels[activeField].icon}</span>
            <span className="text-sm font-bold" style={{ color: platformLabels[activeField].color }}>
              {platformLabels[activeField].label}
            </span>
          </div>
          <span className="text-xs text-white/40">
            {charCount} / {maxChars[activeField]}
          </span>
        </div>

        <textarea
          value={content[activeField]}
          onChange={(e) => setContent(prev => ({ ...prev, [activeField]: e.target.value }))}
          className="w-full p-4 text-sm leading-relaxed focus:outline-none resize-none"
          style={{
            background: 'rgba(255,255,255,0.02)',
            color: '#fff',
            minHeight: 250,
          }}
        />

        {/* 글자 수 바 */}
        <div className="px-4 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((charCount / maxChars[activeField]) * 100, 100)}%`,
                background: charCount > maxChars[activeField] * 0.9 ? '#FF453A' : '#0071E3',
              }}
            />
          </div>
        </div>
      </div>

      {/* 미리보기 */}
      <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-xs font-bold text-white/40 mb-2">미리보기</div>
        <div className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">
          {content[activeField]}
        </div>
      </div>
    </div>
  );
}

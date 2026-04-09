'use client';

import { useState, useEffect } from 'react';

interface VideoTemplate {
  id: string;
  name: string;
  desc: string;
  duration: string;
  aspect: '9:16' | '1:1' | '16:9';
  gradient: string;
  scenes: { text: string; duration: number; bg?: string }[];
}

const TEMPLATES: VideoTemplate[] = [
  {
    id: 'hook-story-cta',
    name: '후크 → 스토리 → CTA',
    desc: '관심 끌기 → 정보 전달 → 행동 유도',
    duration: '15-30초',
    aspect: '9:16',
    gradient: 'linear-gradient(135deg, #FF6B35, #D62828)',
    scenes: [
      { text: '🍕 주말에 피자가\n두 판이라고?!', duration: 2500, bg: 'linear-gradient(135deg, #FF6B35, #FF8C42)' },
      { text: '화덕에서 갓 구운\n바삭한 모짜렐라 피자', duration: 3000, bg: 'linear-gradient(135deg, #D62828, #FF6B35)' },
      { text: '금~일 라지 주문 시\n같은 메뉴 1판 무료!', duration: 3000, bg: 'linear-gradient(135deg, #FF8C42, #D62828)' },
      { text: '📍 울산 남구\n📞 052-123-4567\n지금 주문하세요!', duration: 2500, bg: 'linear-gradient(135deg, #D62828, #FF6B35)' },
    ],
  },
  {
    id: 'listicle',
    name: '리스트 카운트다운',
    desc: 'TOP 3, 꿀팁 5가지 등 리스트형 콘텐츠',
    duration: '15-45초',
    aspect: '9:16',
    gradient: 'linear-gradient(135deg, #6F4E37, #C08552)',
    scenes: [
      { text: '울산 카페\n봄 신메뉴 TOP 3 ☕', duration: 2500, bg: 'linear-gradient(135deg, #6F4E37, #A67C52)' },
      { text: '3️⃣\n피치 스파클링\n톡 쏘는 복숭아 에이드', duration: 3000, bg: 'linear-gradient(135deg, #FF9F7F, #C08552)' },
      { text: '2️⃣\n그린티 블로썸\n벚꽃잎 올린 말차', duration: 3000, bg: 'linear-gradient(135deg, #7CB342, #558B2F)' },
      { text: '1️⃣\n딸기 로즈 라떼\n장미향 가득 핑크 라떼', duration: 3000, bg: 'linear-gradient(135deg, #E91E63, #AD1457)' },
      { text: '각 5,500원\n3/15부터 한정 판매! 🌸', duration: 2500, bg: 'linear-gradient(135deg, #6F4E37, #C08552)' },
    ],
  },
  {
    id: 'before-after',
    name: '비포 → 애프터',
    desc: '변화를 극적으로 보여주는 비교형',
    duration: '10-20초',
    aspect: '9:16',
    gradient: 'linear-gradient(135deg, #C77DFF, #7B2CBF)',
    scenes: [
      { text: 'BEFORE 💇\n\n칙칙한 머리..', duration: 2500, bg: 'linear-gradient(135deg, #555, #333)' },
      { text: '✂️\n원장 직접 시술\n1:1 맞춤 상담', duration: 2500, bg: 'linear-gradient(135deg, #9C27B0, #7B2CBF)' },
      { text: 'AFTER ✨\n\n완전 다른 사람!', duration: 2500, bg: 'linear-gradient(135deg, #E040FB, #AA00FF)' },
      { text: '오픈 기념 30% OFF\n지금 예약하세요! 💜', duration: 2500, bg: 'linear-gradient(135deg, #C77DFF, #7B2CBF)' },
    ],
  },
  {
    id: 'quote-card',
    name: '명언 / 후기 카드',
    desc: '고객 후기나 명언을 감성적으로 표현',
    duration: '8-15초',
    aspect: '1:1',
    gradient: 'linear-gradient(135deg, #0077B6, #00B4D8)',
    scenes: [
      { text: '"여기 피자 진짜\n인생 피자예요..."', duration: 3000, bg: 'linear-gradient(135deg, #0077B6, #023E8A)' },
      { text: '⭐⭐⭐⭐⭐\n\n네이버 리뷰 4.9점', duration: 2500, bg: 'linear-gradient(135deg, #0096C7, #0077B6)' },
      { text: '직접 경험해보세요!\n📍 울산 남구', duration: 2500, bg: 'linear-gradient(135deg, #00B4D8, #0077B6)' },
    ],
  },
];

// ──── 큰 비디오 프리뷰 (독립 영역) ────
function BigVideoPreview({ template, isPlaying, onToggle }: {
  template: VideoTemplate; isPlaying: boolean; onToggle: () => void;
}) {
  const [currentScene, setCurrentScene] = useState(0);
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (!isPlaying) { setCurrentScene(0); setAnimClass(''); return; }

    let timeout: ReturnType<typeof setTimeout>;
    const playScene = (index: number) => {
      if (index >= template.scenes.length) {
        // 루프
        setAnimClass('');
        timeout = setTimeout(() => playScene(0), 300);
        return;
      }
      // 페이드인 애니메이션
      setAnimClass('opacity-0 scale-90');
      setTimeout(() => {
        setCurrentScene(index);
        setAnimClass('opacity-100 scale-100');
      }, 200);

      timeout = setTimeout(() => playScene(index + 1), template.scenes[index].duration);
    };
    playScene(0);

    return () => clearTimeout(timeout);
  }, [isPlaying, template]);

  const scene = template.scenes[currentScene];
  const isVertical = template.aspect === '9:16';
  const isSquare = template.aspect === '1:1';
  const sceneImgs = SCENE_IMAGES[template.id] || [];

  return (
    <div className="flex flex-col items-center">
      {/* 비디오 프레임 */}
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer shadow-2xl"
        style={{
          width: isVertical ? 280 : isSquare ? 320 : 400,
          aspectRatio: isVertical ? '9/16' : isSquare ? '1/1' : '16/9',
          background: scene?.bg || template.gradient,
          transition: 'background 0.5s ease',
        }}
        onClick={onToggle}
      >
        {/* 배경 이미지 */}
        {sceneImgs[currentScene] && (
          <img
            src={sceneImgs[currentScene]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms]"
            style={{ opacity: isPlaying ? 0.5 : 0.4, transform: isPlaying ? 'scale(1.05)' : 'scale(1)' }}
          />
        )}
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />

        {/* 장면 텍스트 */}
        <div
          className={`absolute inset-0 flex items-center justify-center p-6 text-center transition-all duration-300 ${animClass}`}
        >
          <div className="text-white font-black text-xl leading-snug whitespace-pre-line" style={{ textShadow: '0 3px 12px rgba(0,0,0,0.5)' }}>
            {scene?.text || template.scenes[0].text}
          </div>
        </div>

        {/* 진행 바 */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-3">
          {template.scenes.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{
              background: i < currentScene ? '#fff' : i === currentScene ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
              boxShadow: i === currentScene ? '0 0 6px rgba(255,255,255,0.5)' : 'none',
            }} />
          ))}
        </div>

        {/* 재생/정지 오버레이 */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.9)' }}>
              <span className="text-black text-2xl ml-1">▶</span>
            </div>
            <div className="absolute bottom-6 text-white/60 text-xs font-medium">클릭하여 재생</div>
          </div>
        )}

        {isPlaying && (
          <div className="absolute top-3 right-3">
            <div className="flex gap-0.5">
              <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
              <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      {/* 장면 인디케이터 */}
      {isPlaying && (
        <div className="mt-3 text-xs text-white/50">
          장면 {currentScene + 1} / {template.scenes.length}
        </div>
      )}
    </div>
  );
}

// ──── Canvas 비디오 렌더링 + 다운로드 ────
function parseGradient(bg: string): [string, string] {
  const match = bg.match(/#[0-9A-Fa-f]{6}/g);
  if (match && match.length >= 2) return [match[0], match[1]];
  return ['#333333', '#111111'];
}

// 장면별 배경 이미지 (Unsplash CDN)
const SCENE_IMAGES: Record<string, string[]> = {
  'hook-story-cta': [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&h=1920&fit=crop',
  ],
  listicle: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&h=1920&fit=crop',
  ],
  'before-after': [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1080&h=1920&fit=crop',
  ],
  'quote-card': [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1080&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1080&h=1080&fit=crop',
  ],
};

// 이미지 미리 로드
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

async function renderVideoToBlob(template: VideoTemplate, onProgress?: (p: number) => void): Promise<Blob> {
  const w = template.aspect === '9:16' ? 1080 : template.aspect === '1:1' ? 1080 : 1920;
  const h = template.aspect === '9:16' ? 1920 : template.aspect === '1:1' ? 1080 : 1080;

  // 이미지 미리 로드
  const imageUrls = SCENE_IMAGES[template.id] || [];
  const images: (HTMLImageElement | null)[] = await Promise.all(
    template.scenes.map((_, i) =>
      imageUrls[i] ? loadImage(imageUrls[i]).catch(() => null) : Promise.resolve(null)
    )
  );

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
      ? 'video/webm; codecs=vp9'
      : 'video/webm',
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
  });

  recorder.start();

  const totalFrames = template.scenes.reduce((sum, s) => sum + Math.round((s.duration / 1000) * 30), 0);
  let frameCount = 0;

  for (let si = 0; si < template.scenes.length; si++) {
    const scene = template.scenes[si];
    const [c1, c2] = parseGradient(scene.bg || template.gradient);
    const frames = Math.round((scene.duration / 1000) * 30);
    const img = images[si];

    for (let f = 0; f < frames; f++) {
      // 배경 그라데이션
      const grd = ctx.createLinearGradient(0, 0, w, h);
      grd.addColorStop(0, c1);
      grd.addColorStop(1, c2);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // 배경 이미지 (켄 번즈 효과 — 천천히 줌인)
      if (img) {
        const zoomProgress = f / frames;
        const scale = 1 + zoomProgress * 0.1; // 1.0 → 1.1 줌인
        const sw = w / scale;
        const sh = h / scale;
        const sx = (img.naturalWidth - (img.naturalWidth * sw / w)) / 2;
        const sy = (img.naturalHeight - (img.naturalHeight * sh / h)) / 2;

        ctx.globalAlpha = 0.6; // 이미지 + 그라데이션 블렌딩
        ctx.drawImage(
          img,
          sx, sy, img.naturalWidth * sw / w, img.naturalHeight * sh / h,
          0, 0, w, h
        );
        ctx.globalAlpha = 1;

        // 어두운 오버레이 (텍스트 가독성)
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, w, h);
      }

      // 페이드인 (처음 8프레임)
      const alpha = Math.min(f / 8, 1);
      ctx.globalAlpha = alpha;

      // 텍스트
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = scene.text.split('\n');
      const fontSize = Math.round(w * 0.065);
      ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetY = 5;

      const lineHeight = fontSize * 1.5;
      const startY = h / 2 - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, i) => {
        ctx.fillText(line, w / 2, startY + i * lineHeight);
      });

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.globalAlpha = 1;

      frameCount++;
      if (onProgress) onProgress(Math.round((frameCount / totalFrames) * 100));

      await new Promise(r => setTimeout(r, 33));
    }
  }

  recorder.stop();
  return done;
}

// ──── 업종별 이미지 매핑 ────
const CATEGORY_IMAGES: Record<string, string[]> = {
  음식점: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1080&h=1920&fit=crop',
  ],
  카페: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&h=1920&fit=crop',
  ],
  뷰티: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1080&h=1920&fit=crop',
  ],
  운동: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1080&h=1920&fit=crop',
  ],
  반려동물: [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1080&h=1920&fit=crop',
  ],
  교육: [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1523050854058-8df90110c6f6?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1080&h=1920&fit=crop',
  ],
  기타: [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1080&h=1920&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1080&h=1920&fit=crop',
  ],
};

const GRADIENTS: Record<string, string[]> = {
  음식점: ['linear-gradient(135deg, #FF6B35, #D62828)', 'linear-gradient(135deg, #D62828, #FF6B35)', 'linear-gradient(135deg, #FF8C42, #D62828)'],
  카페: ['linear-gradient(135deg, #6F4E37, #C08552)', 'linear-gradient(135deg, #C08552, #6F4E37)', 'linear-gradient(135deg, #A67C52, #4E342E)'],
  뷰티: ['linear-gradient(135deg, #C77DFF, #7B2CBF)', 'linear-gradient(135deg, #E040FB, #AA00FF)', 'linear-gradient(135deg, #9C27B0, #7B2CBF)'],
  운동: ['linear-gradient(135deg, #2D6A4F, #40916C)', 'linear-gradient(135deg, #40916C, #2D6A4F)', 'linear-gradient(135deg, #1B5E20, #4CAF50)'],
  반려동물: ['linear-gradient(135deg, #FF9F1C, #FFBF69)', 'linear-gradient(135deg, #FFBF69, #FF9F1C)', 'linear-gradient(135deg, #F57F17, #FFC107)'],
  교육: ['linear-gradient(135deg, #0077B6, #00B4D8)', 'linear-gradient(135deg, #00B4D8, #0077B6)', 'linear-gradient(135deg, #01579B, #0288D1)'],
  기타: ['linear-gradient(135deg, #0071E3, #5856D6)', 'linear-gradient(135deg, #5856D6, #0071E3)', 'linear-gradient(135deg, #1A237E, #3F51B5)'],
};

// 사용자 입력으로 커스텀 템플릿 생성
function buildCustomTemplate(
  templateId: string,
  scenes: string[],
  category: string,
  aspect: '9:16' | '1:1' | '16:9',
): VideoTemplate {
  const base = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const grads = GRADIENTS[category] || GRADIENTS['기타'];

  return {
    ...base,
    aspect,
    gradient: grads[0],
    scenes: scenes.map((text, i) => ({
      text,
      duration: 2500,
      bg: grads[i % grads.length],
    })),
  };
}

export default function VideoPanel() {
  const [step, setStep] = useState<'input' | 'preview' | 'done'>('input');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('hook-story-cta');
  const [playing, setPlaying] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [progress, setProgress] = useState(0);

  // 사용자 입력
  const [category, setCategory] = useState('음식점');
  const [aspect, setAspect] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [sceneTexts, setSceneTexts] = useState<string[]>([
    '',
    '',
    '',
    '',
  ]);

  // 커스텀 템플릿
  const [customTemplate, setCustomTemplate] = useState<VideoTemplate | null>(null);
  const selectedT = customTemplate;

  // 장면 텍스트에 기본 예시 채우기
  const fillExample = () => {
    const baseT = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];
    setSceneTexts(baseT.scenes.map(s => s.text));
  };

  const updateScene = (idx: number, text: string) => {
    setSceneTexts(prev => {
      const next = [...prev];
      next[idx] = text;
      return next;
    });
  };

  const addScene = () => {
    if (sceneTexts.length < 8) setSceneTexts(prev => [...prev, '']);
  };

  const removeScene = (idx: number) => {
    if (sceneTexts.length > 2) setSceneTexts(prev => prev.filter((_, i) => i !== idx));
  };

  const goToPreview = () => {
    const filled = sceneTexts.filter(t => t.trim());
    if (filled.length < 2) { alert('최소 2개의 장면을 입력해주세요.'); return; }

    // 커스텀 템플릿 빌드 + SCENE_IMAGES 업데이트
    const catImages = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['기타'];
    const tmpl = buildCustomTemplate(selectedTemplate, filled, category, aspect);

    // SCENE_IMAGES에 커스텀 키 추가
    SCENE_IMAGES['custom'] = filled.map((_, i) => catImages[i % catImages.length]);

    setCustomTemplate({ ...tmpl, id: 'custom' });
    setStep('preview');
    setGenerated(false);
    setVideoBlob(null);
  };

  const handleGenerate = async () => {
    if (!selectedT) return;
    setGenerating(true);
    setProgress(0);

    try {
      const blob = await renderVideoToBlob(selectedT, (p) => setProgress(p));
      setVideoBlob(blob);
      setProgress(100);
      setGenerated(true);
    } catch {
      alert('비디오 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (platformName: string) => {
    if (!videoBlob || !selectedT) return;
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedT.name}_${platformName}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-base font-bold">비디오 생성</h3>
        <p className="text-xs text-white/40">
          {step === 'input' ? '내용을 입력하면 AI가 숏폼 비디오를 만들어줍니다' : '미리보기를 확인하고 비디오를 생성하세요'}
        </p>
      </div>

      {/* ── STEP 1: 사용자 입력 ── */}
      {step === 'input' && (
        <div>
          {/* 1. 템플릿 선택 */}
          <div className="mb-5">
            <label className="text-xs font-bold text-white/50 mb-2 block">1. 영상 스타일</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className="rounded-xl p-3 text-left transition-all"
                  style={{
                    background: selectedTemplate === t.id ? 'rgba(0,113,227,0.15)' : 'rgba(255,255,255,0.03)',
                    border: selectedTemplate === t.id ? '2px solid #0071E3' : '2px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="w-full aspect-[3/2] rounded-lg mb-2 flex items-center justify-center text-xs font-bold text-white/70" style={{ background: t.gradient }}>
                    {t.name.split(' ')[0]}
                  </div>
                  <div className="text-[11px] font-bold truncate">{t.name}</div>
                  <div className="text-[10px] text-white/40">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 업종 + 비율 */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-bold text-white/50 mb-2 block">2. 업종 (배경 이미지)</label>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(CATEGORY_IMAGES).map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: category === c ? 'rgba(0,113,227,0.3)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid ' + (category === c ? 'rgba(0,113,227,0.5)' : 'rgba(255,255,255,0.1)'),
                      color: category === c ? '#fff' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-white/50 mb-2 block">3. 화면 비율</label>
              <div className="flex gap-2">
                {([['9:16', '세로 (릴스/쇼츠)'], ['1:1', '정사각형'], ['16:9', '가로 (유튜브)']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setAspect(val)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: aspect === val ? 'rgba(0,113,227,0.3)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid ' + (aspect === val ? 'rgba(0,113,227,0.5)' : 'rgba(255,255,255,0.1)'),
                      color: aspect === val ? '#fff' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. 장면 입력 */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white/50">4. 장면 내용 (각 장면 2-3초)</label>
              <button onClick={fillExample} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)', color: '#5AC8FA' }}>
                예시 채우기
              </button>
            </div>
            <div className="space-y-2">
              {sceneTexts.map((text, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    {i + 1}
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => updateScene(i, e.target.value)}
                    placeholder={
                      i === 0 ? '후크 — 시선을 끄는 첫 문장 (예: 🍕 주말에 피자가 두 판?!)' :
                      i === sceneTexts.length - 1 ? 'CTA — 행동 유도 (예: 지금 주문하세요!)' :
                      `장면 ${i + 1} — 핵심 메시지`
                    }
                    rows={2}
                    className="flex-1 px-3 py-2 rounded-lg text-sm resize-none focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                    }}
                  />
                  {sceneTexts.length > 2 && (
                    <button onClick={() => removeScene(i)} className="text-white/30 hover:text-red-400 text-xs shrink-0 mt-1">✕</button>
                  )}
                </div>
              ))}
            </div>
            {sceneTexts.length < 8 && (
              <button onClick={addScene} className="mt-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                + 장면 추가
              </button>
            )}
          </div>

          {/* 미리보기 버튼 */}
          <button
            onClick={goToPreview}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white"
            style={{ background: '#0071E3' }}
          >
            미리보기 →
          </button>
        </div>
      )}

      {/* ── STEP 2: 미리보기 + 생성 ── */}
      {step === 'preview' && selectedT && (
        <div>
          <button
            onClick={() => { setStep('input'); setPlaying(null); }}
            className="text-xs font-medium mb-4 transition-all hover:opacity-80"
            style={{ color: '#5AC8FA' }}
          >
            ← 내용 수정하기
          </button>
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 왼쪽: 큰 프리뷰 */}
            <div className="flex justify-center">
              <BigVideoPreview
                template={selectedT}
                isPlaying={playing === selectedT.id}
                onToggle={() => setPlaying(playing === selectedT.id ? null : selectedT.id)}
              />
            </div>

            {/* 오른쪽: 정보 + 액션 */}
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold mb-1">{selectedT.name}</h4>
              <p className="text-sm text-white/50 mb-4">{selectedT.desc}</p>

              {/* 스펙 */}
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }}>⏱ {selectedT.duration}</span>
                <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }}>📐 {selectedT.aspect}</span>
                <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }}>🎬 {selectedT.scenes.length}컷</span>
              </div>

              {/* 장면 목록 */}
              <div className="mb-5">
                <div className="text-xs font-bold text-white/40 mb-2">장면 구성</div>
                <div className="space-y-1.5">
                  {selectedT.scenes.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 font-bold" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        {i + 1}
                      </span>
                      <span className="text-white/70 truncate">{s.text.replace(/\n/g, ' ')}</span>
                      <span className="text-white/30 shrink-0">{(s.duration / 1000).toFixed(1)}초</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 타겟 플랫폼 */}
              <div className="mb-5">
                <div className="text-xs font-bold text-white/40 mb-2">게시 플랫폼</div>
                <div className="flex gap-2">
                  {['📸 인스타 릴스', '▶️ 유튜브 쇼츠', '🎵 틱톡'].map((p, i) => (
                    <span key={i} className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>{p}</span>
                  ))}
                </div>
              </div>

              {/* 생성 버튼 */}
              {!generated ? (
                <div>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-70"
                    style={{ background: generating ? 'rgba(255,255,255,0.1)' : '#0071E3' }}
                  >
                    {generating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block animate-spin">⚡</span> 비디오 렌더링 중... {progress}%
                      </span>
                    ) : (
                      '🎬 비디오 생성하기'
                    )}
                  </button>
                  {generating && (
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: '#0071E3' }} />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ background: 'rgba(48,209,88,0.1)' }}>
                    <span style={{ color: '#30D158' }}>✓</span>
                    <span className="text-sm font-medium" style={{ color: '#30D158' }}>
                      비디오 생성 완료! ({videoBlob ? (videoBlob.size / 1024 / 1024).toFixed(1) + 'MB' : ''})
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['인스타 릴스', '유튜브 쇼츠', '틱톡'].map((platform, i) => (
                      <div key={i} className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="text-lg mb-1">{['📸', '▶️', '🎵'][i]}</div>
                        <div className="text-[11px] font-medium">{platform}</div>
                        <div className="text-[10px] text-white/30">1080x1920</div>
                        <button
                          onClick={() => handleDownload(platform)}
                          className="mt-2 text-[11px] px-3 py-1 rounded-lg font-medium transition-all hover:opacity-80"
                          style={{ background: 'rgba(0,113,227,0.3)', color: '#5AC8FA' }}
                        >
                          ⬇ 다운로드
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setGenerated(false); setVideoBlob(null); }}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      🔄 다시 생성
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: '#0071E3' }}>
                      📅 게시 예약하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

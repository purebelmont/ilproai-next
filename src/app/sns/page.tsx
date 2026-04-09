'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ABTestPanel from '@/components/sns/ABTestPanel';
import HashtagPanel from '@/components/sns/HashtagPanel';
import EditPanel from '@/components/sns/EditPanel';
import VideoPanel from '@/components/sns/VideoPanel';

// 업종별 Unsplash 키워드 + 카드 스타일
const QUICK_PROMPTS = [
  { icon: '🍕', text: '피자가게 주말 이벤트 게시물', desc: '인스타 + 블로그', img: 'pizza+restaurant', gradient: 'linear-gradient(135deg, #FF6B35, #D62828)' },
  { icon: '💇', text: '미용실 신규 오픈 홍보', desc: '전체 플랫폼', img: 'hair+salon', gradient: 'linear-gradient(135deg, #C77DFF, #7B2CBF)' },
  { icon: '☕', text: '카페 시즌 메뉴 출시 알림', desc: '인스타 + 페이스북', img: 'coffee+cafe+latte', gradient: 'linear-gradient(135deg, #6F4E37, #C08552)' },
  { icon: '🏋️', text: '헬스장 1월 할인 이벤트', desc: '전체 플랫폼', img: 'gym+fitness', gradient: 'linear-gradient(135deg, #2D6A4F, #40916C)' },
  { icon: '🐕', text: '반려동물 미용샵 후기 이벤트', desc: '인스타 + 블로그', img: 'dog+grooming+cute', gradient: 'linear-gradient(135deg, #FF9F1C, #FFBF69)' },
  { icon: '📚', text: '학원 겨울방학 특강 안내', desc: '블로그 + 페이스북', img: 'study+classroom', gradient: 'linear-gradient(135deg, #0077B6, #00B4D8)' },
];

const SAMPLE_CALENDAR = [
  { day: '월', platform: '인스타', type: '제품 소개', color: '#E1306C' },
  { day: '화', platform: '블로그', type: 'SEO 포스팅', color: '#03C75A' },
  { day: '수', platform: '페이스북', type: '이벤트 공유', color: '#1877F2' },
  { day: '목', platform: '인스타', type: '고객 후기', color: '#E1306C' },
  { day: '금', platform: '트위터', type: '트렌드 참여', color: '#1DA1F2' },
  { day: '토', platform: '인스타', type: '주말 이벤트', color: '#E1306C' },
  { day: '일', platform: '블로그', type: '주간 정리', color: '#03C75A' },
];

// 업종별 실제 Unsplash CDN 이미지 (확실히 로딩되는 URL)
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

// 카테고리에서 사진 가져오기 (index로 다른 사진 선택)
function getPhoto(category: string, index = 0): string {
  const key = Object.keys(PHOTO_DB).find(k => category.includes(k)) || '기본';
  const photos = PHOTO_DB[key];
  return photos[index % photos.length];
}

// 텍스트에서 업종 감지
function detectCategory(text: string): { key: string; gradient: string; title: string } {
  const lower = text.toLowerCase();
  if (lower.includes('피자') || lower.includes('음식') || lower.includes('식당') || lower.includes('치킨') || lower.includes('맛집'))
    return { key: '피자', gradient: 'linear-gradient(135deg, #FF6B35, #D62828)', title: '맛있는 한 끼' };
  if (lower.includes('미용') || lower.includes('헤어') || lower.includes('살롱'))
    return { key: '미용', gradient: 'linear-gradient(135deg, #C77DFF, #7B2CBF)', title: '스타일 변신' };
  if (lower.includes('카페') || lower.includes('커피') || lower.includes('라떼'))
    return { key: '카페', gradient: 'linear-gradient(135deg, #6F4E37, #C08552)', title: '향기로운 한 잔' };
  if (lower.includes('헬스') || lower.includes('운동') || lower.includes('피트'))
    return { key: '헬스', gradient: 'linear-gradient(135deg, #2D6A4F, #40916C)', title: '건강한 시작' };
  if (lower.includes('반려') || lower.includes('펫') || lower.includes('강아지'))
    return { key: '반려동물', gradient: 'linear-gradient(135deg, #FF9F1C, #FFBF69)', title: '사랑스러운 우리 아이' };
  if (lower.includes('학원') || lower.includes('교육') || lower.includes('특강'))
    return { key: '학원', gradient: 'linear-gradient(135deg, #0077B6, #00B4D8)', title: '배움의 시작' };
  return { key: '기본', gradient: 'linear-gradient(135deg, #0071E3, #5856D6)', title: '우리 가게 소식' };
}

// 복사 함수
function copyToClipboard(text: string, setCopied: (v: string) => void, id: string) {
  navigator.clipboard.writeText(text);
  setCopied(id);
  setTimeout(() => setCopied(''), 2000);
}

// AI 응답에서 플랫폼별 콘텐츠 파싱
function parsePlatformContent(text: string): { platform: string; icon: string; color: string; content: string }[] {
  const sections: { platform: string; icon: string; color: string; content: string }[] = [];
  const parts = text.split(/---\n*/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('인스타그램') || trimmed.includes('인스타')) {
      sections.push({ platform: 'Instagram', icon: '📸', color: '#E1306C', content: trimmed });
    } else if (trimmed.includes('블로그')) {
      sections.push({ platform: 'Blog', icon: '📝', color: '#03C75A', content: trimmed });
    } else if (trimmed.includes('페이스북')) {
      sections.push({ platform: 'Facebook', icon: '👥', color: '#1877F2', content: trimmed });
    } else if (trimmed.includes('트위터') || trimmed.includes('Twitter')) {
      sections.push({ platform: 'Twitter/X', icon: '🐦', color: '#1DA1F2', content: trimmed });
    } else if (sections.length > 0) {
      // 플랫폼 구분이 안 되면 마지막 섹션에 추가
      sections[sections.length - 1].content += '\n' + trimmed;
    } else {
      sections.push({ platform: 'Content', icon: '📄', color: '#8E8E93', content: trimmed });
    }
  }

  return sections.length > 0 ? sections : [{ platform: 'Content', icon: '📄', color: '#8E8E93', content: text }];
}

// ──── Instagram 미리보기 컴포넌트 ────
function InstaPreview({ content, imageUrl, gradient }: { content: string; imageUrl: string; gradient: string }) {
  // 첫 줄을 제목으로, 해시태그 추출
  const lines = content.split('\n').filter(l => l.trim());
  const hashtags = lines.filter(l => l.includes('#')).join(' ');
  const caption = lines.filter(l => !l.includes('## ') && !l.startsWith('---')).slice(0, 5).join('\n');

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#000', maxWidth: 340 }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-8 h-8 rounded-full" style={{ background: gradient }} />
        <div>
          <div className="text-xs font-bold text-white">our_store</div>
          <div className="text-[10px] text-white/40">울산 남구</div>
        </div>
      </div>
      {/* Image */}
      <div className="relative aspect-square" style={{ background: gradient }}>
        <img
          src={imageUrl}
          alt="post"
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {/* 텍스트 오버레이 */}
        <div className="absolute inset-0 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="text-white text-center">
            <div className="text-lg font-bold mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {lines.find(l => l.includes('**'))?.replace(/\*\*/g, '').replace(/\[.*?\]/g, '').trim().slice(0, 30) || '우리 가게 소식'}
            </div>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-4 px-3 py-2">
        <span className="text-lg">♡</span>
        <span className="text-lg">💬</span>
        <span className="text-lg">↗</span>
        <span className="ml-auto text-lg">🔖</span>
      </div>
      {/* Caption */}
      <div className="px-3 pb-3">
        <div className="text-xs text-white/60 leading-relaxed line-clamp-3">
          {caption.slice(0, 120)}...
        </div>
        {hashtags && (
          <div className="text-xs mt-1" style={{ color: '#0095F6' }}>
            {hashtags.slice(0, 100)}...
          </div>
        )}
      </div>
    </div>
  );
}

// ──── SNS 카드 템플릿 컴포넌트 ────
function SnsCard({ title, subtitle, imageUrl, gradient, style }: {
  title: string; subtitle: string; imageUrl: string; gradient: string;
  style: 'bold' | 'minimal' | 'event';
}) {
  if (style === 'event') {
    return (
      <div className="relative rounded-xl overflow-hidden aspect-square" style={{ maxWidth: 300 }}>
        <img src={imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <div className="text-[10px] font-bold tracking-widest uppercase text-white/60 mb-2">EVENT</div>
          <div className="text-xl font-black text-white mb-2 leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{title}</div>
          <div className="text-xs text-white/80">{subtitle}</div>
          <div className="mt-4 px-4 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: gradient }}>자세히 보기</div>
        </div>
      </div>
    );
  }

  if (style === 'minimal') {
    return (
      <div className="rounded-xl overflow-hidden" style={{ background: '#111', maxWidth: 300 }}>
        <div className="aspect-video relative">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div className="p-4">
          <div className="text-sm font-bold text-white mb-1">{title}</div>
          <div className="text-xs text-white/50">{subtitle}</div>
        </div>
      </div>
    );
  }

  // bold style
  return (
    <div className="relative rounded-xl overflow-hidden aspect-[4/5]" style={{ maxWidth: 300, background: gradient }}>
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <div className="text-2xl font-black text-white mb-2 leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>{title}</div>
        <div className="text-xs text-white/80">{subtitle}</div>
      </div>
    </div>
  );
}

export default function SNSPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/sns/generate' }),
  });

  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'generate' | 'abtest' | 'hashtag' | 'edit' | 'video' | 'calendar' | 'history'>('generate');
  const [copied, setCopied] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleQuickPrompt = (text: string) => {
    setLastPrompt(text);
    sendMessage({
      text: `다음 업종/상황에 맞는 SNS 게시물을 인스타그램, 네이버 블로그, 페이스북용으로 각각 생성해주세요:\n\n${text}\n\n각 플랫폼별로 톤과 길이를 다르게 해주세요. 해시태그도 포함해주세요.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setLastPrompt(input);
      sendMessage({
        text: `다음 내용으로 SNS 게시물을 인스타그램, 네이버 블로그, 페이스북용으로 각각 생성해주세요:\n\n${input}\n\n각 플랫폼별로 톤과 길이를 다르게 해주세요. 해시태그도 포함해주세요.`,
      });
      setInput('');
    }
  };

  // 현재 카테고리 감지
  const category = detectCategory(lastPrompt || input);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a1a', color: '#fff' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }} className="px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-white/50 hover:text-white text-sm">
              ← 대시보드
            </Link>
            <span className="text-white/20">|</span>
            <h1 className="text-lg font-bold">📣 AI SNS 자동화</h1>
          </div>
          <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(0,113,227,0.2)', color: '#0071E3' }}>
            DEMO
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {[
            { id: 'generate' as const, label: '생성', icon: '✨' },
            { id: 'video' as const, label: '비디오', icon: '🎬' },
            { id: 'abtest' as const, label: 'A/B', icon: '🔄' },
            { id: 'hashtag' as const, label: '해시태그', icon: '#️⃣' },
            { id: 'edit' as const, label: '수정', icon: '✏️' },
            { id: 'calendar' as const, label: '캘린더', icon: '📅' },
            { id: 'history' as const, label: '히스토리', icon: '📊' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-3 py-2.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap"
              style={{
                background: activeTab === t.id ? 'rgba(0,113,227,0.3)' : 'transparent',
                color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div>
            {/* Quick Prompts */}
            {messages.length === 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white/60 mb-3">빠른 시작 — 클릭하면 바로 생성</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {QUICK_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickPrompt(p.text)}
                      disabled={isLoading}
                      className="relative overflow-hidden rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {/* 배경 이미지 */}
                      <div className="absolute inset-0">
                        <img src={getPhoto(p.img)} alt="" className="w-full h-full object-cover opacity-30" />
                        <div className="absolute inset-0" style={{ background: p.gradient, opacity: 0.6 }} />
                      </div>
                      <div className="relative p-4">
                        <span className="text-2xl">{p.icon}</span>
                        <div className="text-sm font-bold mt-2">{p.text}</div>
                        <div className="text-xs text-white/70 mt-1">{p.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Content */}
            <div className="space-y-6 mb-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm" style={{ background: '#0071E3' }}>
                        {message.parts.map((part, i) =>
                          part.type === 'text' ? <p key={i} className="whitespace-pre-wrap">{part.text}</p> : null
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* 카드 템플릿 미리보기 */}
                      {message.parts.some(p => p.type === 'text' && (p as { text: string }).text.length > 100) && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-white/40 mb-3 uppercase tracking-wider">카드 템플릿 미리보기</h4>
                          <div className="flex gap-3 overflow-x-auto pb-3">
                            <SnsCard
                              title={category.title}
                              subtitle="지금 바로 확인하세요!"
                              imageUrl={getPhoto(category.key, 0)}
                              gradient={category.gradient}
                              style="bold"
                            />
                            <SnsCard
                              title={category.title}
                              subtitle="특별한 혜택이 기다립니다"
                              imageUrl={getPhoto(category.key, 1)}
                              gradient={category.gradient}
                              style="event"
                            />
                            <InstaPreview
                              content={message.parts.filter(p => p.type === 'text').map(p => (p as { text: string }).text).join('')}
                              imageUrl={getPhoto(category.key, 2)}
                              gradient={category.gradient}
                            />
                          </div>
                        </div>
                      )}

                      {/* 플랫폼별 콘텐츠 */}
                      <div className="space-y-3">
                        {message.parts.filter(p => p.type === 'text').map((part, i) => {
                          const textPart = part as { type: 'text'; text: string };
                          const sections = parsePlatformContent(textPart.text);

                          return sections.map((section, j) => (
                            <div key={`${i}-${j}`} className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              {/* 플랫폼 헤더 */}
                              <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{section.icon}</span>
                                  <span className="text-sm font-bold" style={{ color: section.color }}>{section.platform}</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(section.content, setCopied, `${message.id}-${j}`)}
                                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all"
                                  style={{
                                    background: copied === `${message.id}-${j}` ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.1)',
                                    color: copied === `${message.id}-${j}` ? '#30D158' : 'rgba(255,255,255,0.6)',
                                  }}
                                >
                                  {copied === `${message.id}-${j}` ? '✓ 복사됨' : '📋 복사'}
                                </button>
                              </div>
                              {/* 콘텐츠 */}
                              <div className="px-4 py-3 text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                                {section.content}
                              </div>
                            </div>
                          ));
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="space-y-3">
                  {/* 로딩 카드 */}
                  <div className="flex gap-3 overflow-x-auto pb-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-[300px] aspect-square rounded-xl animate-pulse shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    ))}
                  </div>
                  <div className="rounded-2xl px-4 py-3 text-sm animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <span className="text-white/50">AI가 콘텐츠와 카드를 생성하고 있습니다...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2" style={{ position: 'sticky', bottom: 16 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="어떤 콘텐츠를 만들까요? (예: 카페 신메뉴 출시)"
                className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: '#0071E3' }}
              >
                생성
              </button>
            </form>
          </div>
        )}

        {/* Video Tab */}
        {activeTab === 'video' && <VideoPanel />}

        {/* A/B Test Tab */}
        {activeTab === 'abtest' && <ABTestPanel />}

        {/* Hashtag Tab */}
        {activeTab === 'hashtag' && <HashtagPanel />}

        {/* Edit Tab */}
        {activeTab === 'edit' && <EditPanel />}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold">이번 주 콘텐츠 플랜</h3>
                <span className="text-xs text-white/40">자동 생성됨</span>
              </div>
              <div className="space-y-2">
                {SAMPLE_CALENDAR.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      {item.day}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.type}</div>
                      <div className="text-xs text-white/40">{item.platform}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                      예약됨
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-base font-bold mb-3">플랫폼별 최적 게시 시간</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { platform: '인스타그램', time: '오전 11시, 오후 5시', icon: '📸', color: '#E1306C' },
                  { platform: '네이버 블로그', time: '오전 9시, 오후 2시', icon: '📝', color: '#03C75A' },
                  { platform: '페이스북', time: '오후 1시, 저녁 8시', icon: '👥', color: '#1877F2' },
                  { platform: '트위터/X', time: '오전 8시, 오후 6시', icon: '🐦', color: '#1DA1F2' },
                ].map((p, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-lg mb-1">{p.icon}</div>
                    <div className="text-xs font-bold" style={{ color: p.color }}>{p.platform}</div>
                    <div className="text-xs text-white/40 mt-1">{p.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-base font-bold mb-4">성과 요약 (데모)</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '총 게시물', value: '24', change: '+8 이번 주' },
                  { label: '총 도달', value: '12.4K', change: '+32%' },
                  { label: '참여율', value: '4.2%', change: '+0.8%' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-xl font-bold">{s.value}</div>
                    <div className="text-xs text-white/50 mt-1">{s.label}</div>
                    <div className="text-xs mt-1" style={{ color: '#30D158' }}>{s.change}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-base font-bold mb-3">최근 게시물</h3>
              <div className="space-y-3">
                {[
                  { platform: '인스타그램', title: '봄 시즌 메뉴 출시!', time: '2시간 전', reach: '847', engagement: '4.8%', color: '#E1306C', cat: '카페', idx: 0 },
                  { platform: '블로그', title: '우리 카페만의 특별한 원두 이야기', time: '5시간 전', reach: '1.2K', engagement: '3.2%', color: '#03C75A', cat: '카페', idx: 1 },
                  { platform: '페이스북', title: '주말 브런치 이벤트 안내', time: '어제', reach: '2.1K', engagement: '5.1%', color: '#1877F2', cat: '피자', idx: 0 },
                  { platform: '인스타그램', title: '고객 후기 감사 이벤트', time: '2일 전', reach: '1.5K', engagement: '6.3%', color: '#E1306C', cat: '반려동물', idx: 0 },
                ].map((post, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src={getPhoto(post.cat, post.idx)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{post.title}</div>
                      <div className="text-xs text-white/40">{post.platform} · {post.time}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold">{post.reach}</div>
                      <div className="text-xs" style={{ color: '#30D158' }}>{post.engagement}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import HashtagPanel from '@/components/sns/HashtagPanel';
import VideoPanel from '@/components/sns/VideoPanel';

// 업종 카테고리 정의
const BIZ_CATEGORIES = [
  { id: 'restaurant', icon: '🍕', label: '음식점/카페', keywords: ['피자', '음식', '식당', '치킨', '맛집', '카페', '커피', '라떼'] },
  { id: 'beauty', icon: '💇', label: '미용/뷰티', keywords: ['미용', '헤어', '살롱', '네일', '뷰티'] },
  { id: 'fitness', icon: '🏋️', label: '헬스/스포츠', keywords: ['헬스', '운동', '피트', '요가', '필라테스'] },
  { id: 'pet', icon: '🐕', label: '반려동물', keywords: ['반려', '펫', '강아지', '고양이', '동물'] },
  { id: 'education', icon: '📚', label: '학원/교육', keywords: ['학원', '교육', '특강', '과외'] },
  { id: 'retail', icon: '🛍️', label: '매장/쇼핑', keywords: ['매장', '쇼핑', '편집숍', '스토어'] },
  { id: 'medical', icon: '🏥', label: '병원/의원', keywords: ['병원', '의원', '치과', '한의원'] },
  { id: 'lodging', icon: '🏨', label: '숙박/펜션', keywords: ['숙박', '펜션', '호텔', '민박'] },
];

// 업종별 퀵 프롬프트
const PROMPTS_BY_CATEGORY: Record<string, { icon: string; text: string; desc: string; img: string; gradient: string }[]> = {
  restaurant: [
    { icon: '🍕', text: '주말 특별 메뉴 이벤트', desc: '인스타 + 블로그', img: 'pizza+restaurant', gradient: 'linear-gradient(135deg, #FF6B35, #D62828)' },
    { icon: '☕', text: '시즌 신메뉴 출시 알림', desc: '인스타 + 페이스북', img: 'coffee+cafe+latte', gradient: 'linear-gradient(135deg, #6F4E37, #C08552)' },
    { icon: '🎉', text: '오픈 기념 할인 이벤트', desc: '전체 플랫폼', img: 'restaurant+party', gradient: 'linear-gradient(135deg, #E63946, #F4A261)' },
    { icon: '📸', text: '고객 후기 이벤트', desc: '인스타 + 블로그', img: 'food+review', gradient: 'linear-gradient(135deg, #264653, #2A9D8F)' },
    { icon: '🍽️', text: '점심 특선 메뉴 홍보', desc: '인스타 + 페이스북', img: 'lunch+special', gradient: 'linear-gradient(135deg, #E76F51, #F4A261)' },
    { icon: '🎁', text: '단골 고객 감사 이벤트', desc: '전체 플랫폼', img: 'gift+celebration', gradient: 'linear-gradient(135deg, #6A0572, #AB83A1)' },
  ],
  beauty: [
    { icon: '💇', text: '신규 오픈 홍보', desc: '전체 플랫폼', img: 'hair+salon', gradient: 'linear-gradient(135deg, #C77DFF, #7B2CBF)' },
    { icon: '✨', text: '시즌 할인 이벤트', desc: '인스타 + 블로그', img: 'beauty+salon', gradient: 'linear-gradient(135deg, #FF69B4, #C71585)' },
    { icon: '💅', text: '신규 스타일 소개', desc: '인스타 + 페이스북', img: 'hairstyle+beauty', gradient: 'linear-gradient(135deg, #E0AAFF, #9D4EDD)' },
    { icon: '🎀', text: '비포/애프터 후기', desc: '인스타 + 블로그', img: 'makeover+beauty', gradient: 'linear-gradient(135deg, #FF85A1, #FB6F92)' },
    { icon: '🌸', text: '봄 시즌 트렌드 컬러', desc: '인스타 + 블로그', img: 'spring+beauty', gradient: 'linear-gradient(135deg, #FFB3C6, #FF8FAB)' },
    { icon: '💝', text: '친구 추천 이벤트', desc: '전체 플랫폼', img: 'friends+gift', gradient: 'linear-gradient(135deg, #D63384, #E91E8C)' },
  ],
  fitness: [
    { icon: '🏋️', text: '신규 회원 할인 이벤트', desc: '전체 플랫폼', img: 'gym+fitness', gradient: 'linear-gradient(135deg, #2D6A4F, #40916C)' },
    { icon: '💪', text: '1:1 PT 프로그램 소개', desc: '인스타 + 블로그', img: 'personal+training', gradient: 'linear-gradient(135deg, #344E41, #588157)' },
    { icon: '🏃', text: '회원 변신 후기', desc: '인스타 + 페이스북', img: 'fitness+transformation', gradient: 'linear-gradient(135deg, #06D6A0, #118AB2)' },
    { icon: '🥗', text: '건강 식단 팁', desc: '블로그 + 인스타', img: 'healthy+food', gradient: 'linear-gradient(135deg, #52B788, #40916C)' },
    { icon: '⏰', text: '새벽반/심야반 오픈', desc: '전체 플랫폼', img: 'morning+workout', gradient: 'linear-gradient(135deg, #1B4332, #2D6A4F)' },
    { icon: '🎯', text: '여름 다이어트 챌린지', desc: '인스타 + 페이스북', img: 'summer+fitness', gradient: 'linear-gradient(135deg, #FF6B6B, #EE5A24)' },
  ],
  pet: [
    { icon: '🐕', text: '미용 후기 이벤트', desc: '인스타 + 블로그', img: 'dog+grooming+cute', gradient: 'linear-gradient(135deg, #FF9F1C, #FFBF69)' },
    { icon: '🐱', text: '신규 서비스 소개', desc: '전체 플랫폼', img: 'pet+care', gradient: 'linear-gradient(135deg, #F9C74F, #F8961E)' },
    { icon: '🎁', text: '반려동물 용품 할인', desc: '인스타 + 페이스북', img: 'pet+products', gradient: 'linear-gradient(135deg, #FFBF69, #FF9F1C)' },
    { icon: '💕', text: '귀여운 손님 자랑', desc: '인스타', img: 'cute+puppy', gradient: 'linear-gradient(135deg, #FFDDD2, #FF9F1C)' },
    { icon: '🏥', text: '건강검진 시즌 안내', desc: '블로그 + 페이스북', img: 'vet+animal', gradient: 'linear-gradient(135deg, #48BFE3, #0077B6)' },
    { icon: '📸', text: '포토 이벤트', desc: '인스타', img: 'pet+photo', gradient: 'linear-gradient(135deg, #E9C46A, #F4A261)' },
  ],
  education: [
    { icon: '📚', text: '겨울방학 특강 안내', desc: '블로그 + 페이스북', img: 'study+classroom', gradient: 'linear-gradient(135deg, #0077B6, #00B4D8)' },
    { icon: '🏆', text: '수강생 합격 후기', desc: '블로그 + 인스타', img: 'graduation+success', gradient: 'linear-gradient(135deg, #023E8A, #0096C7)' },
    { icon: '📝', text: '무료 레벨 테스트 안내', desc: '전체 플랫폼', img: 'test+education', gradient: 'linear-gradient(135deg, #00B4D8, #90E0EF)' },
    { icon: '👨‍🏫', text: '신규 강사 소개', desc: '블로그 + 페이스북', img: 'teacher+class', gradient: 'linear-gradient(135deg, #0077B6, #023E8A)' },
    { icon: '🎯', text: '시험 대비 집중반', desc: '블로그 + 인스타', img: 'exam+study', gradient: 'linear-gradient(135deg, #48CAE4, #0096C7)' },
    { icon: '🎉', text: '개강 할인 이벤트', desc: '전체 플랫폼', img: 'school+open', gradient: 'linear-gradient(135deg, #ADE8F4, #0077B6)' },
  ],
  retail: [
    { icon: '🛍️', text: '신상품 입고 알림', desc: '인스타 + 페이스북', img: 'shopping+new', gradient: 'linear-gradient(135deg, #7209B7, #560BAD)' },
    { icon: '🏷️', text: '시즌 세일 이벤트', desc: '전체 플랫폼', img: 'sale+discount', gradient: 'linear-gradient(135deg, #F72585, #B5179E)' },
    { icon: '📦', text: '베스트셀러 소개', desc: '인스타 + 블로그', img: 'bestseller+product', gradient: 'linear-gradient(135deg, #480CA8, #7209B7)' },
    { icon: '💝', text: '선물 추천 기획전', desc: '인스타 + 페이스북', img: 'gift+present', gradient: 'linear-gradient(135deg, #E63946, #F72585)' },
    { icon: '⭐', text: '고객 리뷰 이벤트', desc: '인스타 + 블로그', img: 'review+happy', gradient: 'linear-gradient(135deg, #3A0CA3, #4361EE)' },
    { icon: '🎁', text: '멤버십 혜택 안내', desc: '전체 플랫폼', img: 'membership+vip', gradient: 'linear-gradient(135deg, #7209B7, #B5179E)' },
  ],
  medical: [
    { icon: '🏥', text: '건강검진 시즌 안내', desc: '블로그 + 페이스북', img: 'hospital+health', gradient: 'linear-gradient(135deg, #0891B2, #06D6A0)' },
    { icon: '💉', text: '예방접종 안내', desc: '블로그 + 페이스북', img: 'vaccine+health', gradient: 'linear-gradient(135deg, #0077B6, #0891B2)' },
    { icon: '👨‍⚕️', text: '의료진 소개', desc: '블로그', img: 'doctor+medical', gradient: 'linear-gradient(135deg, #0E7490, #06B6D4)' },
    { icon: '📋', text: '진료 안내 / 휴진 공지', desc: '전체 플랫폼', img: 'clinic+notice', gradient: 'linear-gradient(135deg, #059669, #10B981)' },
    { icon: '🌿', text: '건강 정보 시리즈', desc: '블로그 + 인스타', img: 'wellness+health', gradient: 'linear-gradient(135deg, #047857, #059669)' },
    { icon: '⭐', text: '환자 후기', desc: '블로그 + 인스타', img: 'patient+review', gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)' },
  ],
  lodging: [
    { icon: '🏨', text: '시즌 특가 프로모션', desc: '전체 플랫폼', img: 'hotel+resort', gradient: 'linear-gradient(135deg, #059669, #34D399)' },
    { icon: '🌅', text: '객실 뷰 소개', desc: '인스타 + 블로그', img: 'ocean+view+hotel', gradient: 'linear-gradient(135deg, #F59E0B, #F97316)' },
    { icon: '🍳', text: '조식 메뉴 소개', desc: '인스타 + 페이스북', img: 'breakfast+hotel', gradient: 'linear-gradient(135deg, #92400E, #B45309)' },
    { icon: '📸', text: '투숙객 후기 이벤트', desc: '인스타 + 블로그', img: 'guest+review', gradient: 'linear-gradient(135deg, #0369A1, #0284C7)' },
    { icon: '🎉', text: '연말 패키지 안내', desc: '전체 플랫폼', img: 'holiday+celebration', gradient: 'linear-gradient(135deg, #BE185D, #EC4899)' },
    { icon: '🏊', text: '부대시설 소개', desc: '인스타 + 블로그', img: 'pool+resort', gradient: 'linear-gradient(135deg, #0E7490, #22D3EE)' },
  ],
};

// 기본 프롬프트 (카테고리 없을 때)
const DEFAULT_PROMPTS = [
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
  const [activeTab, setActiveTab] = useState<'generate' | 'hashtag' | 'video' | 'calendar' | 'history'>('generate');
  const [copied, setCopied] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [savedCategory, setSavedCategory] = useState<string | null>(null);
  const [setupDone, setSetupDone] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved category
  useEffect(() => {
    const saved = localStorage.getItem('ilpro_sns_category');
    if (saved) { setSavedCategory(saved); setSetupDone(true); }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectCategory = (id: string) => {
    localStorage.setItem('ilpro_sns_category', id);
    setSavedCategory(id);
    setSetupDone(true);
  };

  const currentBiz = BIZ_CATEGORIES.find(c => c.id === savedCategory);
  const quickPrompts = savedCategory ? (PROMPTS_BY_CATEGORY[savedCategory] || DEFAULT_PROMPTS) : DEFAULT_PROMPTS;

  const isLoading = status === 'submitted' || status === 'streaming';

  const bizContext = currentBiz ? `\n\n[업종: ${currentBiz.label}]` : '';

  const handleQuickPrompt = (text: string) => {
    setLastPrompt(text);
    sendMessage({
      text: `다음 업종/상황에 맞는 SNS 게시물을 인스타그램, 네이버 블로그, 페이스북용으로 각각 생성해주세요:\n\n${text}${bizContext}\n\n각 플랫폼별로 톤과 길이를 다르게 해주세요. 해시태그도 포함해주세요.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setLastPrompt(input);
      sendMessage({
        text: `다음 내용으로 SNS 게시물을 인스타그램, 네이버 블로그, 페이스북용으로 각각 생성해주세요:\n\n${input}${bizContext}\n\n각 플랫폼별로 톤과 길이를 다르게 해주세요. 해시태그도 포함해주세요.`,
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
          {currentBiz && (
            <button onClick={() => { setSetupDone(false); setSavedCategory(null); localStorage.removeItem('ilpro_sns_category'); }}
              className="text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 transition-colors hover:opacity-80"
              style={{ background: 'rgba(125,42,231,0.2)', color: '#A78BFA' }}>
              {currentBiz.icon} {currentBiz.label}
              <span className="text-white/30 ml-1">변경</span>
            </button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4">
        {/* Business Setup Screen */}
        {!setupDone && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-4xl mb-4">📣</div>
            <h2 className="text-2xl font-bold mb-2">어떤 업종이세요?</h2>
            <p className="text-sm text-white/50 mb-8">한번 설정하면 모든 콘텐츠가 맞춤 생성됩니다</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full">
              {BIZ_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => selectCategory(cat.id)}
                  className="flex flex-col items-center gap-2 p-5 rounded-xl transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {setupDone && <>
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {[
            { id: 'generate' as const, label: '생성', icon: '✨' },
            { id: 'video' as const, label: '비디오', icon: '🎬' },
            { id: 'hashtag' as const, label: '해시태그', icon: '#️⃣' },
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
                  {quickPrompts.map((p, i) => (
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


        {/* Hashtag Tab */}
        {activeTab === 'hashtag' && <HashtagPanel />}

        {/* Edit Tab */}

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
        </>}
      </div>
    </div>
  );
}

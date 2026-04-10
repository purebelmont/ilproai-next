'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import VideoPanel from '@/components/sns/VideoPanel';

// 업종 카테고리 정의 (16개 — 웹사이트 빌더와 동일)
const BIZ_CATEGORIES = [
  { id: 'restaurant', icon: '🍽️', label: '음식점/카페', keywords: ['피자', '음식', '식당', '치킨', '맛집', '카페', '커피', '라떼'] },
  { id: 'beauty', icon: '💇', label: '서비스/뷰티', keywords: ['미용', '헤어', '살롱', '네일', '뷰티'] },
  { id: 'retail', icon: '🛍️', label: '매장/쇼핑', keywords: ['매장', '쇼핑', '편집숍', '스토어'] },
  { id: 'office', icon: '🏢', label: '사무실/B2B', keywords: ['사무실', 'B2B', '컨설팅', 'IT'] },
  { id: 'medical', icon: '🏥', label: '병원/의원', keywords: ['병원', '의원', '치과', '한의원'] },
  { id: 'education', icon: '📚', label: '학원/교육', keywords: ['학원', '교육', '특강', '과외'] },
  { id: 'fitness', icon: '💪', label: '헬스/스포츠', keywords: ['헬스', '운동', '피트', '요가', '필라테스'] },
  { id: 'lodging', icon: '🏨', label: '숙박/펜션', keywords: ['숙박', '펜션', '호텔', '민박'] },
  { id: 'repair', icon: '🔧', label: '수리/정비', keywords: ['수리', '정비', '수선', 'AS'] },
  { id: 'legal', icon: '⚖️', label: '법률/세무', keywords: ['법률', '변호사', '세무', '회계'] },
  { id: 'realestate', icon: '🏠', label: '부동산', keywords: ['부동산', '매물', '임대', '분양'] },
  { id: 'pet', icon: '🐾', label: '반려동물', keywords: ['반려', '펫', '강아지', '고양이', '동물'] },
  { id: 'wedding', icon: '💐', label: '웨딩/이벤트', keywords: ['웨딩', '결혼', '이벤트', '파티'] },
  { id: 'manufacturing', icon: '🏭', label: '제조/공장', keywords: ['제조', '공장', '생산', '부품'] },
  { id: 'logistics', icon: '🚚', label: '물류/운송', keywords: ['물류', '운송', '배송', '택배'] },
  { id: 'freelance', icon: '💻', label: '프리랜서', keywords: ['프리랜서', '디자인', '개발', '작가'] },
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
  office: [
    { icon: '🏢', text: '서비스 소개 포스팅', desc: '블로그 + 페이스북', img: 'office+business', gradient: 'linear-gradient(135deg, #1E3A5F, #0071E3)' },
    { icon: '🤝', text: '성공 사례 공유', desc: '블로그 + 인스타', img: 'success+business', gradient: 'linear-gradient(135deg, #0F4C75, #3282B8)' },
    { icon: '📊', text: '업계 인사이트 공유', desc: '블로그 + 페이스북', img: 'data+chart', gradient: 'linear-gradient(135deg, #1B262C, #3282B8)' },
    { icon: '🎯', text: '무료 컨설팅 이벤트', desc: '전체 플랫폼', img: 'consulting+meeting', gradient: 'linear-gradient(135deg, #0F4C75, #1B262C)' },
    { icon: '👥', text: '팀 소개 / 채용 공고', desc: '인스타 + 페이스북', img: 'team+office', gradient: 'linear-gradient(135deg, #3282B8, #BBE1FA)' },
    { icon: '📝', text: '뉴스레터 홍보', desc: '블로그 + 페이스북', img: 'newsletter+email', gradient: 'linear-gradient(135deg, #1E3A5F, #3282B8)' },
  ],
  repair: [
    { icon: '🔧', text: '수리 서비스 소개', desc: '블로그 + 페이스북', img: 'repair+service', gradient: 'linear-gradient(135deg, #EA580C, #F97316)' },
    { icon: '⚡', text: '긴급 수리 안내', desc: '전체 플랫폼', img: 'emergency+repair', gradient: 'linear-gradient(135deg, #DC2626, #F97316)' },
    { icon: '📸', text: '수리 전후 비교', desc: '인스타 + 블로그', img: 'before+after', gradient: 'linear-gradient(135deg, #9A3412, #EA580C)' },
    { icon: '💰', text: '시즌 할인 이벤트', desc: '전체 플랫폼', img: 'discount+sale', gradient: 'linear-gradient(135deg, #C2410C, #FB923C)' },
    { icon: '⭐', text: '고객 만족 후기', desc: '인스타 + 블로그', img: 'review+happy', gradient: 'linear-gradient(135deg, #EA580C, #FDBA74)' },
    { icon: '📋', text: '정기 점검 안내', desc: '블로그 + 페이스북', img: 'maintenance+check', gradient: 'linear-gradient(135deg, #7C2D12, #EA580C)' },
  ],
  legal: [
    { icon: '⚖️', text: '법률 상담 안내', desc: '블로그 + 페이스북', img: 'law+justice', gradient: 'linear-gradient(135deg, #1E3A8A, #3B82F6)' },
    { icon: '📝', text: '법률 상식 시리즈', desc: '블로그', img: 'legal+document', gradient: 'linear-gradient(135deg, #1E40AF, #60A5FA)' },
    { icon: '🏆', text: '승소 사례 소개', desc: '블로그 + 인스타', img: 'success+trophy', gradient: 'linear-gradient(135deg, #1E3A8A, #2563EB)' },
    { icon: '💼', text: '세무 상담 이벤트', desc: '전체 플랫폼', img: 'tax+accounting', gradient: 'linear-gradient(135deg, #1D4ED8, #93C5FD)' },
    { icon: '👨‍⚖️', text: '변호사 프로필 소개', desc: '인스타 + 블로그', img: 'lawyer+profile', gradient: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' },
    { icon: '📰', text: '법률 뉴스 해설', desc: '블로그 + 페이스북', img: 'news+law', gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)' },
  ],
  realestate: [
    { icon: '🏠', text: '신규 매물 소개', desc: '인스타 + 블로그', img: 'house+property', gradient: 'linear-gradient(135deg, #166534, #22C55E)' },
    { icon: '📍', text: '지역 시세 분석', desc: '블로그', img: 'map+location', gradient: 'linear-gradient(135deg, #15803D, #4ADE80)' },
    { icon: '🏗️', text: '신축 분양 안내', desc: '전체 플랫폼', img: 'construction+building', gradient: 'linear-gradient(135deg, #14532D, #22C55E)' },
    { icon: '🔑', text: '계약 성사 후기', desc: '인스타 + 블로그', img: 'key+house', gradient: 'linear-gradient(135deg, #166534, #86EFAC)' },
    { icon: '📊', text: '부동산 투자 팁', desc: '블로그 + 페이스북', img: 'investment+chart', gradient: 'linear-gradient(135deg, #064E3B, #10B981)' },
    { icon: '🏡', text: '인테리어 트렌드', desc: '인스타 + 블로그', img: 'interior+design', gradient: 'linear-gradient(135deg, #047857, #34D399)' },
  ],
  wedding: [
    { icon: '💐', text: '웨딩 패키지 소개', desc: '인스타 + 블로그', img: 'wedding+bouquet', gradient: 'linear-gradient(135deg, #BE185D, #EC4899)' },
    { icon: '💍', text: '실제 웨딩 후기', desc: '인스타 + 블로그', img: 'wedding+ceremony', gradient: 'linear-gradient(135deg, #9D174D, #F472B6)' },
    { icon: '📸', text: '포토 갤러리 공개', desc: '인스타', img: 'wedding+photo', gradient: 'linear-gradient(135deg, #831843, #EC4899)' },
    { icon: '🎉', text: '시즌 프로모션', desc: '전체 플랫폼', img: 'celebration+party', gradient: 'linear-gradient(135deg, #BE185D, #FB7185)' },
    { icon: '🌸', text: '웨딩 트렌드 소개', desc: '블로그 + 인스타', img: 'wedding+trend', gradient: 'linear-gradient(135deg, #9D174D, #FBCFE8)' },
    { icon: '✨', text: '이벤트 기획 사례', desc: '블로그 + 페이스북', img: 'event+planning', gradient: 'linear-gradient(135deg, #831843, #BE185D)' },
  ],
  manufacturing: [
    { icon: '🏭', text: '생산 시설 소개', desc: '블로그 + 페이스북', img: 'factory+production', gradient: 'linear-gradient(135deg, #374151, #6B7280)' },
    { icon: '🔩', text: '신제품 출시 알림', desc: '블로그 + 인스타', img: 'product+new', gradient: 'linear-gradient(135deg, #1F2937, #4B5563)' },
    { icon: '📋', text: '품질 인증 획득', desc: '블로그 + 페이스북', img: 'quality+certificate', gradient: 'linear-gradient(135deg, #111827, #374151)' },
    { icon: '🤝', text: '파트너십 소식', desc: '블로그 + 페이스북', img: 'partnership+business', gradient: 'linear-gradient(135deg, #374151, #9CA3AF)' },
    { icon: '📊', text: '기술 블로그 포스팅', desc: '블로그', img: 'technology+innovation', gradient: 'linear-gradient(135deg, #1F2937, #6B7280)' },
    { icon: '👷', text: '채용 공고', desc: '인스타 + 페이스북', img: 'hiring+team', gradient: 'linear-gradient(135deg, #111827, #4B5563)' },
  ],
  logistics: [
    { icon: '🚚', text: '배송 서비스 소개', desc: '블로그 + 페이스북', img: 'delivery+truck', gradient: 'linear-gradient(135deg, #0369A1, #38BDF8)' },
    { icon: '📦', text: '신규 노선 오픈', desc: '전체 플랫폼', img: 'shipping+route', gradient: 'linear-gradient(135deg, #075985, #0EA5E9)' },
    { icon: '⏰', text: '당일 배송 프로모션', desc: '인스타 + 페이스북', img: 'fast+delivery', gradient: 'linear-gradient(135deg, #0C4A6E, #38BDF8)' },
    { icon: '🌍', text: '해외 배송 안내', desc: '블로그 + 페이스북', img: 'international+shipping', gradient: 'linear-gradient(135deg, #0369A1, #7DD3FC)' },
    { icon: '📊', text: '물류 인사이트', desc: '블로그', img: 'logistics+data', gradient: 'linear-gradient(135deg, #075985, #0369A1)' },
    { icon: '⭐', text: '고객 후기', desc: '인스타 + 블로그', img: 'review+shipping', gradient: 'linear-gradient(135deg, #0C4A6E, #0EA5E9)' },
  ],
  freelance: [
    { icon: '💻', text: '포트폴리오 공개', desc: '인스타 + 블로그', img: 'portfolio+design', gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)' },
    { icon: '🎨', text: '작업 과정 공유', desc: '인스타 + 블로그', img: 'creative+process', gradient: 'linear-gradient(135deg, #6D28D9, #C4B5FD)' },
    { icon: '📢', text: '프로젝트 모집', desc: '전체 플랫폼', img: 'project+work', gradient: 'linear-gradient(135deg, #5B21B6, #8B5CF6)' },
    { icon: '💡', text: '업계 팁 공유', desc: '블로그 + 페이스북', img: 'tips+idea', gradient: 'linear-gradient(135deg, #4C1D95, #7C3AED)' },
    { icon: '🏆', text: '수상 / 성과 소식', desc: '인스타 + 페이스북', img: 'award+trophy', gradient: 'linear-gradient(135deg, #6D28D9, #DDD6FE)' },
    { icon: '🤝', text: '협업 파트너 모집', desc: '전체 플랫폼', img: 'collaboration+team', gradient: 'linear-gradient(135deg, #5B21B6, #A78BFA)' },
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
  매장: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop',
  ],
  사무실: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=600&fit=crop',
  ],
  병원: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=600&fit=crop',
  ],
  숙박: [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=600&fit=crop',
  ],
  수리: [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=600&fit=crop',
  ],
  법률: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=600&fit=crop',
  ],
  부동산: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=600&fit=crop',
  ],
  웨딩: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=600&fit=crop',
  ],
  제조: [
    'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=600&fit=crop',
  ],
  물류: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=600&fit=crop',
  ],
  프리랜서: [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=600&fit=crop',
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
  if (lower.includes('미용') || lower.includes('헤어') || lower.includes('살롱') || lower.includes('네일'))
    return { key: '미용', gradient: 'linear-gradient(135deg, #C77DFF, #7B2CBF)', title: '스타일 변신' };
  if (lower.includes('카페') || lower.includes('커피') || lower.includes('라떼'))
    return { key: '카페', gradient: 'linear-gradient(135deg, #6F4E37, #C08552)', title: '향기로운 한 잔' };
  if (lower.includes('헬스') || lower.includes('운동') || lower.includes('피트') || lower.includes('요가'))
    return { key: '헬스', gradient: 'linear-gradient(135deg, #2D6A4F, #40916C)', title: '건강한 시작' };
  if (lower.includes('반려') || lower.includes('펫') || lower.includes('강아지') || lower.includes('동물'))
    return { key: '반려동물', gradient: 'linear-gradient(135deg, #FF9F1C, #FFBF69)', title: '사랑스러운 우리 아이' };
  if (lower.includes('학원') || lower.includes('교육') || lower.includes('특강'))
    return { key: '학원', gradient: 'linear-gradient(135deg, #0077B6, #00B4D8)', title: '배움의 시작' };
  if (lower.includes('매장') || lower.includes('쇼핑') || lower.includes('스토어'))
    return { key: '매장', gradient: 'linear-gradient(135deg, #7209B7, #560BAD)', title: '특별한 쇼핑' };
  if (lower.includes('사무실') || lower.includes('b2b') || lower.includes('컨설팅'))
    return { key: '사무실', gradient: 'linear-gradient(135deg, #1E3A5F, #0071E3)', title: '비즈니스 파트너' };
  if (lower.includes('병원') || lower.includes('의원') || lower.includes('치과'))
    return { key: '병원', gradient: 'linear-gradient(135deg, #0891B2, #06D6A0)', title: '건강한 내일' };
  if (lower.includes('숙박') || lower.includes('펜션') || lower.includes('호텔'))
    return { key: '숙박', gradient: 'linear-gradient(135deg, #059669, #34D399)', title: '편안한 쉼' };
  if (lower.includes('수리') || lower.includes('정비') || lower.includes('as'))
    return { key: '수리', gradient: 'linear-gradient(135deg, #EA580C, #F97316)', title: '든든한 수리' };
  if (lower.includes('법률') || lower.includes('변호사') || lower.includes('세무'))
    return { key: '법률', gradient: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', title: '법률 파트너' };
  if (lower.includes('부동산') || lower.includes('매물') || lower.includes('분양'))
    return { key: '부동산', gradient: 'linear-gradient(135deg, #166534, #22C55E)', title: '내 집 찾기' };
  if (lower.includes('웨딩') || lower.includes('결혼') || lower.includes('이벤트'))
    return { key: '웨딩', gradient: 'linear-gradient(135deg, #BE185D, #EC4899)', title: '특별한 하루' };
  if (lower.includes('제조') || lower.includes('공장') || lower.includes('생산'))
    return { key: '제조', gradient: 'linear-gradient(135deg, #374151, #6B7280)', title: '제조 파트너' };
  if (lower.includes('물류') || lower.includes('운송') || lower.includes('배송'))
    return { key: '물류', gradient: 'linear-gradient(135deg, #0369A1, #38BDF8)', title: '빠른 배송' };
  if (lower.includes('프리랜서') || lower.includes('디자인') || lower.includes('개발'))
    return { key: '프리랜서', gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)', title: '크리에이티브' };
  return { key: '기본', gradient: 'linear-gradient(135deg, #0071E3, #5856D6)', title: '우리 가게 소식' };
}

// 복사 함수
function copyToClipboard(text: string, setCopied: (v: string) => void, id: string) {
  navigator.clipboard.writeText(text);
  setCopied(id);
  setTimeout(() => setCopied(''), 2000);
}

interface ChatMsg { id: string; role: 'user' | 'assistant'; text: string }

export function SNSPanel({ embedded }: { embedded?: boolean }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'generate' | 'video' | 'calendar' | 'history'>('generate');
  const [copied, setCopied] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [savedCategory, setSavedCategory] = useState<string | null>(null);
  const [setupDone, setSetupDone] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState({ instagram: '', facebook: '' });
  const [posting, setPosting] = useState('');
  const [tone, setTone] = useState('친근한');
  const [length, setLength] = useState('보통');
  const [platform, setPlatform] = useState('인스타그램');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ilpro_sns_category');
    if (saved) { setSavedCategory(saved); setSetupDone(true); }
    const keys = localStorage.getItem('ilpro_sns_api_keys');
    if (keys) setApiKeys(JSON.parse(keys));
  }, []);

  const saveApiKeys = () => {
    localStorage.setItem('ilpro_sns_api_keys', JSON.stringify(apiKeys));
    setShowApiSettings(false);
  };

  const postToSns = async (platform: string, text: string) => {
    const key = platform === 'instagram' ? apiKeys.instagram : apiKeys.facebook;
    if (!key) { setShowApiSettings(true); return; }
    setPosting(platform);
    // TODO: Implement actual API posting
    // Instagram: Graph API POST /{ig-user-id}/media + /{ig-user-id}/media_publish
    // Facebook: POST /{page-id}/feed
    setTimeout(() => { setPosting(''); alert(`${platform === 'instagram' ? '인스타그램' : '페이스북'} 포스팅 기능은 API 키 설정 후 사용 가능합니다.`); }, 1000);
  };

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

  const lengthGuide = length === '짧게' ? '3~5줄 이내로 짧게' : length === '길게' ? '10줄 이상 자세하게' : '5~8줄 정도로';
  const buildPrompt = (text: string) => {
    let p = `다음 내용으로 ${platform}용 SNS 게시물을 만들어주세요:\n\n${text}`;
    if (currentBiz) p += `\n[업종: ${currentBiz.label}]`;
    p += `\n[톤: ${tone}] [길이: ${lengthGuide}]`;
    p += `\n해시태그도 포함해주세요.`;
    return p;
  };

  async function sendPrompt(prompt: string) {
    const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', text: prompt };
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, userMsg, { id: assistantId, role: 'assistant', text: '' }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/sns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
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
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: current } : m));
        }
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: '생성 중 오류가 발생했어요.' } : m));
    }
    setIsLoading(false);
  }

  const handleQuickPrompt = (text: string) => {
    setLastPrompt(text);
    sendPrompt(buildPrompt(text));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setLastPrompt(input);
      sendPrompt(buildPrompt(input));
      setInput('');
    }
  };

  // 현재 카테고리 감지
  const category = detectCategory(lastPrompt || input);

  return (
    <div className={embedded ? "h-full overflow-y-auto" : "min-h-screen"} style={{ background: embedded ? 'var(--bg)' : '#000', color: embedded ? 'var(--text)' : '#fff' }}>
      <style>{`
        @keyframes igSpin { to { transform: rotate(360deg); } }
        @keyframes igFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .ig-story-ring { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); padding: 2.5px; border-radius: 50%; }
        .ig-story-ring-used { background: #333; padding: 2.5px; border-radius: 50%; }
      `}</style>

      {/* ═══ Instagram-style Header ═══ */}
      {!embedded && (
        <header className="sticky top-0 z-30 px-4 py-2.5" style={{ background: '#000', borderBottom: '1px solid #262626' }}>
          <div className="max-w-[470px] mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-white/40 hover:text-white/70 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </Link>
            <h1 className="text-base font-semibold tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>일프로 SNS</h1>
            <div className="flex items-center gap-3">
              {currentBiz && (
                <button onClick={() => { setSetupDone(false); setSavedCategory(null); localStorage.removeItem('ilpro_sns_category'); }}
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium transition-opacity hover:opacity-70"
                  style={{ background: '#262626', color: '#e0e0e0' }}>
                  {currentBiz.icon} {currentBiz.label}
                </button>
              )}
              <button onClick={() => setShowApiSettings(true)} className="text-white/50 hover:text-white/80">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Embedded header */}
      {embedded && (
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h2 className="text-base font-semibold">SNS 콘텐츠</h2>
          <div className="flex items-center gap-2">
            {currentBiz && (
              <button onClick={() => { setSetupDone(false); setSavedCategory(null); localStorage.removeItem('ilpro_sns_category'); }}
                className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                {currentBiz.icon} {currentBiz.label}
              </button>
            )}
            <button onClick={() => setShowApiSettings(true)} className="text-[var(--text-muted)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            </button>
          </div>
        </div>
      )}

      <div className={embedded ? "px-4 pb-4" : "max-w-[470px] mx-auto"}>
        {/* ═══ Business Setup — Instagram onboarding style ═══ */}
        {!setupDone && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-5 ig-story-ring">
              <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: '#000' }}>📣</div>
            </div>
            <h2 className="text-xl font-bold mb-1">업종을 선택하세요</h2>
            <p className="text-sm text-white/40 mb-8">맞춤 콘텐츠를 자동으로 만들어 드려요</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg">
              {BIZ_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => selectCategory(cat.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.03] active:scale-95"
                  style={{ background: '#1a1a1a', border: '1px solid #262626' }}>
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[11px] font-medium text-white/80">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {setupDone && <>
        {/* ═══ Tab Navigation — Instagram-style segmented control ═══ */}
        <div className="flex border-b mb-0" style={{ borderColor: '#262626' }}>
          {[
            { id: 'generate' as const, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg> },
            { id: 'video' as const, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
            { id: 'calendar' as const, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
            { id: 'history' as const, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex-1 flex justify-center py-3 transition-all relative"
              style={{ color: activeTab === t.id ? '#fff' : '#666' }}>
              {t.icon}
              {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white" />}
            </button>
          ))}
        </div>

        {/* ═══ Generate Tab — Instagram Feed Style ═══ */}
        {activeTab === 'generate' && (
          <div>
            {/* Stories-style quick prompts */}
            {messages.length === 0 && (
              <div className="py-3 -mx-4 px-4" style={{ borderBottom: '1px solid #262626' }}>
                <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {quickPrompts.slice(0, 6).map((p, i) => (
                    <button key={i} onClick={() => handleQuickPrompt(p.text)} disabled={isLoading}
                      className="flex flex-col items-center gap-1.5 shrink-0 disabled:opacity-40 active:scale-95 transition-transform"
                      style={{ width: 68 }}>
                      <div className="ig-story-ring">
                        <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-xl"
                          style={{ background: '#1a1a1a' }}>
                          {p.icon}
                        </div>
                      </div>
                      <span className="text-[10px] text-white/60 truncate w-full text-center leading-tight">{p.text.length > 8 ? p.text.slice(0, 8) + '...' : p.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create post area */}
            <div className="py-4 px-4 -mx-4" style={{ borderBottom: messages.length > 0 ? '1px solid #262626' : 'none' }}>
              {messages.length === 0 && (
                <div className="text-center mb-4 pt-6">
                  <div className="text-3xl mb-2">{currentBiz?.icon || '📣'}</div>
                  <h2 className="text-lg font-bold mb-1">오늘 뭐 올릴까요?</h2>
                  <p className="text-xs text-white/30">주제를 입력하면 AI가 게시물을 만들어 드려요</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm"
                  style={{ background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)' }}>
                  {currentBiz?.icon || '✨'}
                </div>
                <input value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading}
                  placeholder="게시물 주제를 입력하세요..."
                  className="flex-1 px-3 py-2.5 rounded-full text-sm focus:outline-none disabled:opacity-50"
                  style={{ background: '#262626', border: '1px solid #363636', color: '#fff' }} />
                <button type="submit" disabled={isLoading || !input.trim()}
                  className="px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-30 transition-opacity shrink-0"
                  style={{ background: 'transparent', color: '#0095F6' }}>
                  {isLoading ? '...' : '게시'}
                </button>
              </form>

              {/* Settings row */}
              {messages.length === 0 && (
                <div className="flex items-center gap-2 mt-3 ml-10 flex-wrap">
                  <div className="flex items-center gap-1">
                    {['친근한', '전문적', '유머', '감성적'].map(t => (
                      <button key={t} onClick={() => setTone(t)} className="px-2.5 py-1 rounded-full text-[10px] transition-all"
                        style={{ background: tone === t ? '#0095F6' : '#262626', color: tone === t ? '#fff' : '#999', border: '1px solid', borderColor: tone === t ? '#0095F6' : '#363636' }}>{t}</button>
                    ))}
                  </div>
                  <div className="w-px h-4" style={{ background: '#363636' }} />
                  <div className="flex items-center gap-1">
                    {['짧게', '보통', '길게'].map(l => (
                      <button key={l} onClick={() => setLength(l)} className="px-2.5 py-1 rounded-full text-[10px] transition-all"
                        style={{ background: length === l ? '#0095F6' : '#262626', color: length === l ? '#fff' : '#999', border: '1px solid', borderColor: length === l ? '#0095F6' : '#363636' }}>{l}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="py-8 text-center" style={{ animation: 'igFadeIn 0.3s ease' }}>
                <div className="w-8 h-8 rounded-full mx-auto mb-3"
                  style={{ border: '2px solid #262626', borderTopColor: '#0095F6', animation: 'igSpin 0.8s linear infinite' }} />
                <p className="text-xs text-white/40">게시물을 만들고 있어요...</p>
              </div>
            )}

            {/* ═══ Instagram Feed — Post Cards ═══ */}
            <div>
              {[...messages].reverse().filter(m => m.role === 'assistant' && m.text).map((message, idx) => {
                const msgCategory = detectCategory(
                  [...messages].find(m => m.role === 'user' && Number(m.id) < Number(message.id))?.text || lastPrompt || ''
                );
                return (
                <div key={message.id} style={{ borderBottom: '1px solid #262626', animation: 'igFadeIn 0.4s ease' }}>
                  {/* Post header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="ig-story-ring">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: '#000' }}>
                        {currentBiz?.icon || '📣'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold">{currentBiz?.label || '내 가게'}</div>
                      <div className="text-[11px] text-white/40">{currentBiz?.label || '내 가게'} 공식</div>
                    </div>
                    <button onClick={() => copyToClipboard(message.text, setCopied, message.id)} className="text-white/50 hover:text-white">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </div>

                  {/* Post image */}
                  <div className="aspect-square relative overflow-hidden">
                    <img src={getPhoto(msgCategory.key, idx)} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)' }} />
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="text-white font-bold text-xl leading-tight drop-shadow-lg">{msgCategory.title}</div>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="flex items-center px-4 py-3">
                    <div className="flex items-center gap-4 flex-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" className="cursor-pointer hover:opacity-60 transition-opacity"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" className="cursor-pointer hover:opacity-60 transition-opacity"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" className="cursor-pointer hover:opacity-60 transition-opacity"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" className="cursor-pointer hover:opacity-60 transition-opacity"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </div>

                  {/* Caption */}
                  <div className="px-4 pb-1">
                    <div className="text-[11px] font-semibold text-white/40 mb-1">좋아요 128개</div>
                  </div>
                  <div className="px-4 pb-3">
                    <div className="text-[13px] text-white/90 whitespace-pre-wrap leading-relaxed max-h-[180px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                      <span className="font-semibold text-white">{currentBiz?.label || '내 가게'}</span>{' '}
                      {message.text}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 px-4 pb-4">
                    <button onClick={() => copyToClipboard(message.text, setCopied, message.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                      style={{ background: copied === message.id ? '#262626' : '#0095F6', color: '#fff' }}>
                      {copied === message.id ? '✓ 복사됨' : '텍스트 복사'}
                    </button>
                    <button onClick={() => postToSns('instagram', message.text)} disabled={posting === 'instagram'}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                      style={{ background: '#262626', color: apiKeys.instagram ? '#E1306C' : '#666' }}>
                      인스타 포스팅 {!apiKeys.instagram && '🔒'}
                    </button>
                    <button onClick={() => postToSns('facebook', message.text)} disabled={posting === 'facebook'}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                      style={{ background: '#262626', color: apiKeys.facebook ? '#1877F2' : '#666' }}>
                      페북 {!apiKeys.facebook && '🔒'}
                    </button>
                  </div>
                </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* API Settings Modal — Instagram style */}
        {showApiSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#262626', border: '1px solid #363636' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold">자동 포스팅 설정</h3>
                <button onClick={() => setShowApiSettings(false)} className="text-white/40 hover:text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-white/60 mb-1.5 block">인스타그램 Access Token</label>
                  <input value={apiKeys.instagram} onChange={e => setApiKeys(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="Instagram Graph API 토큰 입력"
                    className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#1a1a1a', border: '1px solid #363636', color: '#fff' }} />
                  <p className="text-[10px] text-white/30 mt-1">Meta Developer → 앱 만들기 → Instagram Graph API 활성화</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/60 mb-1.5 block">페이스북 Page Access Token</label>
                  <input value={apiKeys.facebook} onChange={e => setApiKeys(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="Facebook Page 토큰 입력"
                    className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: '#1a1a1a', border: '1px solid #363636', color: '#fff' }} />
                  <p className="text-[10px] text-white/30 mt-1">Meta Developer → 앱 만들기 → Pages API 활성화</p>
                </div>
              </div>

              <div className="rounded-xl p-3 mb-6" style={{ background: 'rgba(0,149,246,0.1)', border: '1px solid rgba(0,149,246,0.2)' }}>
                <p className="text-xs text-white/60 leading-relaxed">
                  <strong className="text-white/80">설정 방법:</strong><br/>
                  1. <a href="https://developers.facebook.com" target="_blank" rel="noopener" className="underline" style={{ color: '#0095F6' }}>Meta Developer</a> 에서 앱을 만드세요<br/>
                  2. Instagram Graph API 또는 Pages API를 활성화하세요<br/>
                  3. Access Token을 복사해서 위에 붙여넣으세요<br/>
                  4. 게시물 생성 후 인스타/페이스북 버튼으로 바로 포스팅!
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowApiSettings(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: '#1a1a1a', color: '#999' }}>취소</button>
                <button onClick={saveApiKeys}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#0095F6' }}>저장</button>
              </div>
            </div>
          </div>
        )}

        {/* Video Tab */}
        {activeTab === 'video' && <VideoPanel />}


        {/* Hashtag Tab */}

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

export default function SNSPage() {
  return <SNSPanel />;
}

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

  const bizContext = currentBiz ? `\n\n[업종: ${currentBiz.label}]` : '';

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
    sendPrompt(`다음 내용으로 SNS 게시물을 만들어주세요:\n\n${text}${bizContext}\n\n자연스럽고 친근한 톤으로 작성하고, 해시태그도 포함해주세요.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setLastPrompt(input);
      sendPrompt(`다음 내용으로 SNS 게시물을 만들어주세요:\n\n${input}${bizContext}\n\n자연스럽고 친근한 톤으로 작성하고, 해시태그도 포함해주세요.`);
      setInput('');
    }
  };

  // 현재 카테고리 감지
  const category = detectCategory(lastPrompt || input);

  return (
    <div className={embedded ? "h-full overflow-y-auto" : "min-h-screen"} style={{ background: embedded ? 'var(--bg)' : '#0a0a1a', color: embedded ? 'var(--text)' : '#fff' }}>
      {/* Header — only on standalone page */}
      {!embedded && (
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
      )}

      <div className={embedded ? "p-4" : "max-w-5xl mx-auto p-4"}>
        {/* Business Setup Screen */}
        {!setupDone && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-4xl mb-4">📣</div>
            <h2 className="text-2xl font-bold mb-2">어떤 업종이세요?</h2>
            <p className="text-sm text-white/50 mb-8">한번 설정하면 모든 콘텐츠가 맞춤 생성됩니다</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full">
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

        {/* Generate Tab — minimal, focused */}
        {activeTab === 'generate' && (
          <div>
            {/* Input first — always visible at top */}
            <div className="mb-6">
              {messages.length === 0 && (
                <div className="text-center mb-6">
                  <div className="text-2xl mb-2">{currentBiz?.icon || '📣'}</div>
                  <h2 className="text-lg font-bold mb-1">오늘 뭐 올릴까요?</h2>
                  <p className="text-xs text-white/40">한 줄만 적어주세요. 나머지는 AI가 알아서 해요.</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder={currentBiz ? `예: ${quickPrompts[0]?.text || '이벤트 홍보'}` : '어떤 내용을 올릴까요?'}
                  className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
                <button type="submit" disabled={isLoading || !input.trim()}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: '#0071E3' }}>
                  {isLoading ? '...' : '생성'}
                </button>
              </form>

              {/* Quick suggestions — 2 pills only */}
              {messages.length === 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {quickPrompts.slice(0, 3).map((p, i) => (
                    <button key={i} onClick={() => handleQuickPrompt(p.text)} disabled={isLoading}
                      className="px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                      {p.icon} {p.text}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="rounded-xl p-6 text-center mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="w-8 h-8 rounded-full mx-auto mb-3" style={{ border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#0071E3', animation: 'spin 1s linear infinite' }} />
                <p className="text-sm text-white/50">게시물을 만들고 있어요...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Generated Content — latest first */}
            <div className="space-y-4">
              {[...messages].reverse().filter(m => m.role === 'assistant' && m.text).map((message) => (
                <div key={message.id} className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {/* Image */}
                  <div className="aspect-[2/1] relative overflow-hidden">
                    <img src={getPhoto(category.key, 0)} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-white font-bold" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{category.title}</div>
                  </div>
                  {/* Text */}
                  <div className="px-4 py-3 text-sm text-white/80 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                    {message.text}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => copyToClipboard(message.text, setCopied, message.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: copied === message.id ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.1)', color: copied === message.id ? '#30D158' : 'rgba(255,255,255,0.6)' }}>
                      {copied === message.id ? '✓ 복사됨' : '📋 복사'}
                    </button>
                    <button onClick={() => postToSns('instagram', message.text)} disabled={posting === 'instagram'}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: apiKeys.instagram ? 'rgba(225,48,108,0.2)' : 'rgba(255,255,255,0.05)', color: apiKeys.instagram ? '#E1306C' : 'rgba(255,255,255,0.3)' }}>
                      📸 인스타 {!apiKeys.instagram && '🔒'}
                    </button>
                    <button onClick={() => postToSns('facebook', message.text)} disabled={posting === 'facebook'}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: apiKeys.facebook ? 'rgba(24,119,242,0.2)' : 'rgba(255,255,255,0.05)', color: apiKeys.facebook ? '#1877F2' : 'rgba(255,255,255,0.3)' }}>
                      👥 페이스북 {!apiKeys.facebook && '🔒'}
                    </button>
                    <button onClick={() => setShowApiSettings(true)} className="ml-auto text-xs text-white/30 hover:text-white/60">⚙️</button>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* API Settings Modal */}
        {showApiSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold">⚙️ 자동 포스팅 설정</h3>
                <button onClick={() => setShowApiSettings(false)} className="text-white/40 hover:text-white text-lg">✕</button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-white/50 mb-1.5 block">📸 인스타그램 Access Token</label>
                  <input value={apiKeys.instagram} onChange={e => setApiKeys(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="Instagram Graph API 토큰 입력"
                    className="w-full px-3 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <p className="text-[10px] text-white/30 mt-1">Meta Developer → 앱 만들기 → Instagram Graph API 활성화</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 mb-1.5 block">👥 페이스북 Page Access Token</label>
                  <input value={apiKeys.facebook} onChange={e => setApiKeys(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="Facebook Page 토큰 입력"
                    className="w-full px-3 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <p className="text-[10px] text-white/30 mt-1">Meta Developer → 앱 만들기 → Pages API 활성화</p>
                </div>
              </div>

              <div className="rounded-lg p-3 mb-6" style={{ background: 'rgba(0,113,227,0.1)', border: '1px solid rgba(0,113,227,0.2)' }}>
                <p className="text-xs text-white/60 leading-relaxed">
                  <strong className="text-white/80">설정 방법:</strong><br/>
                  1. <a href="https://developers.facebook.com" target="_blank" rel="noopener" className="underline text-[#0071E3]">Meta Developer</a> 에서 앱을 만드세요<br/>
                  2. Instagram Graph API 또는 Pages API를 활성화하세요<br/>
                  3. Access Token을 복사해서 위에 붙여넣으세요<br/>
                  4. 게시물 생성 후 인스타/페이스북 버튼으로 바로 포스팅!
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowApiSettings(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>취소</button>
                <button onClick={saveApiKeys}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ background: '#0071E3' }}>저장</button>
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

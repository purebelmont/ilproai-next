import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { template, bizName, description, contact, features } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;

  const prompt = `You are a Korean website content generator for small businesses.
Generate website content in JSON format for the following business:

업종 (template): ${template}
가게/회사 이름: ${bizName}
설명: ${description}
연락처: ${contact}
특징/강점: ${features}

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "hero": { "title": "${bizName}", "subtitle": "compelling Korean subtitle for this business" },
  "about": { "text": "2-3 paragraph Korean description of the business, professional and warm tone" },
  "services": [
    { "name": "service name in Korean", "description": "brief description", "price": "price or empty string" },
    ... (generate 4-8 relevant services/menu items based on the business type)
  ],
  "contact": { "phone": "phone from input or empty", "email": "email or empty", "address": "address from input or empty", "kakao": "" },
  "theme": { "color": "pick a hex color that fits this business type", "font": "default" }
}

Make the content feel real, professional, and ready to publish. Write everything in Korean.
For services/menu items, generate realistic items with descriptions based on the business type.
The about text should tell a compelling story about the business.`;

  // If API key exists, call Claude
  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const content = JSON.parse(text);
      return NextResponse.json({ content, source: "ai" });
    } catch (e) {
      // Fall through to template generation
    }
  }

  // Fallback: generate template-based content without AI
  const content = generateTemplate(template, bizName, description, contact, features);
  return NextResponse.json({ content, source: "template" });
}

function generateTemplate(template: string, bizName: string, description: string, contact: string, features: string) {
  const colors: Record<string, string> = {
    restaurant: "#E85D04", service: "#9B5DE5", retail: "#00BBF9", office: "#0071E3",
    medical: "#00B4D8", education: "#F77F00", fitness: "#EF233C", lodging: "#06D6A0",
    repair: "#FF6B35", legal: "#023E8A", realestate: "#2D6A4F", pet: "#FB8500",
    wedding: "#E63946", manufacturing: "#495057", logistics: "#0077B6", freelance: "#7D2AE7",
  };

  const serviceTemplates: Record<string, { name: string; description: string; price: string }[]> = {
    restaurant: [
      { name: "시그니처 메뉴", description: "셰프 추천 대표 메뉴", price: "15,000" },
      { name: "런치 세트", description: "점심 특선 세트 메뉴", price: "12,000" },
      { name: "디너 코스", description: "풀코스 디너", price: "35,000" },
      { name: "음료", description: "커피, 차, 주스", price: "5,000" },
    ],
    service: [
      { name: "기본 케어", description: "기본 서비스 패키지", price: "50,000" },
      { name: "프리미엄 케어", description: "프리미엄 풀 패키지", price: "80,000" },
      { name: "스페셜 케어", description: "특별 관리 프로그램", price: "120,000" },
      { name: "멤버십", description: "월정액 무제한 이용", price: "200,000" },
    ],
    medical: [
      { name: "초진 상담", description: "첫 방문 종합 상담", price: "" },
      { name: "정기 검진", description: "건강 검진 프로그램", price: "" },
      { name: "전문 치료", description: "전문 분야 집중 치료", price: "" },
      { name: "재활 프로그램", description: "맞춤형 재활 관리", price: "" },
    ],
    education: [
      { name: "기초반", description: "기초부터 탄탄하게", price: "200,000" },
      { name: "심화반", description: "실력 향상 집중 과정", price: "300,000" },
      { name: "1:1 과외", description: "맞춤형 개인 지도", price: "500,000" },
      { name: "특강", description: "주제별 단기 특강", price: "100,000" },
    ],
    fitness: [
      { name: "PT 1회", description: "개인 트레이닝 1회", price: "70,000" },
      { name: "PT 10회", description: "개인 트레이닝 10회 패키지", price: "600,000" },
      { name: "그룹 수업", description: "소규모 그룹 트레이닝", price: "150,000" },
      { name: "월 이용권", description: "시설 자유 이용", price: "100,000" },
    ],
  };

  const defaultServices = [
    { name: "기본 서비스", description: "대표 서비스", price: "" },
    { name: "프리미엄 서비스", description: "프리미엄 패키지", price: "" },
    { name: "맞춤 서비스", description: "고객 맞춤 솔루션", price: "" },
    { name: "상담", description: "무료 상담 가능", price: "" },
  ];

  // Parse contact info
  const contactInfo = { phone: "", email: "", address: "", kakao: "" };
  if (contact) {
    const lines = contact.split(/[,\n]/).map((l: string) => l.trim());
    for (const line of lines) {
      if (line.match(/\d{2,3}-\d{3,4}-\d{4}/)) contactInfo.phone = line.match(/\d{2,3}-\d{3,4}-\d{4}/)![0];
      else if (line.includes("@")) contactInfo.email = line;
      else if (line.length > 5) contactInfo.address = line;
    }
  }

  return {
    hero: { title: bizName, subtitle: description || `${bizName}에 오신 것을 환영합니다`, image: "" },
    about: { text: description ? `${description}\n\n${features ? features + "\n\n" : ""}${bizName}은(는) 고객 한 분 한 분을 소중히 여기며, 최고의 서비스를 제공하기 위해 항상 노력하고 있습니다. 편하게 방문해 주세요.` : `${bizName}에 오신 것을 환영합니다.\n\n${features || "최고의 서비스와 품질로 고객님께 만족을 드리겠습니다."}\n\n언제든 편하게 문의해 주세요.`, image: "" },
    services: serviceTemplates[template] || defaultServices,
    hours: { mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "" },
    contact: contactInfo,
    gallery: [],
    theme: { color: colors[template] || "#7D2AE7", font: "default" },
  };
}

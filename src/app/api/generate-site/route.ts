import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { template, bizName, description, contact, features, stream: useStream } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const prompt = `You are an elite web designer. Generate a complete, single-file HTML website for this Korean business.

Business info:
- 업종: ${template}
- 이름: ${bizName}
- 설명: ${description}
- 연락처: ${contact}
- 특징: ${features || "없음"}

REQUIREMENTS:
1. Return ONLY raw HTML. No markdown, no code blocks, no explanation.
2. The HTML must be a complete document with <!DOCTYPE html>, <html>, <head>, <body>.
3. All CSS must be inline in a <style> tag. No external CSS or JS.
4. Design must be STUNNING — modern, premium, Apple/Stripe-level quality.
5. All text in Korean.
6. Mobile responsive.
7. Include these sections:
   - Hero with gradient background, business name, tagline, CTA button
   - About section with compelling story
   - Services/Menu (4-8 realistic items with prices if applicable)
   - Contact info with phone, address, email
   - Footer with "Powered by 콘타벨로AI"
8. Use modern CSS: gradients, backdrop-filter, border-radius, smooth shadows, CSS grid/flexbox.
9. Color scheme should match the business type.
10. Generate realistic Korean business content — menu items, service descriptions, about text.
11. The website should look like it cost ₩5,000,000 to build.
12. Include subtle animations: hover effects, smooth transitions.
13. Use system fonts: -apple-system, BlinkMacSystemFont, sans-serif.
14. Hero section should be full-viewport height with a dramatic gradient.
15. Add a floating "전화하기" button if phone number is provided.`;

  // Streaming mode
  if (useStream && apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 8000,
          stream: true,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) throw new Error("API error");

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });

              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`));
                  }
                } catch {}
              }
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          } catch (e) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: true })}\n\n`));
          }
          controller.close();
        },
      });

      return new Response(readable, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
      });
    } catch (e) {
      console.error("Stream failed, using fallback:", e);
      const html = generateFallbackHTML(template, bizName, description, contact);
      return NextResponse.json({ html, source: "template" });
    }
  }

  // Non-streaming mode
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
          model: "claude-sonnet-4-6",
          max_tokens: 8000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Claude API error:", err);
        throw new Error("API error");
      }

      const data = await res.json();
      const html = data.content?.[0]?.text || "";

      if (html.includes("<!DOCTYPE") || html.includes("<html")) {
        return NextResponse.json({ html, source: "ai" });
      }
      throw new Error("Not valid HTML");
    } catch (e) {
      console.error("AI generation failed, using fallback:", e);
    }
  }

  // Fallback: beautiful template without AI
  const html = generateFallbackHTML(template, bizName, description, contact);
  return NextResponse.json({ html, source: "template" });
}

function generateFallbackHTML(template: string, bizName: string, description: string, contact: string) {
  const colors: Record<string, [string, string]> = {
    restaurant: ["#E85D04", "#DC2626"], service: ["#9B5DE5", "#EC4899"], retail: ["#0071E3", "#06B6D4"],
    office: ["#1E3A5F", "#0071E3"], medical: ["#0891B2", "#06D6A0"], education: ["#D97706", "#F59E0B"],
    fitness: ["#DC2626", "#F97316"], lodging: ["#059669", "#34D399"], repair: ["#EA580C", "#F97316"],
    legal: ["#1E3A8A", "#3B82F6"], realestate: ["#166534", "#22C55E"], pet: ["#D97706", "#FBBF24"],
    wedding: ["#BE185D", "#EC4899"], manufacturing: ["#374151", "#6B7280"], logistics: ["#0369A1", "#38BDF8"],
    freelance: ["#7C3AED", "#A78BFA"],
  };
  const [c1, c2] = colors[template] || ["#7C3AED", "#A78BFA"];

  const templateNames: Record<string, string> = {
    restaurant: "음식점", service: "서비스", retail: "매장", office: "사무실",
    medical: "의료", education: "교육", fitness: "피트니스", lodging: "숙박",
    repair: "수리", legal: "법률", realestate: "부동산", pet: "반려동물",
    wedding: "웨딩", manufacturing: "제조", logistics: "물류", freelance: "프리랜서",
  };

  const servicesByType: Record<string, string> = {
    restaurant: `<div class="svc"><div class="svc-n">시그니처 메뉴</div><div class="svc-d">셰프가 직접 엄선한 재료로 만드는 대표 요리</div><div class="svc-p">₩15,000</div></div>
      <div class="svc"><div class="svc-n">점심 특선</div><div class="svc-d">매일 바뀌는 신선한 점심 세트</div><div class="svc-p">₩12,000</div></div>
      <div class="svc"><div class="svc-n">디너 코스</div><div class="svc-d">특별한 날을 위한 풀코스 디너</div><div class="svc-p">₩35,000</div></div>
      <div class="svc"><div class="svc-n">음료 & 디저트</div><div class="svc-d">식사를 완성하는 음료와 수제 디저트</div><div class="svc-p">₩5,000~</div></div>`,
    service: `<div class="svc"><div class="svc-n">기본 케어</div><div class="svc-d">첫 방문 고객을 위한 기본 패키지</div><div class="svc-p">₩50,000</div></div>
      <div class="svc"><div class="svc-n">프리미엄 케어</div><div class="svc-d">깊은 릴랙스를 위한 프리미엄 풀 패키지</div><div class="svc-p">₩80,000</div></div>
      <div class="svc"><div class="svc-n">스페셜 프로그램</div><div class="svc-d">고객 맞춤 특별 관리 프로그램</div><div class="svc-p">₩120,000</div></div>
      <div class="svc"><div class="svc-n">멤버십</div><div class="svc-d">월정액 무제한 이용 + VIP 혜택</div><div class="svc-p">₩200,000/월</div></div>`,
  };
  const defaultServices = `<div class="svc"><div class="svc-n">기본 서비스</div><div class="svc-d">고객 맞춤 대표 서비스</div><div class="svc-p">상담</div></div>
    <div class="svc"><div class="svc-n">프리미엄 서비스</div><div class="svc-d">한 단계 높은 프리미엄 패키지</div><div class="svc-p">상담</div></div>
    <div class="svc"><div class="svc-n">맞춤 솔루션</div><div class="svc-d">비즈니스에 딱 맞는 커스텀 서비스</div><div class="svc-p">상담</div></div>
    <div class="svc"><div class="svc-n">컨설팅</div><div class="svc-d">전문가의 1:1 무료 상담</div><div class="svc-p">무료</div></div>`;

  let phone = "", email = "", address = "";
  if (contact) {
    const m = contact.match(/\d{2,3}-\d{3,4}-\d{4}/);
    if (m) phone = m[0];
    if (contact.includes("@")) email = contact.match(/[\w.-]+@[\w.-]+/)?.[0] || "";
    const parts = contact.split(/[,\n]/).filter((p: string) => p.trim().length > 5 && !p.match(/\d{2,3}-/) && !p.includes("@"));
    if (parts.length) address = parts[0].trim();
  }

  const aboutText = description || `${bizName}에 오신 것을 환영합니다. 저희는 고객 한 분 한 분을 소중히 여기며, 최고의 서비스를 제공하기 위해 항상 노력하고 있습니다.`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${bizName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}

.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;background:linear-gradient(135deg,${c1},${c2})}
.hero::before{content:'';position:absolute;top:-50%;right:-30%;width:600px;height:600px;border-radius:50%;background:rgba(255,255,255,0.05)}
.hero::after{content:'';position:absolute;bottom:-40%;left:-20%;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,0.03)}
.hero-content{position:relative;z-index:1;padding:40px 24px;max-width:700px}
.hero-badge{display:inline-block;padding:6px 18px;border-radius:30px;font-size:12px;font-weight:600;background:rgba(255,255,255,0.15);color:white;margin-bottom:24px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2)}
.hero h1{font-size:clamp(36px,8vw,56px);font-weight:800;color:white;line-height:1.15;margin-bottom:16px;letter-spacing:-1px}
.hero p{font-size:clamp(16px,3vw,20px);color:rgba(255,255,255,0.8);margin-bottom:36px;line-height:1.6}
.hero-btn{display:inline-block;padding:16px 40px;background:white;color:${c1};border-radius:14px;font-size:16px;font-weight:700;transition:all 0.3s;box-shadow:0 4px 20px rgba(0,0,0,0.15)}
.hero-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,0.2)}

section{padding:80px 24px}
.container{max-width:800px;margin:0 auto}
.section-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${c1};margin-bottom:12px}
.section-title{font-size:clamp(28px,5vw,38px);font-weight:800;line-height:1.2;margin-bottom:24px;letter-spacing:-0.5px}

.about{background:#FAFBFE}
.about-text{font-size:17px;line-height:2;color:#4a5568}

.services{background:white}
.svc-grid{display:grid;gap:16px;margin-top:32px}
.svc{display:flex;align-items:center;justify-content:space-between;padding:24px;border-radius:16px;background:#FAFBFE;border:1px solid #f0f0f5;transition:all 0.3s}
.svc:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.06);border-color:${c1}30}
.svc-n{font-size:17px;font-weight:700;color:#1a1a2e}
.svc-d{font-size:13px;color:#8892a6;margin-top:4px}
.svc-p{font-size:18px;font-weight:800;color:${c1};white-space:nowrap;margin-left:24px}

.contact-section{background:linear-gradient(135deg,#0A0F2C,#1a1a3e);color:white;text-align:center}
.contact-section .section-label{color:${c2}}
.contact-section .section-title{color:white}
.contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-top:40px}
.contact-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:28px;backdrop-filter:blur(10px);transition:all 0.3s}
.contact-card:hover{background:rgba(255,255,255,0.1);transform:translateY(-2px)}
.contact-icon{font-size:28px;margin-bottom:12px}
.contact-label{font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:4px}
.contact-value{font-size:15px;font-weight:600}

footer{padding:32px 24px;text-align:center;background:#0A0F2C;color:rgba(255,255,255,0.3);font-size:12px}
footer a{color:${c2}}

${phone ? `.float-btn{position:fixed;bottom:24px;right:24px;padding:14px 28px;background:${c1};color:white;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 4px 20px ${c1}50;z-index:100;transition:all 0.3s;text-decoration:none;display:flex;align-items:center;gap:8px}.float-btn:hover{transform:scale(1.05);box-shadow:0 8px 30px ${c1}70}` : ""}

@media(max-width:640px){section{padding:60px 20px}.contact-grid{grid-template-columns:1fr}}
</style>
</head>
<body>

<section class="hero">
  <div class="hero-content">
    <div class="hero-badge">${templateNames[template] || "비즈니스"}</div>
    <h1>${bizName}</h1>
    <p>${aboutText}</p>
    ${phone ? `<a href="tel:${phone}" class="hero-btn">📞 전화하기</a>` : `<a href="#contact" class="hero-btn">문의하기</a>`}
  </div>
</section>

<section class="about">
  <div class="container">
    <div class="section-label">About</div>
    <div class="section-title">소개</div>
    <div class="about-text">${aboutText}<br><br>고객 한 분 한 분을 소중히 여기며, 최고의 서비스를 제공하기 위해 항상 노력하고 있습니다. 편하게 방문해 주세요.</div>
  </div>
</section>

<section class="services">
  <div class="container">
    <div class="section-label">${template === "restaurant" ? "Menu" : "Services"}</div>
    <div class="section-title">${template === "restaurant" ? "메뉴" : "서비스"}</div>
    <div class="svc-grid">
      ${servicesByType[template] || defaultServices}
    </div>
  </div>
</section>

<section class="contact-section" id="contact">
  <div class="container">
    <div class="section-label">Contact</div>
    <div class="section-title">연락처</div>
    <div class="contact-grid">
      ${phone ? `<div class="contact-card"><div class="contact-icon">📞</div><div class="contact-label">전화</div><div class="contact-value"><a href="tel:${phone}">${phone}</a></div></div>` : ""}
      ${address ? `<div class="contact-card"><div class="contact-icon">📍</div><div class="contact-label">주소</div><div class="contact-value">${address}</div></div>` : ""}
      ${email ? `<div class="contact-card"><div class="contact-icon">📧</div><div class="contact-label">이메일</div><div class="contact-value"><a href="mailto:${email}">${email}</a></div></div>` : ""}
      ${!phone && !address && !email ? `<div class="contact-card"><div class="contact-icon">💬</div><div class="contact-label">문의</div><div class="contact-value">편하게 연락주세요</div></div>` : ""}
    </div>
  </div>
</section>

<footer>
  <p>© ${new Date().getFullYear()} ${bizName}. All rights reserved.</p>
  <p style="margin-top:8px">Powered by <a href="https://contavelo.ai">콘타벨로AI</a></p>
</footer>

${phone ? `<a href="tel:${phone}" class="float-btn">📞 전화하기</a>` : ""}

</body>
</html>`;
}

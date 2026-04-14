import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { section, name, industry, description, target, funding } = await req.json();

  const prompt = `사업명: ${name || "미정"}
업종: ${industry || "미정"}
사업 설명: ${description || "미정"}
타겟 고객: ${target || "미정"}
자금 규모: ${funding || "미정"}

위 사업 정보를 바탕으로 "${section}" 섹션을 작성해주세요.
구체적인 수치와 데이터를 포함하고, 마크다운 형식(### 소제목, - 불릿, | 표 |)을 사용하세요.`;

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
    system: "당신은 정부 지원사업 신청서 및 사업계획서 전문 컨설턴트입니다. 심사위원이 높은 점수를 줄 수 있도록 전문적이면서 읽기 쉽게 작성합니다. 한국어로 작성하세요.",
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

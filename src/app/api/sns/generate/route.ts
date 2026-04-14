import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  const { prompt, userId } = await req.json();

  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
    system: "당신은 소상공인을 위한 SNS 마케팅 전문가입니다. 인스타그램, 네이버 블로그, 페이스북에 올릴 수 있는 게시물을 작성합니다. 이모지를 적절히 사용하고, 해시태그를 포함하세요. 한국어로 작성하세요.",
  });

  let totalTokens = 0;
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(event.delta.text));
          totalTokens += event.delta.text.length;
        }
      }
      controller.close();
      // Log API usage
      supabase.from("api_logs").insert({ user_id: userId || null, endpoint: "sns/generate", tokens_used: totalTokens, cost: totalTokens * 0.00001 }).then(() => {});
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

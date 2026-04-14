import { extractText } from "unpdf";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return Response.json({ error: "No file" }, { status: 400 });

    const buffer = new Uint8Array(await file.arrayBuffer());
    const result = await extractText(buffer);
    const text = Array.isArray(result.text) ? result.text.join("\n") : String(result.text);

    return Response.json({ text, pages: result.totalPages });
  } catch (e: any) {
    return Response.json({ error: e.message || "Parse failed" }, { status: 500 });
  }
}

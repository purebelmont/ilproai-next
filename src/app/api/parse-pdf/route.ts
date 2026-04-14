import pdfParse from "pdf-parse";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return Response.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);

    return Response.json({ text: data.text, pages: data.numpages });
  } catch (e: any) {
    return Response.json({ error: e.message || "Parse failed" }, { status: 500 });
  }
}

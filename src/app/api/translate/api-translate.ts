// API TRANSLATE - /src/app/api/translate/route.ts
import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return Response.json({ error: 'Kode dan bahasa pemrograman diperlukan' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Kamu adalah asisten pemrograman yang ahli. Tugas kamu adalah menjelaskan kode pemrograman dalam Bahasa Indonesia.

Kamu HARUS merespons dalam format JSON yang VALID (tanpa markdown):
{
  "ringkasan": "Ringkasan singkat",
  "penjelasanBaris": [{ "baris": 1, "kode": "kode", "penjelasan": "penjelasan" }],
  "konsepPenting": ["konsep1"],
  "tips": "tips berguna",
  "contohPenggunaan": "contoh"
}`
        },
        { role: 'user', content: `Jelaskan kode ${language} berikut:\n\n\`\`\`${language}\n${code}\n\`\`\`` }
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return Response.json({ error: 'Tidak ada respons' }, { status: 500 });

    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) cleanContent = cleanContent.slice(7);
    else if (cleanContent.startsWith('```')) cleanContent = cleanContent.slice(3);
    if (cleanContent.endsWith('```')) cleanContent = cleanContent.slice(0, -3);
    cleanContent = cleanContent.trim();

    try {
      return Response.json({ result: JSON.parse(cleanContent) });
    } catch {
      return Response.json({ result: { ringkasan: "Penjelasan", penjelasanBaris: [], konsepPenting: [], tips: cleanContent, contohPenggunaan: "" }});
    }
  } catch (error) {
    return Response.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}

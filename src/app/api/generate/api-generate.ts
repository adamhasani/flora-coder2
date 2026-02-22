// API GENERATE - /src/app/api/generate/route.ts
import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { description, language } = await request.json();

    if (!description || !language) {
      return Response.json({ error: 'Deskripsi dan bahasa diperlukan' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Kamu adalah programmer ahli. Buat kode dari deskripsi user.

Format JSON (tanpa markdown):
{
  "kode": "kode yang dihasilkan",
  "penjelasan": "penjelasan singkat",
  "caraPakai": "cara menggunakan",
  "tips": "tips optimasi"
}`
        },
        { role: 'user', content: `Buatkan kode ${language} untuk: ${description}` }
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
      return Response.json({ result: { kode: cleanContent, penjelasan: "Kode dibuat", caraPakai: "Jalankan kode", tips: "Sesuaikan dengan kebutuhan" }});
    }
  } catch (error) {
    return Response.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}

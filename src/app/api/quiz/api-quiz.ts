// API QUIZ - /src/app/api/quiz/route.ts
import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, language, difficulty } = await request.json();

    if (!code || !language) {
      return Response.json({ error: 'Kode dan bahasa diperlukan' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Kamu adalah quiz master. Buat pertanyaan dari kode.

Format JSON (tanpa markdown):
{
  "pertanyaan": "Pertanyaan tentang kode",
  "pilihan": [{"label": "A", "text": "Pilihan"}, {"label": "B", "text": "Pilihan"}, {"label": "C", "text": "Pilihan"}, {"label": "D", "text": "Pilihan"}],
  "jawabanBenar": "A/B/C/D",
  "penjelasan": "Penjelasan jawaban",
  "level": "mudah/sedang/sulit"
}`
        },
        { role: 'user', content: `Buat quiz ${difficulty || 'sedang'} dari kode ${language}:\n\n\`\`\`${language}\n${code}\n\`\`\`` }
      ],
      temperature: 0.8,
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
      return Response.json({ result: { pertanyaan: "Apa output kode di atas?", pilihan: [{label:"A",text:"Lihat kode"},{label:"B",text:"Error"},{label:"C",text:"Undefined"},{label:"D",text:"Null"}], jawabanBenar: "A", penjelasan: cleanContent, level: "sedang" }});
    }
  } catch (error) {
    return Response.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}

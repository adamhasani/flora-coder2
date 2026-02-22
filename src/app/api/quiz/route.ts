import ZAI from 'z-ai-web-dev-sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { code, language } = await req.json();
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 });
  
  const zai = await ZAI.create();
  const c = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: 'Buat quiz. Format JSON: {"pertanyaan":"...","pilihan":[{"label":"A","text":"..."}],"jawabanBenar":"A","penjelasan":"..."}' },
      { role: 'user', content: `Quiz dari: ${code}` }
    ]
  });
  
  return NextResponse.json({ result: { pertanyaan: c.choices[0]?.message?.content || '', pilihan: [{ label: 'A', text: 'A' }, { label: 'B', text: 'B' }], jawabanBenar: 'A', penjelasan: '', level: 'sedang' } });
}

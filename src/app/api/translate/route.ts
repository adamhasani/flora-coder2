import ZAI from 'z-ai-web-dev-sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { code, language } = await req.json();
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 });
  
  const zai = await ZAI.create();
  const c = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: 'Jelaskan kode dalam Bahasa Indonesia. Format JSON: {"ringkasan":"...","penjelasanBaris":[{"baris":1,"kode":"...","penjelasan":"..."}],"konsepPenting":[],"tips":"..."}' },
      { role: 'user', content: `Jelaskan: ${code}` }
    ]
  });
  
  return NextResponse.json({ result: { ringkasan: c.choices[0]?.message?.content || '', penjelasanBaris: [], konsepPenting: [], tips: '' } });
}

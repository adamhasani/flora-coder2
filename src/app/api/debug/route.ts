
import ZAI from 'z-ai-web-dev-sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { code, language } = await req.json();
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 });
  
  const zai = await ZAI.create();
  const c = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: 'Cari bug. Format JSON: {"adaError":true,"daftarError":[],"kodePerbaikan":"..."}' },
      { role: 'user', content: `Debug: ${code}` }
    ]
  });
  
  return NextResponse.json({ result: { adaError: false, daftarError: [], kodePerbaikan: code, tipsPencegahan: c.choices[0]?.message?.content || '' } });
}

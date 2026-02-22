import ZAI from 'z-ai-web-dev-sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { description, language } = await req.json();
  if (!description) return NextResponse.json({ error: 'No description' }, { status: 400 });
  
  const zai = await ZAI.create();
  const c = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: 'Buat kode. Format JSON: {"kode":"...","penjelasan":"..."}' },
      { role: 'user', content: `Buat ${language}: ${description}` }
    ]
  });
  
  return NextResponse.json({ result: { kode: c.choices[0]?.message?.content || '', penjelasan: '' } });
}

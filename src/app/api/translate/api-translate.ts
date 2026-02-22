import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Kode dan bahasa diperlukan' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Kamu adalah asisten pemrograman. Jelaskan kode dalam Bahasa Indonesia.

Format JSON:
{
  "ringkasan": "ringkasan",
  "penjelasanBaris": [{"baris": 1, "kode": "kode", "penjelasan": "penjelasan"}],
  "konsepPenting": ["konsep"],
  "tips": "tips"
}`
        },
        { role: 'user', content: `Jelaskan kode ${language}:\n\n${code}` }
      ],
    });

    const content = completion.choices[0]?.message?.content || '';
    
    return NextResponse.json({ result: { ringkasan: content, penjelasanBaris: [], konsepPenting: [], tips: '' } });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

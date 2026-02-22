'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, Loader2, Copy, Check, Terminal, Target, Wand2, Bug, Brain, Heart, Binary, Sun, Moon, History, X, Info, Download } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [tab, setTab] = useState('translate')
  const [lang, setLang] = useState('javascript')
  const [code, setCode] = useState('')
  const [desc, setDesc] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  useEffect(() => {
    const h = localStorage.getItem('h')
    if (h) setHistory(JSON.parse(h))
  }, [])

  const langs = [
    { v: 'javascript', l: 'JavaScript', i: '🟨' },
    { v: 'python', l: 'Python', i: '🐍' },
    { v: 'java', l: 'Java', i: '☕' },
    { v: 'typescript', l: 'TypeScript', i: '🔷' },
    { v: 'go', l: 'Go', i: '🐹' },
    { v: 'php', l: 'PHP', i: '🐘' },
    { v: 'sql', l: 'SQL', i: '🗃️' },
    { v: 'html', l: 'HTML', i: '🌐' },
    { v: 'css', l: 'CSS', i: '🎨' },
  ]

  const callAPI = async (ep: string, body: any) => {
    setLoading(true); setError(null); setResult(null); setQuizAnswer(null)
    try {
      const r = await fetch(`/api/${ep}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Error')
      setResult(d.result)
      const h = [{ id: Date.now(), t: ep, l: lang, i: ep === 'generate' ? desc : code, o: JSON.stringify(d.result), tm: Date.now() }, ...history].slice(0, 30)
      setHistory(h); localStorage.setItem('h', JSON.stringify(h))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const isLight = theme === 'light'

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'}`}>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${isLight ? 'bg-blue-200/50' : 'bg-blue-600/20'}`} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity }} />
      </div>

      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-slate-700'}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl"><Binary className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-xl font-bold">Code Translator</h1><p className="text-xs opacity-60">AI-Powered</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded-lg ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}><History className="w-5 h-5" /></button>
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-lg ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}>{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            {result && <button onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'text/plain' })); a.download = 'result.txt'; a.click() }} className={`p-2 rounded-lg ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}><Download className="w-5 h-5" /></button>}
          </div>
        </div>
      </header>

      <AnimatePresence>{showHistory && (
        <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowHistory(false)} />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className={`fixed right-0 top-0 h-full w-80 z-50 border-l p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
          <div className="flex justify-between mb-4"><h3 className="font-semibold">Riwayat ({history.length})</h3><button onClick={() => { setHistory([]); localStorage.removeItem('h'); setShowHistory(false) }} className="text-red-400 text-sm">Clear</button></div>
          <div className="space-y-2 overflow-y-auto h-[calc(100vh-80px)]">{history.length === 0 ? <p className="text-center opacity-50">Kosong</p> : history.map((h: any, i) => <div key={i} className={`p-2 rounded ${isLight ? 'bg-slate-50' : 'bg-slate-800'}`}>{h.t}</div>)}</div>
        </motion.div></>
      )}</AnimatePresence>

      <main className="container mx-auto px-4 py-6">
        <div className="text-center mb-6"><h2 className="text-2xl font-bold">{tab === 'translate' ? 'Terjemahkan Kode' : tab === 'generate' ? 'Buat Kode' : tab === 'debug' ? 'Debug' : 'Quiz'}</h2></div>

        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {['translate', 'generate', 'debug', 'quiz'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg ${tab === t ? t === 'translate' ? 'bg-blue-500' : t === 'generate' ? 'bg-emerald-500' : t === 'debug' ? 'bg-red-500' : 'bg-amber-500' : isLight ? 'bg-slate-200' : 'bg-slate-800'} text-white`}>{t === 'translate' ? 'Terjemahkan' : t === 'generate' ? 'Buat Kode' : t === 'debug' ? 'Debug' : 'Quiz'}</button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`rounded-2xl border p-6 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
            <h3 className="font-semibold mb-4">{tab === 'generate' ? 'Deskripsi' : 'Kode'}</h3>
            <select value={lang} onChange={e => setLang(e.target.value)} className={`w-full p-3 rounded-lg mb-4 ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}>{langs.map(l => <option key={l.v} value={l.v}>{l.i} {l.l}</option>)}</select>
            <textarea placeholder={tab === 'generate' ? 'Deskripsikan kode...' : 'Paste kode...'} value={tab === 'generate' ? desc : code} onChange={e => tab === 'generate' ? setDesc(e.target.value) : setCode(e.target.value)} className={`w-full p-4 rounded-lg min-h-[200px] font-mono text-sm ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`} />
            <button onClick={() => tab === 'translate' ? callAPI('translate', { code, language: lang }) : tab === 'generate' ? callAPI('generate', { description: desc, language: lang }) : tab === 'debug' ? callAPI('debug', { code, language: lang }) : callAPI('quiz', { code, language: lang })} disabled={loading || (tab === 'generate' ? !desc.trim() : !code.trim())} className={`w-full mt-4 py-3 rounded-xl font-semibold text-white disabled:opacity-50 ${tab === 'translate' ? 'bg-blue-500' : tab === 'generate' ? 'bg-emerald-500' : tab === 'debug' ? 'bg-red-500' : 'bg-amber-500'}`}>{loading ? 'Loading...' : 'Submit'}</button>
          </div>

          <div className={`rounded-2xl border p-6 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
            <h3 className="font-semibold mb-4">Hasil</h3>
            {loading ? <div className="text-center py-10"><Loader2 className="w-10 h-10 mx-auto animate-spin text-blue-500" /></div> : result ? (
              <div className="space-y-3 overflow-y-auto max-h-[350px]">
                {tab === 'translate' && result.ringkasan && <div className={`p-4 rounded-xl ${isLight ? 'bg-blue-50' : 'bg-blue-500/10'}`}><p>{result.ringkasan}</p></div>}
                {tab === 'generate' && result.kode && <SyntaxHighlighter language="javascript" style={isLight ? oneLight : oneDark} customStyle={{ margin: 0, borderRadius: '0.5rem' }}>{result.kode}</SyntaxHighlighter>}
                {tab === 'debug' && result.adaError && <div className="p-4 rounded-xl bg-red-500/10"><p>Error ditemukan</p></div>}
                {tab === 'quiz' && result.pertanyaan && <div><p className="font-medium mb-3">{result.pertanyaan}</p><div className="space-y-2">{result.pilihan?.map((p: any) => <button key={p.label} onClick={() => { if (!quizAnswer) { setQuizAnswer(p.label); if (p.label === result.jawabanBenar) setScore(s => ({ correct: s.correct + 1, total: s.total + 1 })); else setScore(s => ({ ...s, total: s.total + 1 })); } }} disabled={!!quizAnswer} className={`w-full p-3 text-left rounded-lg border ${quizAnswer && p.label === result.jawabanBenar ? 'bg-emerald-500/20 border-emerald-500' : quizAnswer === p.label ? 'bg-red-500/20 border-red-500' : 'border-slate-600'}`}>{p.label}. {p.text}</button>)}</div></div>}
              </div>
            ) : <div className="text-center py-10 opacity-60">Masukkan input di kiri</div>}
          </div>
        </div>

        <footer className="text-center py-6 mt-8 border-t border-slate-700"><p className="opacity-60">Dibuat dengan <Heart className="w-4 h-4 inline text-red-500 fill-red-500" /> untuk Indonesia</p></footer>
      </main>

      <AnimatePresence>{error && <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-4 left-4 right-4 p-4 bg-red-500 rounded-xl text-white z-50"><div className="flex items-center gap-2"><Info className="w-5 h-5" /><span>{error}</span><button onClick={() => setError(null)} className="ml-auto"><X className="w-5 h-5" /></button></div></motion.div>}</AnimatePresence>
    </div>
  )
}

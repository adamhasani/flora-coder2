'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code2, Sparkles, BookOpen, Lightbulb, Loader2, Copy, Check, Terminal, 
  Zap, Target, Wand2, Info, Heart, Binary, Sun, Moon, History, Trash2, 
  Download, Bug, Brain, Trophy, RefreshCw, X, Clock
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface TranslationResult {
  ringkasan: string
  penjelasanBaris: Array<{ baris: number; kode: string; penjelasan: string }>
  konsepPenting: string[]
  tips: string
}

interface GenerateResult {
  kode: string
  penjelasan: string
  caraPakai: string
  tips: string
}

interface DebugResult {
  adaError: boolean
  daftarError: Array<{ baris: number; jenis: string; deskripsi: string; solusi: string }>
  kodePerbaikan: string
  tipsPencegahan: string
}

interface QuizResult {
  pertanyaan: string
  pilihan: Array<{ label: string; text: string }>
  jawabanBenar: string
  penjelasan: string
  level: string
}

interface HistoryItem {
  id: string
  type: 'translate' | 'generate' | 'debug' | 'quiz'
  language: string
  input: string
  output: string
  timestamp: number
}

const languages = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'sql', label: 'SQL', icon: '🗃️' },
  { value: 'html', label: 'HTML', icon: '🌐' },
  { value: 'css', label: 'CSS', icon: '🎨' },
]

const getLang = (lang: string): string => {
  const map: Record<string, string> = {
    javascript: 'javascript', python: 'python', java: 'java',
    typescript: 'typescript', go: 'go', rust: 'rust',
    php: 'php', sql: 'sql', html: 'html', css: 'css'
  }
  return map[lang] || 'javascript'
}

export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [activeTab, setActiveTab] = useState('translate')
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [desc, setDesc] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<TranslationResult | GenerateResult | DebugResult | QuizResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  useEffect(() => {
    const saved = localStorage.getItem('history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const saveHistory = useCallback((type: HistoryItem['type'], input: string, output: string) => {
    const item = { id: Date.now().toString(), type, language, input, output: JSON.stringify(output), timestamp: Date.now() }
    const updated = [item, ...history].slice(0, 50)
    setHistory(updated)
    localStorage.setItem('history', JSON.stringify(updated))
  }, [history, language])

  const clearHistory = () => { setHistory([]); localStorage.removeItem('history') }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportResult = () => {
    if (!result) return
    const content = `CODE TRANSLATOR\nBahasa: ${language}\n\n${JSON.stringify(result, null, 2)}`
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `result-${Date.now()}.txt`
    a.click()
  }

  const callAPI = async (endpoint: string, body: object) => {
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setResult(data.result)
      return data.result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleTranslate = async () => {
    if (!code.trim()) { setError('Masukkan kode!'); return }
    const res = await callAPI('translate', { code, language })
    if (res) saveHistory('translate', code, res)
  }

  const handleGenerate = async () => {
    if (!desc.trim()) { setError('Masukkan deskripsi!'); return }
    const res = await callAPI('generate', { description: desc, language })
    if (res) { setCode(res.kode); saveHistory('generate', desc, res) }
  }

  const handleDebug = async () => {
    if (!code.trim()) { setError('Masukkan kode!'); return }
    const res = await callAPI('debug', { code, language, errorMessage: errorMsg })
    if (res) saveHistory('debug', code, res)
  }

  const handleQuiz = async () => {
    if (!code.trim()) { setError('Masukkan kode!'); return }
    setQuizAnswer(null)
    const res = await callAPI('quiz', { code, language })
    if (res) saveHistory('quiz', code, res)
  }

  const handleQuizAnswer = (answer: string) => {
    if (quizAnswer) return
    setQuizAnswer(answer)
    if (answer === (result as QuizResult).jawabanBenar) {
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }))
    } else {
      setScore(s => ({ ...s, total: s.total + 1 }))
    }
  }

  const isLight = theme === 'light'

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'}`}>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div 
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${isLight ? 'bg-blue-200/50' : 'bg-blue-600/20'}`}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-slate-700'}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
              <Binary className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Code Translator</h1>
              <p className="text-xs opacity-60">AI-Powered</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded-lg ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}>
              <History className="w-5 h-5" />
            </button>
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-lg ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {result && (
              <button onClick={exportResult} className={`p-2 rounded-lg ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}>
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowHistory(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className={`fixed right-0 top-0 h-full w-80 z-50 border-l p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Riwayat ({history.length})</h3>
                <div className="flex gap-2">
                  <button onClick={clearHistory} className="text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => setShowHistory(false)} className="p-1"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
                {history.length === 0 ? <div className="text-center py-8 opacity-50"><Clock className="w-8 h-8 mx-auto mb-2" /><p>Belum ada riwayat</p></div> : history.map(item => (
                  <div key={item.id} className={`p-3 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-slate-800'}`}>
                    <span className={`text-xs px-2 py-0.5 rounded text-white ${item.type === 'translate' ? 'bg-blue-500' : item.type === 'generate' ? 'bg-emerald-500' : item.type === 'debug' ? 'bg-red-500' : 'bg-amber-500'}`}>{item.type}</span>
                    <p className="text-sm mt-1 truncate">{item.input.slice(0, 30)}...</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {activeTab === 'translate' && 'Terjemahkan Kode'}
            {activeTab === 'generate' && 'Buat Kode dari Deskripsi'}
            {activeTab === 'debug' && 'Deteksi Bug'}
            {activeTab === 'quiz' && 'Quiz Pemahaman'}
          </h2>
        </div>

        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {['translate', 'generate', 'debug', 'quiz'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab ? tab === 'translate' ? 'bg-blue-500 text-white' : tab === 'generate' ? 'bg-emerald-500 text-white' : tab === 'debug' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white' : isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
              {tab === 'translate' && 'Terjemahkan'}{tab === 'generate' && 'Buat Kode'}{tab === 'debug' && 'Debug'}{tab === 'quiz' && 'Quiz'}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`rounded-2xl border p-6 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Terminal className="w-5 h-5 text-blue-500" />{activeTab === 'generate' ? 'Deskripsi' : 'Input Kode'}</h3>
            <select value={language} onChange={e => setLanguage(e.target.value)} className={`w-full p-3 rounded-lg mb-4 ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}>
              {languages.map(l => (<option key={l.value} value={l.value}>{l.icon} {l.label}</option>))}
            </select>
            {activeTab === 'generate' ? (
              <textarea placeholder="Contoh: Fungsi menghitung luas..." value={desc} onChange={e => setDesc(e.target.value)} className={`w-full p-4 rounded-lg min-h-[200px] font-mono text-sm ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`} />
            ) : (
              <textarea placeholder="Paste kode di sini..." value={code} onChange={e => setCode(e.target.value)} className={`w-full p-4 rounded-lg min-h-[250px] font-mono text-sm ${isLight ? 'bg-slate-900 text-white' : 'bg-slate-950'}`} />
            )}
            {activeTab === 'debug' && <input type="text" placeholder="Pesan error (opsional)" value={errorMsg} onChange={e => setErrorMsg(e.target.value)} className={`w-full p-3 rounded-lg mt-4 ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`} />}
            {activeTab === 'quiz' && (
              <div className="flex items-center gap-2 mt-4">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-sm"><Trophy className="w-4 h-4 inline mr-1" />Skor: {score.correct}/{score.total}</span>
                <button onClick={() => setScore({ correct: 0, total: 0 })} className="text-sm opacity-60">Reset</button>
              </div>
            )}
            <button onClick={activeTab === 'translate' ? handleTranslate : activeTab === 'generate' ? handleGenerate : activeTab === 'debug' ? handleDebug : handleQuiz} disabled={loading || (activeTab === 'generate' ? !desc.trim() : !code.trim())} className={`w-full mt-4 py-3 rounded-xl font-semibold text-white disabled:opacity-50 ${activeTab === 'translate' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : activeTab === 'generate' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : activeTab === 'debug' ? 'bg-gradient-to-r from-red-500 to-orange-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`}>
              {loading ? <><Loader2 className="w-5 h-5 inline mr-2 animate-spin" />Proses...</> : <>{activeTab === 'translate' && <><Sparkles className="w-5 h-5 inline mr-2" />Terjemahkan</>}{activeTab === 'generate' && <><Wand2 className="w-5 h-5 inline mr-2" />Buat Kode</>}{activeTab === 'debug' && <><Bug className="w-5 h-5 inline mr-2" />Debug</>}{activeTab === 'quiz' && <><Brain className="w-5 h-5 inline mr-2" />Quiz</>}</>}
            </button>
          </div>

          <div className={`rounded-2xl border p-6 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-500" />Hasil</h3>
            {loading ? <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" /><p className="mt-4 opacity-60">AI bekerja...</p></div> : result ? (
              <div className="space-y-4 overflow-y-auto max-h-[400px]">
                {activeTab === 'translate' && 'ringkasan' in result && (
                  <>
                    <div className={`p-4 rounded-xl ${isLight ? 'bg-blue-50' : 'bg-blue-500/10'}`}><h4 className="font-semibold text-blue-400 mb-2">Ringkasan</h4><p className="opacity-80">{(result as TranslationResult).ringkasan}</p></div>
                    {(result as TranslationResult).penjelasanBaris?.map((item, i) => (
                      <div key={i} className={`p-3 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-slate-700/50'}`}>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded mr-2">{item.baris}</span>
                        <code className="text-xs text-emerald-400">{item.kode}</code>
                        <p className="text-sm mt-1 opacity-80">{item.penjelasan}</p>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">{(result as TranslationResult).konsepPenting?.map((k, i) => (<span key={i} className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">{k}</span>))}</div>
                  </>
                )}
                {activeTab === 'generate' && 'kode' in result && (
                  <>
                    <div className="relative">
                      <button onClick={() => handleCopy((result as GenerateResult).kode)} className="absolute top-2 right-2 z-10 p-2 bg-slate-700 rounded-lg">{copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}</button>
                      <SyntaxHighlighter language={getLang(language)} style={isLight ? oneLight : oneDark} customStyle={{ margin: 0, borderRadius: '0.75rem' }}>{(result as GenerateResult).kode}</SyntaxHighlighter>
                    </div>
                    <div className={`p-4 rounded-xl ${isLight ? 'bg-emerald-50' : 'bg-emerald-500/10'}`}><h4 className="font-semibold text-emerald-400 mb-2">Penjelasan</h4><p className="text-sm opacity-80">{(result as GenerateResult).penjelasan}</p></div>
                  </>
                )}
                {activeTab === 'debug' && 'adaError' in result && (
                  (result as DebugResult).adaError ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <h4 className="font-semibold text-red-400 mb-2">Error Ditemukan</h4>
                      {(result as DebugResult).daftarError?.map((err, i) => (
                        <div key={i} className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex gap-2 mb-1"><span className="text-xs bg-slate-600 px-2 py-0.5 rounded">Baris {err.baris}</span><span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">{err.jenis}</span></div>
                          <p className="text-sm opacity-80">{err.deskripsi}</p>
                          <p className="text-sm text-emerald-400 mt-1">Solusi: {err.solusi}</p>
                        </div>
                      ))}
                    </div>
                  ) : <div className={`p-4 rounded-xl ${isLight ? 'bg-emerald-50' : 'bg-emerald-500/10'}`}><h4 className="font-semibold text-emerald-400 mb-2">Tidak Ada Error!</h4><p className="opacity-80">{(result as DebugResult).tipsPencegahan}</p></div>
                )}
                {activeTab === 'quiz' && 'pertanyaan' in result && (
                  <>
                    <div className={`p-4 rounded-xl ${isLight ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">{(result as QuizResult).level}</span>
                      <p className="text-lg font-medium mt-2">{(result as QuizResult).pertanyaan}</p>
                    </div>
                    <div className="space-y-2">
                      {(result as QuizResult).pilihan?.map(p => (
                        <button key={p.label} onClick={() => handleQuizAnswer(p.label)} disabled={!!quizAnswer} className={`w-full p-4 text-left rounded-xl border transition-all ${quizAnswer ? p.label === (result as QuizResult).jawabanBenar ? 'bg-emerald-500/20 border-emerald-500' : quizAnswer === p.label ? 'bg-red-500/20 border-red-500' : '' : 'border-slate-600 hover:border-amber-500'}`}>
                          <span className="font-bold mr-2">{p.label}.</span>{p.text}
                        </button>
                      ))}
                    </div>
                    {quizAnswer && (
                      <div className={`p-4 rounded-xl ${quizAnswer === (result as QuizResult).jawabanBenar ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        <p className={`font-semibold mb-2 ${quizAnswer === (result as QuizResult).jawabanBenar ? 'text-emerald-400' : 'text-red-400'}`}>{quizAnswer === (result as QuizResult).jawabanBenar ? 'Benar!' : 'Salah!'}</p>
                        <p className="text-sm opacity-80">{(result as QuizResult).penjelasan}</p>
                        <button onClick={handleQuiz} className="mt-3 px-4 py-2 bg-slate-700 rounded-lg text-sm">Quiz Berikutnya</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : <div className="text-center py-20"><Target className="w-16 h-16 mx-auto opacity-30" /><p className="mt-4 opacity-60">Masukkan kode di kiri</p></div>}
          </div>
        </div>

        <footer className="text-center py-6 mt-8 border-t border-slate-700">
          <p className="opacity-60">Dibuat dengan <Heart className="w-4 h-4 inline text-red-500 fill-red-500" /> untuk pemula Indonesia</p>
        </footer>
      </main>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-4 left-4 right-4 p-4 bg-red-500 rounded-xl text-white z-50">
            <div className="flex items-center gap-2"><Info className="w-5 h-5" /><span>{error}</span><button onClick={() => setError(null)} className="ml-auto"><X className="w-5 h-5" /></button></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code2, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Loader2, 
  Copy, 
  Check,
  Terminal,
  Zap,
  Target,
  Wand2,
  Info,
  Heart,
  Binary,
  Sun,
  Moon,
  History,
  Trash2,
  Download,
  Bug,
  Brain,
  Trophy,
  RefreshCw,
  X,
  Clock
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Types
interface TranslationResult {
  ringkasan: string
  penjelasanBaris: Array<{ baris: number; kode: string; penjelasan: string }>
  konsepPenting: string[]
  tips: string
  contohPenggunaan: string
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
  penjelasanPerbaikan: string
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

const programmingLanguages = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'csharp', label: 'C#', icon: '💜' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'swift', label: 'Swift', icon: '🍎' },
  { value: 'kotlin', label: 'Kotlin', icon: '🎯' },
  { value: 'sql', label: 'SQL', icon: '🗃️' },
  { value: 'html', label: 'HTML', icon: '🌐' },
  { value: 'css', label: 'CSS', icon: '🎨' },
]

const quickExamples = [
  { title: 'Loop', language: 'javascript', code: `const arr = [1, 2, 3];\narr.forEach(x => console.log(x));` },
  { title: 'Function', language: 'python', code: `def halo(nama):\n    return f"Halo {nama}"` },
  { title: 'Class', language: 'java', code: `class User {\n    String name;\n}` },
]

const generateExamples = ["Fungsi faktorial", "Sortir array", "API REST"]

const getLanguageForHighlighter = (lang: string): string => {
  const mapping: Record<string, string> = {
    'javascript': 'javascript', 'typescript': 'typescript', 'python': 'python',
    'java': 'java', 'csharp': 'csharp', 'cpp': 'cpp', 'go': 'go', 'rust': 'rust',
    'php': 'php', 'ruby': 'ruby', 'swift': 'swift', 'kotlin': 'kotlin',
    'sql': 'sql', 'html': 'html', 'css': 'css',
  }
  return mapping[lang] || 'javascript'
}

export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [activeTab, setActiveTab] = useState('translate')
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [generateDesc, setGenerateDesc] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [result, setResult] = useState<TranslationResult | GenerateResult | DebugResult | QuizResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 })

  useEffect(() => {
    const saved = localStorage.getItem('codeTranslatorHistory')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const saveToHistory = useCallback((type: HistoryItem['type'], input: string, output: string) => {
    const newItem = { id: Date.now().toString(), type, language, input, output: JSON.stringify(output), timestamp: Date.now() }
    const updated = [newItem, ...history].slice(0, 50)
    setHistory(updated)
    localStorage.setItem('codeTranslatorHistory', JSON.stringify(updated))
  }, [history, language])

  const clearHistory = () => { setHistory([]); localStorage.removeItem('codeTranslatorHistory') }
  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    localStorage.setItem('codeTranslatorHistory', JSON.stringify(updated))
  }

  const loadFromHistory = (item: HistoryItem) => {
    setActiveTab(item.type); setLanguage(item.language)
    if (item.type === 'generate') setGenerateDesc(item.input)
    else setCode(item.input)
    try { setResult(JSON.parse(item.output)) } catch {}
    setShowHistory(false)
  }

  const exportResult = () => {
    if (!result) return
    const content = `CODE TRANSLATOR - Hasil\nBahasa: ${language}\nWaktu: ${new Date().toLocaleString('id-ID')}\n\n${JSON.stringify(result, null, 2)}`
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `result-${Date.now()}.txt`
    a.click()
  }

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const handleTranslate = async () => {
    if (!code.trim()) { setError('Masukkan kode!'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, language }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result); saveToHistory('translate', code, data.result)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') }
    finally { setLoading(false) }
  }

  const handleGenerate = async () => {
    if (!generateDesc.trim()) { setError('Masukkan deskripsi!'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: generateDesc, language }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result); setCode(data.result.kode); saveToHistory('generate', generateDesc, data.result)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') }
    finally { setLoading(false) }
  }

  const handleDebug = async () => {
    if (!code.trim()) { setError('Masukkan kode!'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/debug', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, language, errorMessage }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result); saveToHistory('debug', code, data.result)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') }
    finally { setLoading(false) }
  }

  const handleQuiz = async () => {
    if (!code.trim()) { setError('Masukkan kode!'); return }
    setLoading(true); setError(null); setResult(null); setQuizAnswer(null)
    try {
      const res = await fetch('/api/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, language }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result); saveToHistory('quiz', code, data.result)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') }
    finally { setLoading(false) }
  }

  const handleQuizAnswer = (answer: string) => {
    if (quizAnswer) return
    setQuizAnswer(answer)
    if (answer === (result as QuizResult).jawabanBenar) setQuizScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
    else setQuizScore(prev => ({ ...prev, total: prev.total + 1 }))
  }

  useEffect(() => { document.documentElement.classList.toggle('light-mode', theme === 'light') }, [theme])
  const isLight = theme === 'light'

  return (
    <div className={`min-h-screen ${isLight ? 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100' : 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950'}`}>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${isLight ? 'bg-blue-300/30' : 'bg-blue-500/20'}`} animate={{ x: [0, 100, 0], scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity }} />
        <motion.div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${isLight ? 'bg-indigo-300/30' : 'bg-indigo-500/15'}`} animate={{ x: [0, -100, 0] }} transition={{ duration: 25, repeat: Infinity }} />
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isLight ? 'border-slate-200 bg-white/70' : 'border-white/10 bg-slate-900/70'}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-2 rounded-2xl">
              <Binary className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Code Translator</h1>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>AI-Powered • Bahasa Indonesia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className={isLight ? 'text-slate-600' : 'text-slate-300'}>
              <History className="w-4 h-4 mr-1" /> Riwayat {history.length > 0 && <Badge className="ml-1">{history.length}</Badge>}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={isLight ? 'text-slate-600' : 'text-slate-300'}>
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {result && <Button variant="ghost" size="sm" onClick={exportResult} className={isLight ? 'text-slate-600' : 'text-slate-300'}><Download className="w-4 h-4 mr-1" /> Export</Button>}
          </div>
        </div>
      </header>

      {/* History Sidebar */}
      <AnimatePresence>{showHistory && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowHistory(false)} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className={`fixed right-0 top-0 h-full w-80 z-50 border-l ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Riwayat ({history.length})</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={clearHistory} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}><X className="w-4 h-4" /></Button>
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-65px)] p-4">
              {history.length === 0 ? <div className="text-center py-8"><Clock className="w-12 h-12 mx-auto text-slate-500" /><p className="text-slate-400 mt-2">Belum ada riwayat</p></div> :
                history.map(item => (
                  <div key={item.id} onClick={() => loadFromHistory(item)} className={`p-3 rounded-lg mb-2 cursor-pointer ${isLight ? 'bg-slate-50 hover:bg-slate-100' : 'bg-slate-800/50 hover:bg-slate-800'}`}>
                    <Badge className={`text-xs ${item.type === 'translate' ? 'bg-blue-500' : item.type === 'generate' ? 'bg-emerald-500' : item.type === 'debug' ? 'bg-red-500' : 'bg-amber-500'}`}>{item.type}</Badge>
                    <p className="text-sm truncate mt-1">{item.input.slice(0, 30)}...</p>
                  </div>
                ))}
            </ScrollArea>
          </motion.div>
        </>
      )}</AnimatePresence>

      <main className="container mx-auto px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
            {activeTab === 'translate' && '📝 Terjemahkan Kode'}
            {activeTab === 'generate' && '⚡ Buat Kode dari Deskripsi'}
            {activeTab === 'debug' && '🐛 Deteksi & Perbaiki Bug'}
            {activeTab === 'quiz' && '🎯 Quiz Pemahaman'}
          </h2>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className={`grid grid-cols-4 mb-6 ${isLight ? 'bg-white border' : 'bg-slate-800/50 border border-slate-700'}`}>
            <TabsTrigger value="translate" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"><BookOpen className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="generate" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><Wand2 className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="debug" className="data-[state=active]:bg-red-500 data-[state=active]:text-white"><Bug className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="quiz" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"><Brain className="w-4 h-4" /></TabsTrigger>
          </TabsList>

          {/* TRANSLATE */}
          <TabsContent value="translate">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className={isLight ? 'bg-white' : 'bg-slate-900/50 border-slate-700'}>
                <CardHeader><CardTitle className={isLight ? 'text-slate-800' : 'text-white'}><Terminal className="w-5 h-5 text-blue-500 mr-2 inline" />Input Kode</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className={isLight ? 'bg-white' : 'bg-slate-800'}><SelectValue /></SelectTrigger>
                    <SelectContent>{programmingLanguages.map(l => <SelectItem key={l.value} value={l.value}>{l.icon} {l.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Textarea placeholder="Paste kode di sini..." value={code} onChange={e => setCode(e.target.value)} className="min-h-[250px] font-mono bg-slate-950 text-white" />
                  <div className="flex gap-2">{quickExamples.map((ex, i) => <Button key={i} size="sm" variant="outline" onClick={() => { setLanguage(ex.language); setCode(ex.code) }}>{ex.title}</Button>)}</div>
                  <Button onClick={handleTranslate} disabled={loading || !code.trim()} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 h-12">
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menerjemahkan...</> : <><Sparkles className="w-5 h-5 mr-2" /> Terjemahkan</>}
                  </Button>
                </CardContent>
              </Card>
              <Card className={isLight ? 'bg-white' : 'bg-slate-900/50 border-slate-700'}>
                <CardHeader><CardTitle className={isLight ? 'text-slate-800' : 'text-white'}><BookOpen className="w-5 h-5 text-emerald-500 mr-2 inline" />Penjelasan</CardTitle></CardHeader>
                <CardContent>
                  {loading ? <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" /></div> :
                  result && 'ringkasan' in result ? (
                    <ScrollArea className="h-[350px]">
                      <div className={`p-4 rounded-xl mb-4 ${isLight ? 'bg-blue-50' : 'bg-blue-500/10'}`}><h4 className="font-semibold text-blue-300 mb-2">💡 Ringkasan</h4><p className="text-slate-300">{(result as TranslationResult).ringkasan}</p></div>
                      {(result as TranslationResult).penjelasanBaris?.map((item, i) => (
                        <div key={i} className={`flex gap-3 p-3 rounded-lg mb-2 ${isLight ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                          <Badge variant="outline">{item.baris}</Badge>
                          <div><code className="text-xs text-emerald-300">{item.kode}</code><p className="text-sm text-slate-300 mt-1">{item.penjelasan}</p></div>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2">{(result as TranslationResult).konsepPenting?.map((k, i) => <Badge key={i} className="bg-amber-500/20 text-amber-200">{k}</Badge>)}</div>
                    </ScrollArea>
                  ) : <div className="text-center py-20"><Target className="w-16 h-16 mx-auto text-slate-500" /><p className="text-slate-400 mt-4">Masukkan kode di kiri</p></div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* GENERATE */}
          <TabsContent value="generate">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className={isLight ? 'bg-white' : 'bg-slate-900/50 border-slate-700'}>
                <CardHeader><CardTitle className={isLight ? 'text-slate-800' : 'text-white'}><Wand2 className="w-5 h-5 text-emerald-500 mr-2 inline" />Deskripsi Kode</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className={isLight ? 'bg-white' : 'bg-slate-800'}><SelectValue /></SelectTrigger>
                    <SelectContent>{programmingLanguages.map(l => <SelectItem key={l.value} value={l.value}>{l.icon} {l.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Textarea placeholder="Contoh: Fungsi untuk menghitung luas lingkaran..." value={generateDesc} onChange={e => setGenerateDesc(e.target.value)} className={`min-h-[150px] ${isLight ? 'bg-white' : 'bg-slate-800'}`} />
                  <div className="flex gap-2">{generateExamples.map((ex, i) => <Button key={i} size="sm" variant="outline" onClick={() => setGenerateDesc(ex)}>{ex}</Button>)}</div>
                  <Button onClick={handleGenerate} disabled={loading || !generateDesc.trim()} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 h-12">
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Membuat...</> : <><Wand2 className="w-5 h-5 mr-2" /> Buatkan Kode</>}
                  </Button>
                </CardContent>
              </Card>
              <Card className={isLight ? 'bg-white' : 'bg-slate-900/50 border-slate-700'}>
                <CardHeader><CardTitle className={isLight ? 'text-slate-800' : 'text-white'}><Code2 className="w-5 h-5 text-blue-500 mr-2 inline" />Kode yang Dihasilkan</CardTitle></CardHeader>
                <CardContent>
                  {loading ? <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto animate-spin text-emerald-500" /></div> :
                  result && 'kode' in result ? (
                    <ScrollArea className="h-[350px]">
                      <div className="relative mb-4">
                        <Button size="sm" variant="ghost" onClick={() => handleCopy((result as GenerateResult).kode)} className="absolute top-2 right-2 z-10">{copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}</Button>
                        <SyntaxHighlighter language={getLanguageForHighlighter(language)} style={isLight ? oneLight : oneDark} customStyle={{ margin: 0, borderRadius: '0.75rem' }}>{(result as GenerateResult).kode}</SyntaxHighlighter>
                      </div>
                      <div className={`p-4 rounded-xl ${isLight ? 'bg-emerald-50' : 'bg-emerald-500/10'}`}><h4 className="font-semibold text-emerald-300 mb-2">📝 Penjelasan</h4><p className="text-slate-300 text-sm">{(result as GenerateResult).penjelasan}</p></div>
                    </ScrollArea>
                  ) : <div className="text-center py-20"><Wand2 className="w-16 h-16 mx-auto text-slate-500" /><p className="text-slate-400 mt-4">Deskripsikan kode yang kamu mau</p></div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DEBUG */}
          <TabsContent value="debug">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className={isLight ? 'bg-white' : 'bg-slate-900/50 border-slate-700'}>
                <CardHeader><CardTitle className={isLight ? 'text-slate-800' : 'text-white'}><Bug className="w-5 h-5 text-red-500 mr-2 inline" />Kode Bermasalah</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className={isLight ? 'bg-white' : 'bg-slate-800'}><SelectValue /></SelectTrigger>
                    <SelectContent>{programmingLanguages.map(l => <SelectItem key={l.value} value={l.value}>{l.icon} {l.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Textarea placeholder="Paste kode yang error..." value={code} onChange={e => setCode(e.target.value)} className="min-h-[200px] font-mono bg-slate-950 text-white" />
                  <Input placeholder="Pesan error (opsional)" value={errorMessage} onChange={e => setErrorMessage(e.target.value)} className={isLight ? 'bg-white' : 'bg-slate-800'} />
                  <Button onClick={handleDebug} disabled={loading || !code.trim()} className="w-full bg-gradient-to-r from-red-600 to-orange-600 h-12">
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menganalisis...</> : <><Bug className="w-5 h-5 mr-2" /> Deteksi & Perbaiki</>}
                  </Button>
                </CardContent>
              </Card>
              <Card className={isLight ? 'bg-white' : 'bg-slate-900/50 border-slate-700'}>
                <CardHeader><CardTitle className={isLight ? 'text-slate-800' : 'text-white'}><Lightbulb className="w-5 h-5 text-amber-500 mr-2 inline" />Hasil Analisis</CardTitle></CardHeader>
                <CardContent>
                  {loading ? <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto animate-spin text-red-500" /></div> :
                  result && 'daftarError' in result ? (
                    <ScrollArea className="h-[350px]">
                      {(result as DebugResult).adaError ? (
                        <>
                          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4"><h4 className="font-semibold text-red-300 mb-2">🐛 Error Ditemukan</h4>
                            {(result as DebugResult).daftarError?.map((err, i) => (
                              <div key={i} className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex gap-2 mb-1"><Badge variant="outline">Baris {err.baris}</Badge><Badge className="bg-red-500/20 text-red-300">{err.jenis}</Badge></div>
                                <p className="text-sm text-slate-300">{err.deskripsi}</p>
                                <p className="text-sm text-emerald-300 mt-1">✓ {err.solusi}</p>
                              </div>
                            ))}
                          </div>
                          <div className={`p-4 rounded-xl ${isLight ? 'bg-emerald-50' : 'bg-emerald-500/10'}`}>
                            <h4 className="font-semibold text-emerald-300 mb-2">✅ Kode Perbaikan</h4>
                            <SyntaxHighlighter language={getLanguageForHighlighter(language)} style={isLight ? oneLight : oneDark} customStyle={{ margin: 0, borderRadius: '0.5rem' }}>{(result as DebugResult).kodePerbaikan}</SyntaxHighlighter>
                          </div>
                        </>
                      ) : <div className={`p-4 rounded-xl ${isLight ? 'bg-emerald-50' : 'bg-emerald-500/10'}`}><h4 className="font-semibold text-emerald-300 mb-2">✅ Tidak Ada Error!</h4><p className="text-slate-300">{(result as DebugResult).tipsPencegahan}</p></div>}
                    </ScrollArea>
                  ) : <div className="text-center py-20"><Bug className="w-16 h-16 mx-auto text-slate-500" /><p className="text-slate-400 mt-4">Paste kode yang bermasalah</p></div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* QUIZ */}
          <TabsContent value="quiz">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className={isLight ? 'bg-white' : 'bg-slate-900/50 border-slate-700'}>
                <CardHeader><CardTitle className={isLight ? 'text-slate-800' : 'text-white'}><Brain className="w-5 h-5 text-amber-500 mr-2 inline" />Kode untuk Quiz</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className={isLight ? 'bg-white' : 'bg-slate-800'}><SelectValue /></SelectTrigger>
                    <SelectContent>{programmingLanguages.map(l => <SelectItem key={l.value} value={l.value}>{l.icon} {l.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Textarea placeholder="Paste kode untuk dijadikan quiz..." value={code} onChange={e => setCode(e.target.value)} className="min-h-[250px] font-mono bg-slate-950 text-white" />
                  <div className="flex justify-between items-center">
                    <Badge className="bg-amber-500/20 text-amber-300"><Trophy className="w-3 h-3 mr-1" /> Skor: {quizScore.correct}/{quizScore.total}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => setQuizScore({ correct: 0, total: 0 })}>Reset</Button>
                  </div>
                  <Button onClick={handleQuiz} disabled={loading || !code.trim()} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 h-12">
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Membuat...</> : <><Brain className="w-5 h-5 mr-2" /> Buat Quiz</>}
                  </Button>
                </CardContent>
              </Card>
              <Card className={isLight ? 'bg-white' : 'bg-slate-900/50 border-slate-700'}>
                <CardHeader><CardTitle className={isLight ? 'text-slate-800' : 'text-white'}><Target className="w-5 h-5 text-blue-500 mr-2 inline" />Pertanyaan</CardTitle></CardHeader>
                <CardContent>
                  {loading ? <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto animate-spin text-amber-500" /></div> :
                  result && 'pertanyaan' in result ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl ${isLight ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
                        <Badge className="bg-amber-500/20 text-amber-300 mb-2">{(result as QuizResult).level}</Badge>
                        <p className={`text-lg font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{(result as QuizResult).pertanyaan}</p>
                      </div>
                      <div className="space-y-2">
                        {(result as QuizResult).pilihan?.map(p => (
                          <button key={p.label} onClick={() => handleQuizAnswer(p.label)} disabled={!!quizAnswer}
                            className={`w-full p-4 text-left rounded-xl border transition-all ${quizAnswer ? p.label === (result as QuizResult).jawabanBenar ? 'bg-emerald-500/20 border-emerald-500' : quizAnswer === p.label ? 'bg-red-500/20 border-red-500' : '' : 'border-slate-700 hover:border-amber-500'}`}>
                            <span className="font-bold mr-2">{p.label}.</span>{p.text}
                          </button>
                        ))}
                      </div>
                      {quizAnswer && (
                        <div className={`p-4 rounded-xl ${quizAnswer === (result as QuizResult).jawabanBenar ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                          <p className={`font-semibold mb-2 ${quizAnswer === (result as QuizResult).jawabanBenar ? 'text-emerald-300' : 'text-red-300'}`}>{quizAnswer === (result as QuizResult).jawabanBenar ? '🎉 Benar!' : '❌ Salah!'}</p>
                          <p className="text-slate-300 text-sm">{(result as QuizResult).penjelasan}</p>
                          <Button onClick={handleQuiz} variant="outline" size="sm" className="mt-3"><RefreshCw className="w-4 h-4 mr-2" /> Quiz Berikutnya</Button>
                        </div>
                      )}
                    </div>
                  ) : <div className="text-center py-20"><Brain className="w-16 h-16 mx-auto text-slate-500" /><p className="text-slate-400 mt-4">Paste kode untuk membuat quiz</p></div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className={`text-center py-6 mt-8 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <p className={isLight ? 'text-slate-500' : 'text-slate-400'}>Dibuat dengan <Heart className="w-4 h-4 inline text-red-400 fill-red-400" /> untuk pemula Indonesia</p>
        </footer>
      </main>

      {/* Error Toast */}
      <AnimatePresence>{error && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-4 left-4 right-4 p-4 bg-red-500/90 rounded-xl text-white z-50">
          <div className="flex items-center gap-2"><Info className="w-5 h-5" /><span>{error}</span><Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></Button></div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  )
}

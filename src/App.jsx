import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image as ImageIcon, Wand2, Banana, Loader2, RefreshCcw } from 'lucide-react'

function App() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const reset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setDragActive(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleFiles = (file) => {
    if (!file) return
    setImage(file)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const onFileChange = (e) => handleFiles(e.target.files?.[0])

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    handleFiles(file)
  }

  const onSubmit = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', image)
      const res = await fetch(`${backend}/predict`, {
        method: 'POST',
        body: form
      })
      if (!res.ok) throw new Error('Prediction failed')
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const variants = {
    container: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } },
    item: { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } } }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-3xl bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-yellow-100"
      >
        <motion.div className="text-center mb-8" variants={variants} initial="hidden" animate="show">
          <motion.div variants={variants.item} className="mx-auto mb-3 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg">
            <Banana className="h-8 w-8" />
          </motion.div>
          <motion.h1 variants={variants.item} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-800">
            Banana Ripeness Predictor
          </motion.h1>
          <motion.p variants={variants.item} className="text-amber-700/80 mt-1">
            Upload a photo and get an instant ripeness estimate.
          </motion.p>
        </motion.div>

        <motion.div variants={variants} initial="hidden" animate="show" className="grid gap-6">
          <motion.div
            variants={variants.item}
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true) }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true) }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false) }}
            onDrop={onDrop}
            className={`relative rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer select-none
                       ${dragActive ? 'border-amber-500 bg-amber-50' : 'border-amber-200 bg-amber-25'}`}
            onClick={() => inputRef.current?.click()}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <motion.div animate={{ scale: dragActive ? 1.05 : 1 }} transition={{ type: 'spring', stiffness: 300 }}
                className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-100 to-yellow-200 flex items-center justify-center shadow">
                <Upload className="h-8 w-8 text-amber-600" />
              </motion.div>
              <div className="text-amber-800 font-semibold">Drag & drop your image here</div>
              <div className="text-amber-700/70 text-sm">or click to browse</div>
              <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            </div>
          </motion.div>

          <AnimatePresence>
            {preview && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-2xl border bg-white shadow"
              >
                <div className="relative">
                  <img src={preview} alt="preview" className="max-h-96 w-full object-contain bg-amber-50" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur">
                    <ImageIcon className="h-4 w-4" /> Preview
                  </div>
                  <button
                    onClick={reset}
                    className="absolute top-3 right-3 inline-flex items-center gap-2 bg-white text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow hover:bg-amber-50 active:scale-[0.98] transition"
                  >
                    <RefreshCcw className="h-4 w-4" /> Reset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={variants.item} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onSubmit}
              disabled={!image || loading}
              className="inline-flex items-center gap-2 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg transition active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Analyzing
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" /> Predict Ripeness
                </>
              )}
            </button>
            <div className="text-xs text-amber-700/70">PNG or JPG up to ~5MB</div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mt-2"
              >
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 140, damping: 14 }}
                  className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 shadow"
                >
                  <div className="text-center">
                    <div className="text-sm uppercase tracking-wide text-amber-700/70 font-semibold">Predicted Stage</div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-1">{result.label}</div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-2">
                    {result.probabilities.map((p, idx) => (
                      <div key={p.label} className="bg-white/70 rounded-xl border border-amber-100 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-amber-800">{p.label}</span>
                          <span className="text-amber-700/80 font-semibold">{(p.prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="mt-2 h-2.5 w-full bg-amber-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(1, Math.round(p.prob * 100))}%` }}
                            transition={{ delay: 0.1 + idx * 0.06, type: 'spring', stiffness: 120, damping: 18 }}
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={variants.item} className="text-[11px] text-amber-700/70 text-center mt-1">
            Color-based heuristic demo. For a production model, we can integrate a trained classifier next.
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default App

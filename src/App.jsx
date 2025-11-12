import { useState } from 'react'

function App() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 border border-yellow-100">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-700">Banana Ripeness Predictor</h1>
          <p className="text-amber-600">Upload a banana image to estimate ripeness.</p>
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="text-sm font-medium text-amber-700">Choose an image</span>
            <input type="file" accept="image/*" onChange={onFileChange} className="mt-1 block w-full text-sm" />
          </label>

          {preview && (
            <div className="flex justify-center">
              <img src={preview} alt="preview" className="max-h-64 rounded-xl border shadow" />
            </div>
          )}

          <button
            onClick={onSubmit}
            disabled={!image || loading}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Analyzing…' : 'Predict Ripeness'}
          </button>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {result && (
            <div className="mt-4">
              <div className="text-center text-xl font-bold text-amber-700">{result.label}</div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-5 gap-2">
                {result.probabilities.map((p) => (
                  <div key={p.label} className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="text-xs text-amber-700">{p.label}</div>
                    <div className="text-sm font-semibold text-amber-800">{(p.prob * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-amber-700/70 text-center mt-2">
            Note: This demo uses a color-based heuristic. To train on the Kaggle dataset, I can set up model training next.
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

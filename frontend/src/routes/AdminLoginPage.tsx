import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export function AdminLoginPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const campaignId = params.get('c') ?? 'demo'
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simple login validation
    if (username === 'admin' && password === '@dmin12345') {
      // Store admin session
      sessionStorage.setItem('admin_authenticated', 'true')
      sessionStorage.setItem('admin_campaign', campaignId)
      
      // Navigate to admin page
      navigate(`/admin?c=${encodeURIComponent(campaignId)}`)
    } else {
      setError('Invalid username or password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="max-w-md w-full mx-4">
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-emerald-300">
              🔐 Admin Login
            </h1>
            <p className="text-neutral-400 mt-2">
              Campaign: <span className="font-mono">{campaignId}</span>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-brand-500 hover:bg-brand-400 disabled:bg-neutral-700 text-neutral-950 font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(`/?c=${encodeURIComponent(campaignId)}`)}
              className="text-neutral-400 hover:text-neutral-300 text-sm"
            >
              ← Back to main page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

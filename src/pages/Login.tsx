import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn, Mail, Lock, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get redirect path from location state or default to home
  const from = (location.state as { from?: string })?.from || '/'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-logai-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-logai-accent/10 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-logai-accent" />
          </div>
          <h1 className="text-3xl font-bold text-logai-text-primary">LogAI</h1>
          <p className="text-logai-text-secondary mt-2">
            AI-Powered Log Analysis & Auto-Fix
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-logai-bg-card border border-logai-border rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-logai-text-primary mb-6">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-logai-error/10 border border-logai-error/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-logai-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-logai-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-logai-text-secondary mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-logai-text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-logai-bg-secondary border border-logai-border rounded-lg text-logai-text-primary placeholder-logai-text-secondary focus:border-logai-accent focus:outline-none focus:ring-1 focus:ring-logai-accent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-logai-text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-logai-text-secondary" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-logai-bg-secondary border border-logai-border rounded-lg text-logai-text-primary placeholder-logai-text-secondary focus:border-logai-accent focus:outline-none focus:ring-1 focus:ring-logai-accent"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-logai-border bg-logai-bg-secondary text-logai-accent focus:ring-logai-accent"
                />
                <span className="text-sm text-logai-text-secondary">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-logai-accent hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-logai-accent text-black font-semibold rounded-lg hover:bg-logai-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-logai-text-secondary">
              Don't have an account?{' '}
              <Link to="/signup" className="text-logai-accent hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-logai-text-secondary mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}


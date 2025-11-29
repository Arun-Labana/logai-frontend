import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle, Loader2, Sparkles, Check, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { resetPassword } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-logai-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-logai-bg-card border border-logai-border rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-logai-success/10 rounded-full mb-4">
              <Check className="w-8 h-8 text-logai-success" />
            </div>
            <h2 className="text-xl font-semibold text-logai-text-primary mb-2">
              Check your email
            </h2>
            <p className="text-logai-text-secondary mb-6">
              We've sent a password reset link to <span className="font-medium text-logai-text-primary">{email}</span>.
              Click the link to reset your password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-logai-accent text-black font-semibold rounded-lg hover:bg-logai-accent-dim transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
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

        {/* Reset Form */}
        <div className="bg-logai-bg-card border border-logai-border rounded-2xl p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-logai-text-secondary hover:text-logai-text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          <h2 className="text-xl font-semibold text-logai-text-primary mb-2">
            Reset your password
          </h2>
          <p className="text-sm text-logai-text-secondary mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-logai-accent text-black font-semibold rounded-lg hover:bg-logai-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


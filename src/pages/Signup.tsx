import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, AlertCircle, Loader2, Sparkles, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  // Password strength checks
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && password.length > 0

  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isPasswordStrong) {
      setError('Please ensure your password meets all requirements')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { needsVerification } = await signUp(email, password)
      
      if (needsVerification) {
        setSuccess(true)
      } else {
        // Auto-logged in, redirect to dashboard
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
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
              We've sent a verification link to <span className="font-medium text-logai-text-primary">{email}</span>.
              Click the link to verify your account.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-logai-accent text-black font-semibold rounded-lg hover:bg-logai-accent-dim transition-colors"
            >
              Go to Sign In
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

        {/* Signup Form */}
        <div className="bg-logai-bg-card border border-logai-border rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-logai-text-primary mb-6">
            Create your account
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
              
              {/* Password strength indicator */}
              <div className="mt-3 space-y-2">
                <div className="flex gap-1">
                  {[hasMinLength, hasUppercase, hasLowercase, hasNumber].map((met, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        met ? 'bg-logai-success' : 'bg-logai-border'
                      }`}
                    />
                  ))}
                </div>
                <ul className="text-xs space-y-1">
                  <li className={hasMinLength ? 'text-logai-success' : 'text-logai-text-secondary'}>
                    {hasMinLength ? '✓' : '○'} At least 8 characters
                  </li>
                  <li className={hasUppercase ? 'text-logai-success' : 'text-logai-text-secondary'}>
                    {hasUppercase ? '✓' : '○'} One uppercase letter
                  </li>
                  <li className={hasLowercase ? 'text-logai-success' : 'text-logai-text-secondary'}>
                    {hasLowercase ? '✓' : '○'} One lowercase letter
                  </li>
                  <li className={hasNumber ? 'text-logai-success' : 'text-logai-text-secondary'}>
                    {hasNumber ? '✓' : '○'} One number
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-logai-text-secondary mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-logai-text-secondary" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3 bg-logai-bg-secondary border rounded-lg text-logai-text-primary placeholder-logai-text-secondary focus:outline-none focus:ring-1 ${
                    confirmPassword && !passwordsMatch
                      ? 'border-logai-error focus:border-logai-error focus:ring-logai-error'
                      : passwordsMatch
                      ? 'border-logai-success focus:border-logai-success focus:ring-logai-success'
                      : 'border-logai-border focus:border-logai-accent focus:ring-logai-accent'
                  }`}
                />
                {passwordsMatch && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-logai-success" />
                )}
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-logai-error">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordStrong || !passwordsMatch}
              className="w-full py-3 bg-logai-accent text-black font-semibold rounded-lg hover:bg-logai-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-logai-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-logai-accent hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-logai-text-secondary mt-8">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}


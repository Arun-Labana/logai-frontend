import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, Sparkles } from 'lucide-react'

interface AuthGuardProps {
  children: ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-logai-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-logai-accent/10 rounded-2xl mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-logai-accent" />
          </div>
          <div className="flex items-center gap-3 text-logai-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login, but save the current location
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}


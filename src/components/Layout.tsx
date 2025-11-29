import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Settings, 
  Search,
  Bug,
  Zap,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-logai-bg-secondary border-r border-logai-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-logai-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-logai-accent to-purple-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">LogAI</h1>
              <p className="text-xs text-logai-text-secondary">Log Analyzer</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-logai-accent/10 text-logai-accent'
                        : 'text-logai-text-secondary hover:bg-logai-bg-hover hover:text-logai-text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Quick actions */}
          <div className="mt-8">
            <p className="px-4 text-xs text-logai-text-secondary uppercase tracking-wider mb-3">
              Quick Actions
            </p>
            <ul className="space-y-2">
              <li>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-logai-text-secondary hover:bg-logai-bg-hover hover:text-logai-text-primary transition-colors">
                  <Search className="w-5 h-5" />
                  <span className="font-medium">Search Logs</span>
                </button>
              </li>
              <li>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-logai-text-secondary hover:bg-logai-bg-hover hover:text-logai-text-primary transition-colors">
                  <Bug className="w-5 h-5" />
                  <span className="font-medium">View Errors</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-logai-border">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-logai-bg-card hover:bg-logai-bg-hover transition-colors"
            >
              <div className="w-8 h-8 bg-logai-accent/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-logai-accent" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-logai-text-primary truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-logai-text-secondary truncate">
                  {user?.email || ''}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-logai-text-secondary transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-logai-bg-card border border-logai-border rounded-lg shadow-lg overflow-hidden">
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-logai-text-secondary hover:bg-logai-bg-hover hover:text-logai-text-primary transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-logai-error hover:bg-logai-error/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}


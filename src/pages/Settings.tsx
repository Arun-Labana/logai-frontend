import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Server, 
  Trash2,
  Plus,
  Copy,
  Check,
  Zap,
  Github,
  Save,
  Eye,
  EyeOff,
  Edit2,
  User,
  LogOut,
  Mail
} from 'lucide-react'
import { 
  getApplications,
  createApplication,
  deleteApplication,
  updateApplication,
  getSetting,
  saveSetting,
  Application
} from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [apps, setApps] = useState<Application[]>([])
  const [showNewApp, setShowNewApp] = useState(false)
  const [newAppName, setNewAppName] = useState('')
  const [newAppDesc, setNewAppDesc] = useState('')
  const [newAppGithubRepo, setNewAppGithubRepo] = useState('')
  const [newAppGithubBranch, setNewAppGithubBranch] = useState('main')
  const [newAppSourcePath, setNewAppSourcePath] = useState('src/main/java')
  const [creating, setCreating] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  // GitHub token state
  const [githubToken, setGithubToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [savingToken, setSavingToken] = useState(false)
  const [tokenSaved, setTokenSaved] = useState(false)
  
  // Edit app state
  const [editingApp, setEditingApp] = useState<string | null>(null)
  const [editGithubRepo, setEditGithubRepo] = useState('')
  const [editGithubBranch, setEditGithubBranch] = useState('')
  const [editSourcePath, setEditSourcePath] = useState('')

  useEffect(() => {
    loadApps()
    loadGithubToken()
  }, [])
  
  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }
  
  async function loadGithubToken() {
    try {
      const token = await getSetting('github_token')
      if (token) {
        setGithubToken(token)
      }
    } catch (error) {
      console.error('Failed to load GitHub token:', error)
    }
  }
  
  async function saveGithubToken() {
    setSavingToken(true)
    try {
      await saveSetting('github_token', githubToken)
      setTokenSaved(true)
      setTimeout(() => setTokenSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save GitHub token:', error)
    } finally {
      setSavingToken(false)
    }
  }

  async function loadApps() {
    try {
      const applications = await getApplications()
      setApps(applications)
    } catch (error) {
      console.error('Failed to load apps:', error)
    }
  }

  async function handleCreateApp() {
    if (!newAppName.trim()) return
    
    setCreating(true)
    try {
      await createApplication(
        newAppName, 
        newAppDesc || undefined,
        newAppGithubRepo || undefined,
        newAppGithubBranch || 'main',
        newAppSourcePath || 'src/main/java'
      )
      setNewAppName('')
      setNewAppDesc('')
      setNewAppGithubRepo('')
      setNewAppGithubBranch('main')
      setNewAppSourcePath('src/main/java')
      setShowNewApp(false)
      loadApps()
    } catch (error) {
      console.error('Failed to create app:', error)
    } finally {
      setCreating(false)
    }
  }
  
  function startEditingApp(app: Application) {
    setEditingApp(app.id)
    setEditGithubRepo(app.github_repo || '')
    setEditGithubBranch(app.github_branch || 'main')
    setEditSourcePath(app.source_path || 'src/main/java')
  }
  
  async function saveAppGithubConfig(appId: string) {
    try {
      await updateApplication(appId, {
        github_repo: editGithubRepo || null,
        github_branch: editGithubBranch || 'main',
        source_path: editSourcePath || 'src/main/java'
      })
      setEditingApp(null)
      loadApps()
    } catch (error) {
      console.error('Failed to update app:', error)
    }
  }

  async function handleDeleteApp(id: string) {
    if (!confirm('Are you sure? This will delete all logs and analysis for this application.')) {
      return
    }
    
    try {
      await deleteApplication(id)
      loadApps()
    } catch (error) {
      console.error('Failed to delete app:', error)
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-logai-text-primary">Settings</h1>
        <p className="text-logai-text-secondary mt-1">
          Manage applications and view integration settings
        </p>
      </div>

      <div className="space-y-8">
        {/* User Account Card */}
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-logai-text-primary">
                Account
              </h2>
              <p className="text-sm text-logai-text-secondary">
                Manage your account settings
              </p>
            </div>
          </div>

          <div className="bg-logai-bg-secondary rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-logai-accent/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-logai-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-logai-text-primary">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-sm text-logai-text-secondary flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-logai-error hover:bg-logai-error/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* LLM Info Card */}
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-logai-accent/10 rounded-lg">
              <Zap className="w-5 h-5 text-logai-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-logai-text-primary">
                AI Analysis
              </h2>
              <p className="text-sm text-logai-text-secondary">
                Powered by Google Gemini
              </p>
            </div>
          </div>

          <div className="bg-logai-bg-secondary rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-logai-success rounded-full animate-pulse" />
              <span className="text-sm text-logai-success font-medium">Connected</span>
            </div>
            <p className="text-sm text-logai-text-secondary">
              Model: <span className="text-logai-text-primary font-mono">gemini-2.0-flash</span>
            </p>
            <p className="text-xs text-logai-text-secondary mt-2">
              API key configured on backend server
            </p>
          </div>
        </div>
        
        {/* GitHub Integration Card */}
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Github className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-logai-text-primary">
                GitHub Integration
              </h2>
              <p className="text-sm text-logai-text-secondary">
                Connect to GitHub for source code context
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-logai-text-secondary mb-2">
                Personal Access Token (GitHub)
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full px-4 py-2 pr-10 bg-logai-bg-secondary border border-logai-border rounded-lg text-logai-text-primary placeholder-logai-text-secondary focus:border-logai-accent focus:outline-none font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-logai-text-secondary hover:text-logai-text-primary"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={saveGithubToken}
                  disabled={savingToken}
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {tokenSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {tokenSaved ? 'Saved!' : savingToken ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="text-xs text-logai-text-secondary mt-2">
                Create a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">github.com/settings/tokens</a> with <code className="bg-logai-bg-secondary px-1 rounded">repo</code> scope
              </p>
            </div>
            
            {githubToken && (
              <div className="bg-logai-bg-secondary rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-logai-success rounded-full" />
                  <span className="text-sm text-logai-success font-medium">Token configured</span>
                </div>
                <p className="text-xs text-logai-text-secondary mt-1">
                  AI analysis will now fetch real source code from GitHub for more accurate fixes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Applications */}
        <div className="bg-logai-bg-card border border-logai-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-logai-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-logai-text-primary">
                Applications
              </h2>
              <p className="text-sm text-logai-text-secondary">
                Manage registered applications and their API keys
              </p>
            </div>
            <button
              onClick={() => setShowNewApp(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add App
            </button>
          </div>

          {apps.length === 0 ? (
            <div className="p-8 text-center">
              <Server className="w-12 h-12 text-logai-text-secondary mx-auto mb-4" />
              <p className="text-logai-text-secondary">
                No applications registered yet.
              </p>
              <button
                onClick={() => setShowNewApp(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Your First App
              </button>
            </div>
          ) : (
            <div className="divide-y divide-logai-border">
              {apps.map((app) => (
                <div key={app.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-logai-text-primary">{app.name}</h3>
                      <p className="text-sm text-logai-text-secondary">
                        {app.description || 'No description'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      className="p-2 text-logai-text-secondary hover:text-logai-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Integration info */}
                  <div className="mt-4 bg-logai-bg-secondary rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-logai-text-secondary">App ID</span>
                      <button
                        onClick={() => copyToClipboard(app.id, `id-${app.id}`)}
                        className="text-xs text-logai-accent hover:underline flex items-center gap-1"
                      >
                        {copiedKey === `id-${app.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === `id-${app.id}` ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-xs text-logai-text-primary block truncate mb-4">
                      {app.id}
                    </code>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-logai-text-secondary">API Key</span>
                      <button
                        onClick={() => copyToClipboard(app.api_key, `key-${app.id}`)}
                        className="text-xs text-logai-accent hover:underline flex items-center gap-1"
                      >
                        {copiedKey === `key-${app.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === `key-${app.id}` ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-xs text-logai-text-primary block truncate">
                      {app.api_key}
                    </code>
                  </div>

                  {/* GitHub Config */}
                  <div className="mt-4 bg-logai-bg-secondary rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-logai-text-primary">Source Code</span>
                      </div>
                      {editingApp !== app.id && (
                        <button
                          onClick={() => startEditingApp(app)}
                          className="text-xs text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          {app.github_repo ? 'Edit' : 'Configure'}
                        </button>
                      )}
                    </div>
                    
                    {editingApp === app.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-logai-text-secondary mb-1">GitHub Repo</label>
                          <input
                            type="text"
                            value={editGithubRepo}
                            onChange={(e) => setEditGithubRepo(e.target.value)}
                            placeholder="alabana/sample-logai-app"
                            className="w-full px-3 py-1.5 bg-logai-bg-primary border border-logai-border rounded text-sm text-logai-text-primary placeholder-logai-text-secondary focus:border-purple-400 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-logai-text-secondary mb-1">Branch</label>
                            <input
                              type="text"
                              value={editGithubBranch}
                              onChange={(e) => setEditGithubBranch(e.target.value)}
                              placeholder="main"
                              className="w-full px-3 py-1.5 bg-logai-bg-primary border border-logai-border rounded text-sm text-logai-text-primary placeholder-logai-text-secondary focus:border-purple-400 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-logai-text-secondary mb-1">Source Path</label>
                            <input
                              type="text"
                              value={editSourcePath}
                              onChange={(e) => setEditSourcePath(e.target.value)}
                              placeholder="src/main/java"
                              className="w-full px-3 py-1.5 bg-logai-bg-primary border border-logai-border rounded text-sm text-logai-text-primary placeholder-logai-text-secondary focus:border-purple-400 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveAppGithubConfig(app.id)}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingApp(null)}
                            className="px-3 py-1 text-logai-text-secondary text-sm hover:text-logai-text-primary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : app.github_repo ? (
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-logai-text-secondary">Repo:</span>
                          <a 
                            href={`https://github.com/${app.github_repo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline"
                          >
                            {app.github_repo}
                          </a>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-logai-text-secondary">Branch: <span className="text-logai-text-primary">{app.github_branch || 'main'}</span></span>
                          <span className="text-logai-text-secondary">Path: <span className="text-logai-text-primary">{app.source_path || 'src/main/java'}</span></span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-logai-text-secondary">
                        Not configured - AI will generate approximate fixes based on stack traces
                      </p>
                    )}
                  </div>

                  {/* Logback config example */}
                  <details className="mt-4">
                    <summary className="text-sm text-logai-accent cursor-pointer hover:underline">
                      View Logback configuration
                    </summary>
                    <pre className="mt-2 p-4 bg-logai-bg-secondary rounded-lg text-xs overflow-x-auto">
{`<appender name="LOGAI" class="com.logai.remote.RemoteLogAppender">
    <supabaseUrl>\${SUPABASE_URL}</supabaseUrl>
    <supabaseKey>\${SUPABASE_KEY}</supabaseKey>
    <appId>${app.id}</appId>
    <threshold>WARN</threshold>
</appender>

<root level="INFO">
    <appender-ref ref="LOGAI" />
</root>`}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Environment Variables */}
        <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-logai-text-primary mb-4">
            Environment Setup for Java Apps
          </h2>
          
          <p className="text-sm text-logai-text-secondary mb-4">
            Set these environment variables in your Java application:
          </p>

          <pre className="bg-logai-bg-secondary rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`SUPABASE_URL=https://rdlhvdpuxddbryhepukn.supabase.co
SUPABASE_KEY=your_supabase_anon_key`}
          </pre>
        </div>
      </div>

      {/* New app modal */}
      {showNewApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-logai-bg-card border border-logai-border rounded-xl p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-xl font-bold text-logai-text-primary mb-4">
              Add New Application
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-logai-text-secondary mb-2">
                  Application Name *
                </label>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="My API Server"
                  className="w-full px-4 py-2 bg-logai-bg-secondary border border-logai-border rounded-lg text-logai-text-primary placeholder-logai-text-secondary focus:border-logai-accent focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-logai-text-secondary mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                  placeholder="Backend API for my e-commerce app"
                  className="w-full px-4 py-2 bg-logai-bg-secondary border border-logai-border rounded-lg text-logai-text-primary placeholder-logai-text-secondary focus:border-logai-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewApp(false)}
                className="px-4 py-2 text-logai-text-secondary hover:text-logai-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApp}
                disabled={creating || !newAppName.trim()}
                className="px-4 py-2 bg-logai-accent text-black font-medium rounded-lg hover:bg-logai-accent-dim transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

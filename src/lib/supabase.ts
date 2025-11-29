import { createClient, User, Session } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================================
// Authentication Functions
// ============================================================================

export type { User, Session }

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
}

export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

// Types for our database
export interface Application {
  id: string
  user_id: string | null
  name: string
  description: string | null
  api_key: string
  source_paths: string[] | null
  github_repo: string | null
  github_branch: string | null
  source_path: string | null
  created_at: string
  updated_at: string
}

export interface LogEntry {
  id: number
  app_id: string
  timestamp: string
  level: 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  logger: string | null
  message: string | null
  stack_trace: string | null
  file_name: string | null
  line_number: number | null
  class_name: string | null
  method_name: string | null
  trace_id: string | null
  thread_name: string | null
  mdc_context: Record<string, string> | null
  created_at: string
}

export interface ErrorCluster {
  id: string
  app_id: string
  fingerprint: string
  exception_class: string | null
  message_pattern: string | null
  primary_file: string | null
  primary_line: number | null
  primary_method: string | null
  primary_class: string | null
  occurrence_count: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'IGNORED'
  first_seen: string
  last_seen: string
  created_at: string
  updated_at: string
}

export interface AnalysisResult {
  id: string
  cluster_id: string
  explanation: string | null
  root_cause: string | null
  recommendation: string | null
  patch: string | null
  patch_file_name: string | null
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
  model_used: string | null
  tokens_used: number | null
  raw_response: string | null
  created_at: string
}

export interface ScanHistory {
  id: string
  app_id: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'
  started_at: string
  completed_at: string | null
  logs_scanned: number
  errors_found: number
  clusters_created: number
  clusters_analyzed: number
  error_message: string | null
}

export interface Settings {
  id: string
  key: string
  value: string | null
  encrypted: boolean
  created_at: string
  updated_at: string
}

// API functions
export async function getApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getApplication(id: string): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createApplication(
  name: string, 
  description?: string,
  github_repo?: string,
  github_branch?: string,
  source_path?: string
): Promise<Application> {
  // Get current user
  const user = await getUser()
  if (!user) throw new Error('Must be logged in to create an application')
  
  const { data, error } = await supabase
    .from('applications')
    .insert({ 
      name, 
      description,
      user_id: user.id,
      github_repo: github_repo || null,
      github_branch: github_branch || 'main',
      source_path: source_path || 'src/main/java'
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateApplication(
  id: string, 
  updates: Partial<Pick<Application, 'name' | 'description' | 'github_repo' | 'github_branch' | 'source_path'>>
): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getErrorClusters(appId: string): Promise<ErrorCluster[]> {
  const { data, error } = await supabase
    .from('error_clusters')
    .select('*')
    .eq('app_id', appId)
    .order('occurrence_count', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getErrorCluster(id: string): Promise<ErrorCluster | null> {
  const { data, error } = await supabase
    .from('error_clusters')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getClusterAnalysis(clusterId: string): Promise<AnalysisResult | null> {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('cluster_id', clusterId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data
}

export async function getScanHistory(appId: string): Promise<ScanHistory[]> {
  const { data, error } = await supabase
    .from('scan_history')
    .select('*')
    .eq('app_id', appId)
    .order('started_at', { ascending: false })
    .limit(10)
  
  if (error) throw error
  return data || []
}

export async function getRecentLogs(appId: string, limit = 100): Promise<LogEntry[]> {
  const { data, error } = await supabase
    .from('log_entries')
    .select('*')
    .eq('app_id', appId)
    .order('timestamp', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function getAppStats(appId: string) {
  const { data, error } = await supabase.rpc('get_app_stats', { app_uuid: appId })
  if (error) throw error
  return data?.[0] || { total_logs: 0, error_logs: 0, cluster_count: 0, critical_count: 0, last_error: null }
}

export async function getSetting(key: string): Promise<string | null> {
  const user = await getUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .eq('user_id', user.id)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data?.value || null
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const user = await getUser()
  if (!user) throw new Error('Must be logged in to save settings')
  
  const { error } = await supabase
    .from('settings')
    .upsert(
      { key, value, user_id: user.id, updated_at: new Date().toISOString() }, 
      { onConflict: 'user_id,key' }
    )
  
  if (error) throw error
}

export async function setSetting(key: string, value: string): Promise<void> {
  return saveSetting(key, value)
}

export async function updateClusterStatus(clusterId: string, status: ErrorCluster['status']): Promise<void> {
  const { error } = await supabase
    .from('error_clusters')
    .update({ status })
    .eq('id', clusterId)
  
  if (error) throw error
}

// Backend API (deployed on Render)
const BACKEND_URL = 'https://logai-backend.onrender.com'

async function getBackendHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  // Add auth token if user is logged in
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  
  return headers
}

export async function triggerScan(appId: string, hours = 24, _analyze = false) {
  const headers = await getBackendHeaders()
  
  const response = await fetch(`${BACKEND_URL}/scan`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ app_id: appId, hours })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Scan failed')
  }
  
  return response.json()
}

export async function analyzeCluster(clusterId: string) {
  const headers = await getBackendHeaders()
  
  const response = await fetch(`${BACKEND_URL}/analyze`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ cluster_id: clusterId })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Analysis failed')
  }
  
  return response.json()
}

export async function generatePatch(clusterId: string, sourceCode?: string) {
  const headers = await getBackendHeaders()
  
  const response = await fetch(`${BACKEND_URL}/generate-patch`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ cluster_id: clusterId, source_code: sourceCode })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Patch generation failed')
  }
  
  return response.json()
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}


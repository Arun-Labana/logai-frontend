import { useState, useMemo } from 'react'
import { Copy, Check, Download, Code, FileCode, FileText } from 'lucide-react'

interface PatchViewerProps {
  patch: string | null
  fileName?: string | null
  onDownload?: () => void
  onCopy?: () => void
  loading?: boolean
  onGenerate?: () => void
  canGenerate?: boolean
}

interface FileDiff {
  fileName: string
  content: string
  additions: number
  deletions: number
}

// Parse a multi-file diff into separate file diffs
function parseMultiFileDiff(patch: string): FileDiff[] {
  if (!patch) return []
  
  const files: FileDiff[] = []
  const diffPattern = /diff --git a\/(.+?) b\/(.+?)(?=\ndiff --git|$)/gs
  
  let match
  while ((match = diffPattern.exec(patch)) !== null) {
    const fileName = match[2]
    const content = match[0]
    
    // Count additions and deletions
    const lines = content.split('\n')
    let additions = 0
    let deletions = 0
    
    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) additions++
      if (line.startsWith('-') && !line.startsWith('---')) deletions++
    }
    
    files.push({ fileName, content, additions, deletions })
  }
  
  // If no diff --git headers found, treat as single file
  if (files.length === 0 && patch.trim()) {
    const lines = patch.split('\n')
    let additions = 0
    let deletions = 0
    
    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) additions++
      if (line.startsWith('-') && !line.startsWith('---')) deletions++
    }
    
    files.push({
      fileName: 'changes.diff',
      content: patch,
      additions,
      deletions
    })
  }
  
  return files
}

export default function PatchViewer({ 
  patch, 
  fileName,
  onDownload,
  onCopy,
  loading = false,
  onGenerate,
  canGenerate = true
}: PatchViewerProps) {
  const [copied, setCopied] = useState(false)
  const [activeFile, setActiveFile] = useState(0)
  
  const fileDiffs = useMemo(() => parseMultiFileDiff(patch || ''), [patch])
  const isMultiFile = fileDiffs.length > 1

  function handleCopy() {
    if (!patch) return
    navigator.clipboard.writeText(patch)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.()
  }
  
  function handleCopyFile(content: string) {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    if (!patch) return
    const blob = new Blob([patch], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'fix.diff'
    a.click()
    URL.revokeObjectURL(url)
    onDownload?.()
  }

  if (loading) {
    return (
      <div className="bg-logai-bg-card border border-logai-border rounded-xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-logai-accent border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-logai-text-secondary">Generating patch...</p>
      </div>
    )
  }

  if (!patch || fileDiffs.length === 0) {
    return (
      <div className="bg-logai-bg-card border border-logai-border rounded-xl p-8 text-center">
        <FileCode className="w-12 h-12 text-logai-text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-logai-text-primary mb-2">
          No Patch Available
        </h3>
        <p className="text-logai-text-secondary text-sm mb-4">
          Generate a fix patch using AI analysis
        </p>
        {onGenerate && canGenerate && (
          <button
            onClick={onGenerate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors"
          >
            <Code className="w-4 h-4" />
            Generate Patch
          </button>
        )}
      </div>
    )
  }

  const currentDiff = fileDiffs[activeFile]
  const lines = currentDiff?.content.split('\n') || []

  return (
    <div className="bg-logai-bg-card border border-logai-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-logai-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-logai-text-primary flex items-center gap-2">
            Suggested Fix
            {isMultiFile && (
              <span className="px-2 py-0.5 bg-logai-accent/10 text-logai-accent text-xs rounded-full">
                {fileDiffs.length} files
              </span>
            )}
          </h3>
          {!isMultiFile && fileName && (
            <p className="text-sm text-logai-text-secondary font-mono">{fileName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-logai-success" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy All'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 bg-logai-bg-hover text-logai-text-primary rounded-lg hover:bg-logai-border transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
      
      {/* File Tabs (only show for multi-file) */}
      {isMultiFile && (
        <div className="flex border-b border-logai-border bg-logai-bg-secondary overflow-x-auto">
          {fileDiffs.map((file, index) => {
            const shortName = file.fileName.split('/').pop() || file.fileName
            return (
              <button
                key={index}
                onClick={() => setActiveFile(index)}
                className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeFile === index
                    ? 'border-logai-accent text-logai-accent bg-logai-bg-card'
                    : 'border-transparent text-logai-text-secondary hover:text-logai-text-primary hover:bg-logai-bg-hover'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="font-mono">{shortName}</span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="text-logai-success">+{file.additions}</span>
                  <span className="text-logai-error">-{file.deletions}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
      
      {/* Current file path (for multi-file) */}
      {isMultiFile && currentDiff && (
        <div className="px-4 py-2 bg-logai-bg-secondary border-b border-logai-border flex items-center justify-between">
          <span className="text-xs font-mono text-logai-text-secondary">
            {currentDiff.fileName}
          </span>
          <button
            onClick={() => handleCopyFile(currentDiff.content)}
            className="text-xs text-logai-accent hover:underline flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            Copy this file
          </button>
        </div>
      )}
      
      {/* Diff content */}
      <div className="overflow-x-auto">
        <pre className="font-mono text-sm">
          {lines.map((line, index) => (
            <DiffLine key={index} line={line} lineNumber={index + 1} />
          ))}
        </pre>
      </div>
      
      {/* Summary for multi-file */}
      {isMultiFile && (
        <div className="px-4 py-3 bg-logai-bg-secondary border-t border-logai-border">
          <div className="flex items-center justify-between text-xs text-logai-text-secondary">
            <span>
              Total changes: {fileDiffs.reduce((acc, f) => acc + f.additions + f.deletions, 0)} lines across {fileDiffs.length} files
            </span>
            <span className="flex items-center gap-3">
              <span className="text-logai-success">
                +{fileDiffs.reduce((acc, f) => acc + f.additions, 0)} additions
              </span>
              <span className="text-logai-error">
                -{fileDiffs.reduce((acc, f) => acc + f.deletions, 0)} deletions
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

interface DiffLineProps {
  line: string
  lineNumber: number
}

function DiffLine({ line, lineNumber }: DiffLineProps) {
  let className = 'px-4 py-0.5 '

  if (line.startsWith('+++') || line.startsWith('---')) {
    className += 'text-logai-text-secondary bg-logai-bg-secondary'
  } else if (line.startsWith('+')) {
    className += 'diff-add text-logai-success'
  } else if (line.startsWith('-')) {
    className += 'diff-remove text-logai-error'
  } else if (line.startsWith('@@')) {
    className += 'text-logai-accent bg-logai-accent/5'
  } else {
    className += 'diff-context text-logai-text-primary'
  }

  return (
    <div className={className}>
      <span className="select-none text-logai-text-secondary w-8 inline-block text-right mr-4 text-xs">
        {lineNumber}
      </span>
      {line || ' '}
    </div>
  )
}

// Helper function to validate if a string is a valid diff
export function isValidDiff(patch: string): boolean {
  if (!patch || patch.length < 20) return false
  const hasHeader = patch.includes('---') && patch.includes('+++')
  const hasHunk = patch.includes('@@')
  const hasChanges = patch.includes('\n+') || patch.includes('\n-')
  return hasHeader && hasHunk && hasChanges
}


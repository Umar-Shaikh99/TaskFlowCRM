import React from 'react'

export const Footer: React.FC = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

  return (
    <footer className="bg-canvas border-t border-hairline py-3 px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-steel gap-2 mt-auto">
      <div>
        &copy; {new Date().getFullYear()} TaskFlow CRM. Suitable for candidate demonstration.
      </div>
      <div className="flex items-center gap-4 font-sans">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
          API:{' '}
          <code className="font-mono text-charcoal bg-surface px-1.5 py-0.5 rounded">
            {apiBase}
          </code>
        </span>
        <span>Version 1.0.0 (React 19)</span>
      </div>
    </footer>
  )
}

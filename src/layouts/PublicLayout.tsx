import React from 'react'
import { Outlet } from 'react-router-dom'

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-surface via-surface-soft to-hairline-soft flex flex-col justify-between">
      {/* Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-hairline bg-canvas/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-brand-green animate-pulse" />
          <span className="font-sans font-bold tracking-tight text-ink text-lg">
            TaskFlow <span className="text-brand-green">CRM</span>
          </span>
        </div>
        <div className="text-xs text-steel font-mono">v1.0.0-boilerplate</div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px]">
          <Outlet />
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="py-4 text-center border-t border-hairline bg-canvas text-xs text-stone font-sans">
        &copy; {new Date().getFullYear()} TaskFlow CRM. All rights reserved.
      </footer>
    </div>
  )
}

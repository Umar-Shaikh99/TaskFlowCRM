import React from 'react'
import { Bell, Sun, Moon } from 'lucide-react'
import { useAppSelector } from '../../store/hooks'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/components/theme/ThemeProvider'
import { CommandPalette } from '@/components/search/CommandPalette'

export const Header: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.auth)
  const { theme, setTheme } = useTheme()

  // Fallback credentials if auth is stubbed
  const displayUser = currentUser || {
    name: 'Interview Candidate',
    email: 'candidate@example.com',
    role: 'ADMIN',
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="h-14 bg-canvas border-b border-hairline px-4 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Left section: Shadcn Sidebar Trigger & Workspace Indicator */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="cursor-pointer text-steel hover:text-ink" />
        <Separator orientation="vertical" className="h-4 bg-hairline" />
        <div className="hidden sm:block text-xs text-steel">
          Workspace / <span className="text-ink font-medium">TaskFlow CRM Dashboard</span>
        </div>
        <CommandPalette />
      </div>

      {/* Right section: Notifications & User profile indicator */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-steel hover:text-ink rounded-full hover:bg-surface cursor-pointer animate-in fade-in"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button
          className="p-1.5 text-steel hover:text-ink rounded-full hover:bg-surface relative cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-green ring-2 ring-canvas" />
        </button>

        {/* Divider */}
        <Separator orientation="vertical" className="h-4 bg-hairline" />

        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-sans font-medium text-ink leading-tight">
              {displayUser.name}
            </div>
            <div className="text-xs text-steel font-sans font-normal">{displayUser.role}</div>
          </div>
          {/* Avatar circle placeholder */}
          <div className="w-8 h-8 rounded-full bg-surface border border-hairline flex items-center justify-center text-charcoal font-sans text-xs font-semibold">
            {displayUser.name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}

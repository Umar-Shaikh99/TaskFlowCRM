import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react'
import { useAppDispatch } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isOpenMobile: boolean
  setIsOpenMobile: (open: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const location = useLocation()
  const dispatch = useAppDispatch()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Profile', path: '/profile', icon: User },
  ]

  const handleLogout = () => {
    dispatch(logout())
  }

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-canvas border-r border-hairline transition-all duration-300">
      {/* Header / Logo */}
      <div className="p-4 border-b border-hairline flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 border border-brand-green/30">
            <span className="text-brand-green font-bold text-sm font-sans">TF</span>
          </div>
          {!isCollapsed && (
            <span className="font-sans font-bold tracking-tight text-ink text-base transition-opacity duration-300">
              TaskFlow <span className="text-brand-green">CRM</span>
            </span>
          )}
        </div>

        {/* Mobile close button / Desktop collapse button */}
        <button
          onClick={() => setIsOpenMobile(false)}
          className="md:hidden p-1.5 text-steel hover:text-ink rounded-md hover:bg-surface"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpenMobile(false)}
              className={`sidebar-nav-item flex items-center ${
                isActive ? 'sidebar-nav-item-active' : ''
              } ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'}`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-green' : 'text-steel'}`}
                />
                {!isCollapsed && (
                  <span className="transition-opacity duration-300">{item.label}</span>
                )}
              </div>

              {/* Mintlify Active Indicator Dot */}
              {isActive && !isCollapsed && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_8px_var(--color-brand-green)]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Logout action */}
      <div className="p-3 border-t border-hairline">
        <button
          onClick={handleLogout}
          className={`sidebar-nav-item w-full flex items-center text-brand-error hover:bg-brand-error/10 hover:text-brand-error ${
            isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
          }`}
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </div>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-64 z-50 md:hidden transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Sidebar Rail */}
      <div
        className={`hidden md:block h-screen sticky top-0 shrink-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-canvas border border-hairline flex items-center justify-center text-steel hover:text-ink shadow-xs hover:shadow-md transition-all z-40"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </>
  )
}

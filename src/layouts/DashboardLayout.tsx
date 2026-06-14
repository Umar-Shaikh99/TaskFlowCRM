import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

export const DashboardLayout: React.FC = () => {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-screen bg-surface overflow-hidden">
          {/* Shadcn AppSidebar */}
          <AppSidebar />

          {/* Primary Workspace Panel */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Header Panel */}
            <Header />

            {/* Interior Page Render Port */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-surface-soft">
              <Outlet />
            </main>

            {/* Bottom Footer Details */}
            <Footer />
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}

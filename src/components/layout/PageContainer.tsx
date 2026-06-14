import React from 'react'

interface PageContainerProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  actions,
  children,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 flex flex-col min-h-0">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-5 shrink-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-sans font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="text-sm font-sans font-normal text-steel">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>

      {/* Scrollable interior viewport container */}
      <div className="flex-1 min-h-0 w-full">{children}</div>
    </div>
  )
}

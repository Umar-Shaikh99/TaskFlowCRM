import React from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import type { Permission } from '../../utils/permissions'

interface CanProps {
  perform: Permission
  of?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export const Can: React.FC<CanProps> = ({ perform, of, fallback = null, children }) => {
  const { can } = usePermissions()

  if (can(perform, of)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

export default Can

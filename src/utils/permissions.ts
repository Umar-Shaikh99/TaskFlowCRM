export type Role = 'ADMIN' | 'MANAGER' | 'USER'

export type Permission =
  | 'tasks:create'
  | 'tasks:edit'
  | 'tasks:delete'
  | 'users:manage'
  | 'analytics:view'
  | 'settings:view'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'tasks:create',
    'tasks:edit',
    'tasks:delete',
    'users:manage',
    'analytics:view',
    'settings:view',
  ],
  MANAGER: ['tasks:create', 'tasks:edit', 'analytics:view', 'settings:view'],
  USER: ['settings:view'],
}

/**
 * Checks if a given role has permission to perform an action.
 * If ownerId/assigneeId matches the current user's ID, allow certain actions even for restricted roles.
 */
export function hasPermission(
  role: Role,
  permission: Permission,
  currentUserId?: string,
  resourceOwnerOrAssigneeId?: string
): boolean {
  // Check if role natively holds the permission
  const permissions = ROLE_PERMISSIONS[role] || []
  if (permissions.includes(permission)) {
    return true
  }

  // Action overrides (e.g., USER can edit task if they are the assignee)
  if (permission === 'tasks:edit' && role === 'USER') {
    return !!currentUserId && currentUserId === resourceOwnerOrAssigneeId
  }

  return false
}

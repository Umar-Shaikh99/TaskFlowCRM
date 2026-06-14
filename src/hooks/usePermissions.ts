import { useAppSelector } from '../store/hooks'
import { hasPermission } from '../utils/permissions'
import type { Permission, Role } from '../utils/permissions'

export function usePermissions() {
  const { currentUser } = useAppSelector((state) => state.auth)

  const can = (permission: Permission, resourceOwnerOrAssigneeId?: string): boolean => {
    if (!currentUser) return false
    return hasPermission(
      currentUser.role as Role,
      permission,
      currentUser.id,
      resourceOwnerOrAssigneeId
    )
  }

  return {
    can,
    role: currentUser?.role as Role | undefined,
    userId: currentUser?.id,
    currentUser,
  }
}

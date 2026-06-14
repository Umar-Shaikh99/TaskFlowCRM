import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { PageContainer } from '../../components/layout/PageContainer'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchUsers, createUser, updateUser, deleteUser } from '../../store/slices/userSlice'
import { Plus, Edit2, Trash2, Search, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { User } from '../../types/auth'

const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
  password: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

type UserFormInputs = z.infer<typeof userFormSchema>

export const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { users, isLoading, error } = useAppSelector((state) => state.users)
  const { currentUser } = useAppSelector((state) => state.auth)

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  // Setup form validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userFormSchema),
  })

  // Open modal for adding
  const handleAddClick = useCallback(() => {
    setEditingUser(null)
    reset({
      name: '',
      email: '',
      role: 'USER',
      password: '',
      status: 'ACTIVE',
    })
    setIsFormOpen(true)
  }, [reset])

  // Open modal for editing
  const handleEditClick = useCallback(
    (user: User & { status?: 'ACTIVE' | 'INACTIVE' }) => {
      setEditingUser(user)
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        status: user.status || 'ACTIVE',
      })
      setIsFormOpen(true)
    },
    [reset]
  )

  // Open delete confirmation
  const handleDeleteClick = useCallback((user: User) => {
    setUserToDelete(user)
    setIsDeleteOpen(true)
  }, [])

  // Form submit handler (Create / Update)
  const onSubmit = useCallback(
    async (data: UserFormInputs) => {
      try {
        if (editingUser) {
          // Prepare update payload
          const updatePayload: Record<string, any> = {
            name: data.name,
            email: data.email,
            role: data.role,
            status: data.status,
          }
          if (data.password) {
            updatePayload.password = data.password
          }

          const resultAction = await dispatch(
            updateUser({ id: editingUser.id, input: updatePayload })
          )
          if (updateUser.fulfilled.match(resultAction)) {
            toast.success('User updated successfully')
            setIsFormOpen(false)
          } else {
            toast.error(`Failed to update user: ${resultAction.payload || 'Unknown error'}`)
          }
        } else {
          if (!data.password || data.password.length < 6) {
            toast.error('Password must be at least 6 characters long for new users')
            return
          }
          const resultAction = await dispatch(createUser(data))
          if (createUser.fulfilled.match(resultAction)) {
            toast.success('User created successfully')
            setIsFormOpen(false)
          } else {
            toast.error(`Failed to create user: ${resultAction.payload || 'Unknown error'}`)
          }
        }
      } catch (error) {
        toast.error('An unexpected error occurred')
      }
    },
    [dispatch, editingUser]
  )

  // Delete confirm handler
  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return
    try {
      const resultAction = await dispatch(deleteUser(userToDelete.id))
      if (deleteUser.fulfilled.match(resultAction)) {
        toast.success('User deleted successfully')
        setIsDeleteOpen(false)
        setUserToDelete(null)
      } else {
        toast.error(`Failed to delete user: ${resultAction.payload || 'Unknown error'}`)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }, [dispatch, userToDelete])

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user: any) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  // Disable actions for self-deletion
  const isSelf = useCallback((userId: string) => currentUser?.id === userId, [currentUser])

  const actions = useMemo(
    () => (
      <Button
        onClick={handleAddClick}
        className="btn-primary text-sm flex items-center gap-2 cursor-pointer bg-brand-green hover:bg-brand-green-deep text-primary font-medium rounded-full px-4 py-2"
      >
        <Plus className="w-4 h-4 text-brand-green" /> Add User
      </Button>
    ),
    [handleAddClick]
  )

  return (
    <PageContainer
      title="User Management"
      subtitle="View, add, edit, and configure role assignments for platform users."
      actions={actions}
    >
      <div className="space-y-4">
        {/* Error Alert with Reload Action */}
        {error && (
          <Alert
            variant="destructive"
            className="border-brand-error/20 bg-brand-error/5 text-ink animate-in slide-in-from-top duration-250"
          >
            <AlertTriangle className="h-4 w-4 text-brand-error" />
            <AlertTitle className="font-semibold text-brand-error">
              API Integration Failure
            </AlertTitle>
            <AlertDescription className="text-xs text-charcoal">
              {error}. Check JSON Server status and try again.
            </AlertDescription>
            <AlertAction>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(fetchUsers())}
                className="bg-canvas border-hairline hover:bg-surface text-xs font-semibold rounded-full cursor-pointer h-7"
              >
                Reload Directory
              </Button>
            </AlertAction>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface p-4 rounded-lg border border-hairline">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-steel" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-canvas border-hairline text-ink"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Label
              htmlFor="role-filter"
              className="text-xs font-semibold text-steel whitespace-nowrap"
            >
              Role Scope:
            </Label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 rounded-md border border-hairline bg-canvas px-3 py-1 text-sm text-ink outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="USER">USER</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="border border-hairline rounded-lg bg-canvas overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-surface text-xs text-steel font-mono uppercase">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="p-4 font-semibold">Name</TableHead>
                  <TableHead className="p-4 font-semibold">Email Address</TableHead>
                  <TableHead className="p-4 font-semibold">Role Scope</TableHead>
                  <TableHead className="p-4 font-semibold">Status</TableHead>
                  <TableHead className="p-4 font-semibold">Joined Date</TableHead>
                  <TableHead className="p-4 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {isLoading && users.length === 0 ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx} className="animate-pulse">
                      <TableCell className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-7 w-7 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <Skeleton className="h-4 w-36" />
                      </TableCell>
                      <TableCell className="p-4">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="p-4">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="p-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="p-4 text-right">
                        <Skeleton className="h-8 w-16 ml-auto rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center p-12 text-stone font-sans">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-3 bg-surface border border-hairline rounded-full text-steel">
                          <Search className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-ink">No Users Found</h3>
                          <p className="text-xs text-steel max-w-[280px]">
                            No matching user profiles found in the directory. Clear filters or add a
                            new user.
                          </p>
                        </div>
                        {searchQuery || roleFilter !== 'ALL' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery('')
                              setRoleFilter('ALL')
                            }}
                            className="bg-canvas border-hairline hover:bg-surface text-xs font-semibold rounded-full cursor-pointer"
                          >
                            Clear Filters
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: any) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-surface-soft transition-colors duration-150"
                    >
                      <TableCell className="p-4 font-sans font-medium text-ink flex items-center gap-3">
                        <Avatar className="h-7 w-7 border border-hairline">
                          <AvatarFallback className="bg-surface text-steel text-[10px] font-bold">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {user.name}
                      </TableCell>
                      <TableCell className="p-4 text-charcoal font-sans">{user.email}</TableCell>
                      <TableCell className="p-4">
                        <Badge
                          variant="outline"
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${
                            user.role === 'ADMIN'
                              ? 'bg-brand-green/15 text-brand-green-deep border-brand-green/30'
                              : user.role === 'MANAGER'
                                ? 'bg-brand-tag/15 text-brand-tag border-brand-tag/30'
                                : 'bg-surface border-hairline text-steel'
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4">
                        <Badge
                          variant="outline"
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}
                        >
                          {user.status || 'ACTIVE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 text-stone font-sans">{user.createdAt}</TableCell>
                      <TableCell className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(user)}
                            className="h-8 w-8 text-steel hover:text-ink transition-colors cursor-pointer"
                            aria-label="Edit user"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(user)}
                            disabled={isSelf(user.id)}
                            className={`h-8 w-8 text-brand-error/70 hover:text-brand-error hover:bg-brand-error/10 transition-colors cursor-pointer ${
                              isSelf(user.id) ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            aria-label="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add / Edit Dialog Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] bg-canvas border border-hairline text-ink">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User Profile' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Update directory details and security context variables for this user.'
                : 'Create a new user profile with standard initial security context.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="form-name" className="text-xs font-semibold text-charcoal">
                Full Name
              </Label>
              <Input
                id="form-name"
                {...register('name')}
                placeholder="Tony Stark"
                className={errors.name ? 'border-brand-error focus-visible:ring-brand-error' : ''}
              />
              {errors.name && (
                <p className="text-xs text-brand-error font-normal">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="form-email" className="text-xs font-semibold text-charcoal">
                Email Address
              </Label>
              <Input
                id="form-email"
                type="email"
                {...register('email')}
                placeholder="tony@stark.com"
                className={errors.email ? 'border-brand-error focus-visible:ring-brand-error' : ''}
              />
              {errors.email && (
                <p className="text-xs text-brand-error font-normal">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label
                htmlFor="form-password"
                className="text-xs font-semibold text-charcoal flex justify-between"
              >
                <span>Password</span>
                {editingUser && (
                  <span className="text-[10px] text-steel font-normal">
                    (Leave blank to keep current)
                  </span>
                )}
              </Label>
              <Input
                id="form-password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={
                  errors.password ? 'border-brand-error focus-visible:ring-brand-error' : ''
                }
              />
              {errors.password && (
                <p className="text-xs text-brand-error font-normal">{errors.password.message}</p>
              )}
            </div>

            {/* Role & Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="form-role" className="text-xs font-semibold text-charcoal">
                  Role Scope
                </Label>
                <select
                  id="form-role"
                  {...register('role')}
                  className="flex h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-1 text-sm text-ink outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                >
                  <option value="USER">USER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="form-status" className="text-xs font-semibold text-charcoal">
                  Status
                </Label>
                <select
                  id="form-status"
                  {...register('status')}
                  className="flex h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-1 text-sm text-ink outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsFormOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-green hover:bg-brand-green-deep text-primary font-medium rounded-full cursor-pointer px-4 py-2"
              >
                {isSubmitting ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-canvas border border-hairline text-ink">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the profile for{' '}
              <strong className="text-ink">{userToDelete?.name}</strong>? This will revoke all
              active session keys.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-brand-error hover:bg-brand-error/95 text-white font-medium rounded-full cursor-pointer px-4 py-2"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
export default UsersPage

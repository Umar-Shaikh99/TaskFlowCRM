import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { PageContainer } from '../../components/layout/PageContainer'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchTasks, createTask, updateTask, deleteTask } from '../../store/slices/taskSlice'
import { fetchUsers } from '../../store/slices/userSlice'
import { Plus, Calendar, User, Edit2, Trash2, GripVertical, AlertTriangle } from 'lucide-react'
import type { Task, TaskStatus, TaskPriority } from '../../types/task'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core'
import { usePermissions } from '../../hooks/usePermissions'

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assignedTo: z.string().min(1, 'Assignee is required'),
  dueDate: z.string().min(1, 'Due date is required'),
})

type TaskFormInputs = z.infer<typeof taskFormSchema>

// Droppable Column Component
function DroppableColumn({
  status,
  children,
  isEmpty,
}: {
  status: TaskStatus
  children: React.ReactNode
  isEmpty: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 overflow-y-auto space-y-3.5 pr-0.5 min-h-[400px] rounded-lg transition-colors duration-200 p-1.5 -m-1.5 ${
        isOver ? 'bg-surface-soft/80 border border-dashed border-brand-green/30' : ''
      }`}
    >
      {isEmpty ? (
        <div className="text-center py-16 text-xs text-stone font-sans border border-dashed border-hairline/80 rounded-xl bg-canvas/30 backdrop-blur-xs select-none">
          No tasks in this stage
        </div>
      ) : (
        children
      )}
    </div>
  )
}

// Draggable Task Card Component
function DraggableTaskCard({
  task,
  children,
  canEdit,
}: {
  task: Task
  children: React.ReactNode
  canEdit: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: !canEdit, // Only allow drag if user has permission to edit task status
  })

  return (
    <div
      ref={setNodeRef}
      {...(canEdit ? listeners : {})}
      {...(canEdit ? attributes : {})}
      className={`relative rounded-xl cursor-grab active:cursor-grabbing select-none outline-none transition-opacity duration-150 ${
        isDragging ? 'opacity-25' : ''
      }`}
    >
      {children}
    </div>
  )
}

interface TaskCardProps {
  task: Task
  canEdit: boolean
  canDelete: boolean
  assigneeName: string
  priorityStyle: string
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

// Memoized Task Card Component
const TaskCard = React.memo(
  ({ task, canEdit, canDelete, assigneeName, priorityStyle, onEdit, onDelete }: TaskCardProps) => {
    return (
      <Card className="group border-hairline shadow-xs hover:shadow-md transition-all duration-200 bg-canvas hover:border-steel/30 relative overflow-hidden">
        <CardContent className="p-4 space-y-3.5">
          {/* Priority and ID + Actions */}
          <div className="flex justify-between items-start gap-2">
            <Badge
              variant="outline"
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${priorityStyle}`}
            >
              {task.priority}
            </Badge>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-stone mr-1">
                {String(task.id).startsWith('temp-') ? 'Syncing...' : `#${task.id}`}
              </span>
              {(canEdit || canDelete) && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(task)
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="h-6 w-6 text-steel hover:text-ink hover:bg-surface/80 border border-hairline/30 rounded cursor-pointer flex items-center justify-center"
                      aria-label="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(task)
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="h-6 w-6 text-brand-error/70 hover:text-brand-error hover:bg-brand-error/10 border border-hairline/30 rounded cursor-pointer flex items-center justify-center"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Title & Desc */}
          <div className="space-y-1">
            <h4 className="text-sm font-sans font-semibold text-ink leading-snug group-hover:text-brand-tag transition-colors duration-150">
              {task.title}
            </h4>
            <p className="text-xs text-steel font-sans font-normal line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between border-t border-hairline-soft/80 pt-3 text-[11px] text-stone">
            <span className="flex items-center gap-1 font-sans font-medium bg-surface-soft px-2 py-0.5 rounded border border-hairline/40">
              <Calendar className="w-3 h-3 text-stone" />
              {task.dueDate}
            </span>
            <span className="flex items-center gap-1.5 font-mono font-medium max-w-[50%] truncate">
              <span className="w-4 h-4 rounded-full bg-brand-tag/15 text-brand-tag border border-brand-tag/20 flex items-center justify-center text-[9px] uppercase font-sans font-bold shrink-0">
                {assigneeName.slice(0, 2)}
              </span>
              <span className="truncate text-charcoal">{assigneeName}</span>
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }
)

TaskCard.displayName = 'TaskCard'

export const TasksPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { tasks, isLoading, error } = useAppSelector((state) => state.tasks)
  const { users } = useAppSelector((state) => state.users)
  const { can } = usePermissions()

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchTasks())
    dispatch(fetchUsers())
  }, [dispatch])

  // Setup form validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormInputs>({
    resolver: zodResolver(taskFormSchema),
  })

  // Open modal for adding
  const handleAddClick = useCallback(() => {
    setEditingTask(null)
    reset({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      assignedTo: users[0]?.id || '',
      dueDate: new Date().toISOString().split('T')[0],
    })
    setIsFormOpen(true)
  }, [users, reset])

  // Open modal for editing
  const handleEditClick = useCallback(
    (task: Task) => {
      setEditingTask(task)
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
      })
      setIsFormOpen(true)
    },
    [reset]
  )

  // Open delete confirmation
  const handleDeleteClick = useCallback((task: Task) => {
    setTaskToDelete(task)
    setIsDeleteOpen(true)
  }, [])

  // Submit handler (Create / Update)
  const onSubmit = useCallback(
    async (data: TaskFormInputs) => {
      try {
        if (editingTask) {
          const resultAction = await dispatch(updateTask({ id: editingTask.id, input: data }))
          if (updateTask.fulfilled.match(resultAction)) {
            toast.success('Task updated successfully')
            setIsFormOpen(false)
          } else {
            toast.error(`Failed to update task: ${resultAction.payload || 'Unknown error'}`)
          }
        } else {
          const resultAction = await dispatch(createTask(data))
          if (createTask.fulfilled.match(resultAction)) {
            toast.success('Task created successfully')
            setIsFormOpen(false)
          } else {
            toast.error(`Failed to create task: ${resultAction.payload || 'Unknown error'}`)
          }
        }
      } catch (error) {
        toast.error('An unexpected error occurred')
      }
    },
    [dispatch, editingTask]
  )

  // Delete confirm handler
  const handleDeleteConfirm = useCallback(async () => {
    if (!taskToDelete) return
    try {
      const resultAction = await dispatch(deleteTask(taskToDelete.id))
      if (deleteTask.fulfilled.match(resultAction)) {
        toast.success('Task deleted successfully')
        setIsDeleteOpen(false)
        setTaskToDelete(null)
      } else {
        toast.error(`Failed to delete task: ${resultAction.payload || 'Unknown error'}`)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }, [dispatch, taskToDelete])

  // Handle Drag Start event
  const handleDragStart = useCallback((event: any) => {
    setActiveId(String(event.active.id))
  }, [])

  // Handle Drag End event
  const handleDragEnd = useCallback(
    async (event: any) => {
      setActiveId(null)
      const { active, over } = event
      if (!over) return

      const taskId = String(active.id)
      const newStatus = over.id as TaskStatus

      const task = tasks.find((t) => String(t.id) === taskId)
      if (task && task.status !== newStatus) {
        try {
          const resultAction = await dispatch(
            updateTask({ id: taskId, input: { status: newStatus } })
          )
          if (updateTask.fulfilled.match(resultAction)) {
            toast.success(`Task moved to ${newStatus.replace('_', ' ')}`)
          } else {
            toast.error(`Failed to move task: ${resultAction.payload || 'Network error'}`)
          }
        } catch (err) {
          toast.error('An unexpected error occurred while moving the task')
        }
      }
    },
    [dispatch, tasks]
  )

  const getPriorityStyle = useCallback((priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-brand-error/10 text-brand-error border-brand-error/20'
      case 'HIGH':
        return 'bg-brand-warn/15 text-brand-warn border-brand-warn/30'
      case 'MEDIUM':
        return 'bg-brand-tag/15 text-brand-tag border-brand-tag/30'
      default:
        return 'bg-surface border-hairline text-steel'
    }
  }, [])

  const getAssigneeName = useCallback(
    (assignedToId: string) => {
      const user = users.find((u) => u.id === assignedToId)
      return user ? user.name : 'Unassigned'
    },
    [users]
  )

  const getDotColor = useCallback((status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'bg-stone/85'
      case 'IN_PROGRESS':
        return 'bg-brand-tag'
      case 'REVIEW':
        return 'bg-brand-warn'
      default:
        return 'bg-brand-green'
    }
  }, [])

  const columns = useMemo(
    () => [
      { label: 'To Do', status: 'TODO' as TaskStatus },
      { label: 'In Progress', status: 'IN_PROGRESS' as TaskStatus },
      { label: 'In Review', status: 'REVIEW' as TaskStatus },
      { label: 'Completed', status: 'DONE' as TaskStatus },
    ],
    []
  )

  const actions = useMemo(() => {
    return can('tasks:create') ? (
      <Button
        onClick={handleAddClick}
        className="bg-brand-green hover:bg-brand-green-deep text-primary font-medium rounded-full cursor-pointer flex items-center gap-2 px-4 py-2"
      >
        <Plus className="w-4 h-4" /> New Task
      </Button>
    ) : undefined
  }, [can, handleAddClick])

  return (
    <PageContainer
      title="Task Kanban Board"
      subtitle="Track user assignments, priorities, and task lifecycle progressions."
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
                onClick={() => dispatch(fetchTasks())}
                className="bg-canvas border-hairline hover:bg-surface text-xs font-semibold rounded-full cursor-pointer h-7"
              >
                Reload Kanban
              </Button>
            </AlertAction>
          </Alert>
        )}

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start h-full">
            {columns.map((column) => {
              const columnTasks = tasks.filter((t) => t.status === column.status)

              return (
                <div
                  key={column.status}
                  className="bg-surface/50 border border-hairline rounded-xl flex flex-col max-h-[80vh] overflow-hidden p-3.5 space-y-3.5 shadow-xs"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-hairline/85 pb-2.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getDotColor(column.status)}`} />
                      <span className="text-xs font-sans font-bold text-charcoal uppercase tracking-wider">
                        {column.label}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold bg-canvas px-2.5 py-0.5 rounded-full border border-hairline text-steel">
                      {isLoading && tasks.length === 0 ? '...' : columnTasks.length}
                    </span>
                  </div>

                  {/* Droppable Column wrapper */}
                  <DroppableColumn
                    status={column.status}
                    isEmpty={columnTasks.length === 0 && (!isLoading || tasks.length > 0)}
                  >
                    {isLoading && tasks.length === 0
                      ? Array.from({ length: 2 }).map((_, idx) => (
                          <Card
                            key={idx}
                            className="border-hairline shadow-xs bg-canvas animate-pulse"
                          >
                            <CardContent className="p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-12 rounded" />
                                <Skeleton className="h-3 w-8 rounded" />
                              </div>
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4 rounded" />
                                <Skeleton className="h-3 w-full rounded" />
                              </div>
                              <div className="flex items-center justify-between border-t border-hairline-soft pt-2.5">
                                <Skeleton className="h-3 w-16 rounded" />
                                <Skeleton className="h-3 w-16 rounded" />
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      : columnTasks.map((task) => {
                          const isTaskEditable = can('tasks:edit', task.assignedTo)
                          const isTaskDeletable = can('tasks:delete')
                          const assigneeName = getAssigneeName(task.assignedTo)
                          const priorityStyle = getPriorityStyle(task.priority)

                          return (
                            <DraggableTaskCard key={task.id} task={task} canEdit={isTaskEditable}>
                              <TaskCard
                                task={task}
                                canEdit={isTaskEditable}
                                canDelete={isTaskDeletable}
                                assigneeName={assigneeName}
                                priorityStyle={priorityStyle}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                              />
                            </DraggableTaskCard>
                          )
                        })}
                  </DroppableColumn>
                </div>
              )
            })}
          </div>

          <DragOverlay>
            {activeId ? (() => {
              const activeTask = tasks.find((t) => String(t.id) === activeId)
              if (!activeTask) return null
              const isTaskEditable = can('tasks:edit', activeTask.assignedTo)
              const isTaskDeletable = can('tasks:delete')
              const assigneeName = getAssigneeName(activeTask.assignedTo)
              const priorityStyle = getPriorityStyle(activeTask.priority)

              return (
                <div className="rotate-1.5 scale-102 opacity-95 shadow-md cursor-grabbing">
                  <TaskCard
                    task={activeTask}
                    canEdit={isTaskEditable}
                    canDelete={isTaskDeletable}
                    assigneeName={assigneeName}
                    priorityStyle={priorityStyle}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                </div>
              )
            })() : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add / Edit Dialog Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] bg-canvas border border-hairline text-ink">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task Settings' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask
                ? 'Modify task title, description context, role owner assignments, or target milestones.'
                : 'Publish a new action ticket to the team workflow board.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="form-title" className="text-xs font-semibold text-charcoal">
                Task Title
              </Label>
              <Input
                id="form-title"
                {...register('title')}
                placeholder="Database replication audit..."
                className={errors.title ? 'border-brand-error focus-visible:ring-brand-error' : ''}
              />
              {errors.title && (
                <p className="text-xs text-brand-error font-normal">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="form-desc" className="text-xs font-semibold text-charcoal">
                Task Description
              </Label>
              <Input
                id="form-desc"
                {...register('description')}
                placeholder="Specify data validation criteria and checklist steps."
                className={
                  errors.description ? 'border-brand-error focus-visible:ring-brand-error' : ''
                }
              />
              {errors.description && (
                <p className="text-xs text-brand-error font-normal">{errors.description.message}</p>
              )}
            </div>

            {/* Due Date & Assignee */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="form-due" className="text-xs font-semibold text-charcoal">
                  Due Date
                </Label>
                <Input
                  id="form-due"
                  type="date"
                  {...register('dueDate')}
                  className={
                    errors.dueDate ? 'border-brand-error focus-visible:ring-brand-error' : ''
                  }
                />
                {errors.dueDate && (
                  <p className="text-xs text-brand-error font-normal">{errors.dueDate.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="form-assignee" className="text-xs font-semibold text-charcoal">
                  Assigned To
                </Label>
                <select
                  id="form-assignee"
                  {...register('assignedTo')}
                  className="flex h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-1 text-sm text-ink outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                >
                  <option value="" disabled>
                    Select User
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
                {errors.assignedTo && (
                  <p className="text-xs text-brand-error font-normal">
                    {errors.assignedTo.message}
                  </p>
                )}
              </div>
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="form-priority" className="text-xs font-semibold text-charcoal">
                  Priority
                </Label>
                <select
                  id="form-priority"
                  {...register('priority')}
                  className="flex h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-1 text-sm text-ink outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="form-status" className="text-xs font-semibold text-charcoal">
                  Status Stage
                </Label>
                <select
                  id="form-status"
                  {...register('status')}
                  className="flex h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-1 text-sm text-ink outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="DONE">DONE</option>
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
                {isSubmitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-canvas border border-hairline text-ink">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete task{' '}
              <strong className="text-ink">#{taskToDelete?.id}</strong>: "{taskToDelete?.title}"?
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
export default TasksPage

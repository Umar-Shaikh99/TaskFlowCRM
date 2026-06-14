import React, { useEffect, useMemo, useCallback } from 'react'
import { PageContainer } from '../../components/layout/PageContainer'
import {
  CheckSquare,
  Users,
  Award,
  TrendingUp,
  BarChart2,
  Sparkles,
  Activity as ActivityIcon,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchUsers } from '../../store/slices/userSlice'
import { fetchTasks, selectDashboardMetrics } from '../../store/slices/taskSlice'
import { fetchActivities } from '../../store/slices/activitySlice'
import { useNavigate } from 'react-router-dom'
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert'

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const metrics = useAppSelector(selectDashboardMetrics)
  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useAppSelector((state) => state.tasks)
  const {
    users,
    isLoading: usersLoading,
    error: usersError,
  } = useAppSelector((state) => state.users)
  const {
    activities,
    isLoading: activitiesLoading,
    error: activitiesError,
  } = useAppSelector((state) => state.activities)

  const isLoading = tasksLoading || usersLoading || activitiesLoading
  const hasError = tasksError || usersError || activitiesError
  const errorMessage =
    tasksError || usersError || activitiesError || 'Failed to fetch dashboard data'

  const handleRetry = useCallback(() => {
    dispatch(fetchUsers())
    dispatch(fetchTasks())
    dispatch(fetchActivities())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchUsers())
    dispatch(fetchTasks())
    dispatch(fetchActivities())
  }, [dispatch])

  // Calculate detailed column distribution
  const totalTasks = tasks.length
  const todoCount = useMemo(() => tasks.filter((t) => t.status === 'TODO').length, [tasks])
  const inProgressCount = useMemo(
    () => tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    [tasks]
  )
  const reviewCount = useMemo(() => tasks.filter((t) => t.status === 'REVIEW').length, [tasks])
  const doneCount = useMemo(() => tasks.filter((t) => t.status === 'DONE').length, [tasks])

  const getPercentage = useCallback(
    (count: number) => {
      if (totalTasks === 0) return 0
      return Math.round((count / totalTasks) * 100)
    },
    [totalTasks]
  )

  // Calculate workloads (tasks per user)
  const userWorkloads = useMemo(() => {
    return users
      .map((user) => {
        const assignedTasksCount = tasks.filter((t) => t.assignedTo === user.id).length
        return {
          user,
          taskCount: assignedTasksCount,
          percentage: totalTasks > 0 ? Math.round((assignedTasksCount / totalTasks) * 100) : 0,
        }
      })
      .sort((a, b) => b.taskCount - a.taskCount)
      .slice(0, 4) // Show top 4 loaded users
  }, [users, tasks, totalTasks])

  const stats = useMemo(
    () => [
      {
        label: 'Active Tasks',
        value: String(metrics.activeTasks),
        icon: CheckSquare,
        change: `${metrics.totalTasks - metrics.completedTasks} incomplete tasks`,
      },
      {
        label: 'Team Members',
        value: String(metrics.totalUsers),
        icon: Users,
        change: 'Active directory users',
      },
      {
        label: 'Completion Rate',
        value: `${metrics.completionRate}%`,
        icon: Award,
        change: `${metrics.completedTasks} of ${metrics.totalTasks} tasks completed`,
      },
      {
        label: 'System Load',
        value: 'Normal',
        icon: TrendingUp,
        change: 'All services online',
      },
    ],
    [metrics]
  )

  const handleCreateTaskClick = useCallback(() => {
    navigate('/tasks')
  }, [navigate])

  const actions = useMemo(
    () => (
      <Button
        onClick={handleCreateTaskClick}
        className="bg-brand-green hover:bg-brand-green-deep text-primary font-medium rounded-full cursor-pointer animate-in fade-in duration-200"
      >
        Create Task
      </Button>
    ),
    [handleCreateTaskClick]
  )

  return (
    <PageContainer
      title="Dashboard Overview"
      subtitle="Welcome to TaskFlow CRM. Here is a summary of active items."
      actions={actions}
    >
      <div className="space-y-6">
        {/* Error Alert with Reload Action */}
        {hasError && (
          <Alert
            variant="destructive"
            className="border-brand-error/20 bg-brand-error/5 text-ink animate-in slide-in-from-top duration-250"
          >
            <AlertTriangle className="h-4 w-4 text-brand-error" />
            <AlertTitle className="font-semibold text-brand-error">
              API Integration Failure
            </AlertTitle>
            <AlertDescription className="text-xs text-charcoal">
              {errorMessage}. Check JSON Server status and try again.
            </AlertDescription>
            <AlertAction>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="bg-canvas border-hairline hover:bg-surface text-xs font-semibold rounded-full cursor-pointer h-7"
              >
                Reload Data
              </Button>
            </AlertAction>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} className="border-hairline shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <span className="text-sm font-sans font-medium text-steel">{stat.label}</span>
                  <div className="p-1.5 rounded-md bg-surface border border-hairline text-charcoal">
                    <Icon className="w-4 h-4 text-brand-green" />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2 mt-1">
                      <Skeleton className="h-7 w-20" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold font-sans tracking-tight text-ink">
                        {stat.value}
                      </div>
                      <p className="text-[11px] font-mono text-steel mt-0.5">{stat.change}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Informational Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts & Distributions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Distribution */}
            <Card className="border-hairline shadow-xs bg-canvas">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-brand-green" />
                  <CardTitle className="text-sm font-sans font-bold text-ink">
                    Task Distribution
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-steel">
                  Percentage and count of total tasks currently assigned to Kanban columns.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-3.5 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))
                ) : totalTasks === 0 ? (
                  <div className="text-center py-8 text-xs text-stone font-sans border border-dashed border-hairline rounded-md">
                    No active tasks currently registered.
                  </div>
                ) : (
                  [
                    {
                      label: 'To Do',
                      count: todoCount,
                      pct: getPercentage(todoCount),
                      color: 'bg-stone-500/80',
                    },
                    {
                      label: 'In Progress',
                      count: inProgressCount,
                      pct: getPercentage(inProgressCount),
                      color: 'bg-brand-tag/80',
                    },
                    {
                      label: 'In Review',
                      count: reviewCount,
                      pct: getPercentage(reviewCount),
                      color: 'bg-brand-warn/80',
                    },
                    {
                      label: 'Completed',
                      count: doneCount,
                      pct: getPercentage(doneCount),
                      color: 'bg-brand-green/80',
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-charcoal font-medium">{item.label}</span>
                        <span className="text-steel">
                          {item.count} tasks ({item.pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-hairline-soft">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* User Workloads */}
            <Card className="border-hairline shadow-xs bg-canvas">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-green" />
                  <CardTitle className="text-sm font-sans font-bold text-ink">
                    Team Workload Index
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-steel">
                  Breakdown of active task assignments across team members.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg border border-hairline bg-surface/30"
                      >
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                          <Skeleton className="h-1.5 w-full rounded-full" />
                        </div>
                      </div>
                    ))
                  ) : userWorkloads.length === 0 ? (
                    <div className="text-center py-6 text-xs text-stone col-span-2">
                      No workloads indexed
                    </div>
                  ) : (
                    userWorkloads.map(({ user, taskCount, percentage }) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-hairline bg-surface/30 hover:bg-surface/50 transition-colors"
                      >
                        <Avatar className="h-8 w-8 border border-hairline">
                          <AvatarFallback className="bg-surface text-steel text-[10px] font-bold">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-ink truncate block">
                              {user.name}
                            </span>
                            <span className="text-[10px] font-mono text-steel">
                              {taskCount} tasks
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden mt-1.5">
                            <div
                              className="h-full bg-brand-green/80 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed panel */}
          <Card className="border-hairline shadow-xs bg-canvas flex flex-col h-[520px] overflow-hidden">
            <CardHeader className="pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-brand-green" />
                <CardTitle className="text-sm font-sans font-bold text-ink">
                  Recent Activities
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-steel">
                System audit log of recent user and task mutations.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-1">
              <ActivityTimeline activities={activities} isLoading={activitiesLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default DashboardPage

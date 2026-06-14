import React from 'react'
import {
  Key,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  UserCheck,
  UserMinus,
  FileText,
} from 'lucide-react'
import type { Activity } from '../../store/slices/activitySlice'
import { Skeleton } from '@/components/ui/skeleton'

interface ActivityTimelineProps {
  activities: Activity[]
  isLoading?: boolean
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 10) return 'Just now'
    if (diffSec < 60) return `${diffSec}s ago`
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHour < 24) return `${diffHour}h ago`
    if (diffDay === 1) return 'Yesterday'
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString()
  } catch (_) {
    return 'Recently'
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'auth_login':
      return {
        icon: Key,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25',
      }
    case 'task_created':
      return {
        icon: PlusCircle,
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/25',
      }
    case 'task_completed':
      return {
        icon: CheckCircle2,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25',
      }
    case 'task_deleted':
      return {
        icon: AlertCircle,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/25',
      }
    case 'user_added':
      return {
        icon: UserPlus,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/25',
      }
    case 'user_updated':
      return {
        icon: UserCheck,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/25',
      }
    case 'user_deleted':
      return {
        icon: UserMinus,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/25',
      }
    default:
      return {
        icon: FileText,
        color: 'text-steel bg-surface border-hairline',
      }
  }
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  isLoading = false,
}) => {
  if (isLoading && activities.length === 0) {
    return (
      <div className="space-y-4 pl-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-hairline">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative flex gap-4 items-start animate-pulse">
            <div className="absolute -left-[23px] size-6 rounded-full bg-muted border border-hairline" />
            <div className="flex-1 space-y-2 bg-surface-soft/40 p-3 rounded-lg border border-hairline">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-stone font-sans border border-dashed border-hairline rounded-md">
        No recent audit activities logged
      </div>
    )
  }

  // Display top 10 activities
  const recentActivities = activities.slice(0, 10)

  return (
    <div className="relative pl-4 space-y-6 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-hairline">
      {recentActivities.map((activity) => {
        const { icon: Icon, color } = getActivityIcon(activity.type)
        return (
          <div key={activity.id} className="relative flex gap-4 items-start group">
            {/* Timeline dot/icon */}
            <div
              className={`absolute -left-[23px] p-1 rounded-full border flex items-center justify-center z-10 size-6 ${color}`}
            >
              <Icon className="size-3" />
            </div>

            {/* Content box */}
            <div className="flex-1 min-w-0 bg-surface-soft/40 hover:bg-surface-soft/80 p-3 rounded-lg border border-hairline transition-colors duration-150">
              <p className="text-xs text-ink font-sans leading-relaxed break-words font-medium">
                {activity.description}
              </p>
              <span className="text-[10px] font-mono text-steel mt-1.5 block">
                {formatRelativeTime(activity.createdAt)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ActivityTimeline

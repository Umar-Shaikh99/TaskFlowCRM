import React, { useEffect, useState } from 'react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { useAppSelector } from '../../store/hooks'
import { CheckSquare, Users } from 'lucide-react'

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const { tasks } = useAppSelector((state) => state.tasks)
  const { users } = useAppSelector((state) => state.users)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1 bg-surface-soft border border-hairline rounded-md text-[11px] text-steel hover:text-ink hover:bg-surface transition-colors cursor-pointer"
      >
        <span>Search...</span>
        <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-hairline bg-canvas px-1 font-mono text-[9px] font-semibold text-stone">
          <span>⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tasks, team members..." />
        <CommandList className="max-h-[300px] overflow-y-auto">
          <CommandEmpty>No results found.</CommandEmpty>

          {tasks.length > 0 && (
            <CommandGroup heading="Tasks">
              {tasks.map((task) => (
                <CommandItem
                  key={task.id}
                  value={task.title}
                  onSelect={() => {
                    setOpen(false)
                    navigate('/tasks')
                  }}
                  className="cursor-pointer flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-3.5 w-3.5 text-brand-green shrink-0" />
                    <span className="font-medium text-xs text-ink">{task.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-steel">#{task.id}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {users.length > 0 && (
            <CommandGroup heading="Team Members">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name + ' ' + user.email}
                  onSelect={() => {
                    setOpen(false)
                    navigate('/users')
                  }}
                  className="cursor-pointer flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-brand-tag shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-ink leading-none">{user.name}</span>
                      <span className="text-[10px] text-steel mt-0.5">{user.email}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-semibold py-0 scale-90">
                    {user.role}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default CommandPalette

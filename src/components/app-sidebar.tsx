import * as React from 'react'
import { useAppSelector } from '@/store/hooks'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  User as UserIcon,
  FolderLock,
  Building2,
  UserSquare2,
  FolderOpen,
  PieChart,
  Target,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { TeamSwitcher } from '@/components/team-switcher'
import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentUser } = useAppSelector((state) => state.auth)

  const displayUser = currentUser || {
    name: 'Interview Candidate',
    email: 'candidate@example.com',
    role: 'ADMIN' as const,
    avatarUrl: '',
  }

  // Map user structure for NavUser
  const userData = {
    name: displayUser.name,
    email: displayUser.email,
    avatar: displayUser.avatarUrl || '',
  }

  // Workspaces teams switcher data
  const teamsData = [
    {
      name: 'TaskFlow Inc.',
      logo: <FolderLock className="size-4" />,
      plan: 'Enterprise CRM',
    },
    {
      name: 'Acme Workspace',
      logo: <Building2 className="size-4" />,
      plan: 'Startup',
    },
    {
      name: 'Personal Space',
      logo: <UserSquare2 className="size-4" />,
      plan: 'Free Board',
    },
  ]

  // Main navigation sections with collapsible groups
  const navMainData = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: <LayoutDashboard className="size-4" />,
      isActive: true,
      items: [
        {
          title: 'Analytics Overview',
          url: '/dashboard',
        },
      ],
    },
    ...(displayUser.role === 'ADMIN'
      ? [
          {
            title: 'Users & Team',
            url: '/users',
            icon: <Users className="size-4" />,
            items: [
              {
                title: 'Team Members',
                url: '/users',
              },
            ],
          },
        ]
      : []),
    {
      title: 'Task Tracker',
      url: '/tasks',
      icon: <CheckSquare className="size-4" />,
      items: [
        {
          title: 'Kanban Board',
          url: '/tasks',
        },
      ],
    },
    {
      title: 'Management',
      url: '/profile',
      icon: <UserIcon className="size-4" />,
      items: [
        {
          title: 'Profile Settings',
          url: '/profile',
        },
      ],
    },
  ]

  // Mock CRM Project folders
  const projectsData = [
    {
      name: 'CRM Sales Pipeline',
      url: '/tasks',
      icon: <FolderOpen className="size-4" />,
    },
    {
      name: 'Client Onboarding',
      url: '/tasks',
      icon: <Target className="size-4" />,
    },
    {
      name: 'Q3 Marketing Goals',
      url: '/dashboard',
      icon: <PieChart className="size-4" />,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teamsData} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
        <NavProjects projects={projectsData} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

import { Badge } from '@/components/ui/badge'
import {
  FileIcon,
  TagIcon,
  ActivityIcon,
  UserIcon,
  MailIcon,
  CalendarIcon,
} from 'lucide-react'
import { parseISO, format } from 'date-fns'

export const columns = [
  {
    accessorKey: 'name',
    header: () => (
      <div className="flex items-center gap-2">
        <FileIcon className="h-4 w-4 text-muted-foreground" />
        <span>Project</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center font-medium">
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: () => (
      <div className="flex items-center gap-2">
        <TagIcon className="h-4 w-4 text-muted-foreground" />
        <span>Type</span>
      </div>
    ),
    cell: ({ row }) => {
      const type = row.getValue('type')
      return (
        <div className="flex items-center">
          <Badge variant="outline" className="bg-secondary/30">
            {type}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: () => (
      <div className="flex items-center gap-2">
        <ActivityIcon className="h-4 w-4 text-muted-foreground" />
        <span>Status</span>
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue('status')
      const statusStyles = {
        active:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        pending:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        completed:
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      }

      return (
        <div className="flex items-center">
          <Badge
            className={
              statusStyles[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
            }
          >
            {status}
          </Badge>
        </div>
      )
    },
  },
  {
    id: 'owner',
    accessorFn: (row) => row?.owner?.username || null,
    header: () => (
      <div className="flex items-center gap-2">
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        <span>Owner</span>
      </div>
    ),
    cell: ({ getValue }) => {
      const email = getValue()

      if (!email) {
        return <span className="text-muted-foreground">—</span>
      }

      // Simplify the display to just show the email
      return (
        <div className="flex items-center gap-1.5">
          <MailIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: () => (
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <span>Created At</span>
      </div>
    ),
    cell: ({ row }) => {
      const dateString = row.getValue('createdAt')

      if (!dateString)
        return (
          <div className="flex items-start">
            <span className="text-muted-foreground">—</span>
          </div>
        )

      try {
        const date = parseISO(dateString)
        return (
          <div className="flex flex-col items-start">
            <span className="text-sm">{format(date, 'MMM dd, yyyy')}</span>
            <span className="text-xs text-muted-foreground">
              {format(date, 'HH:mm')}
            </span>
          </div>
        )
      } catch (error) {
        return (
          <div className="flex items-start">
            <span className="text-muted-foreground">{dateString}</span>
          </div>
        )
      }
    },
  },
]

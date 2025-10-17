// shadcn/ui Data Table Template for Repurpose MVP
'use client'

import { useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Settings2,
  Search,
} from 'lucide-react'

// Example 1: Posts Table with Actions
// ----------------------------------

export type Post = {
  id: string
  platform: 'twitter' | 'linkedin' | 'instagram'
  content: string
  status: 'draft' | 'scheduled' | 'posted' | 'failed'
  scheduledTime: string | null
  createdAt: string
}

export const postsColumns: ColumnDef<Post>[] = [
  {
    accessorKey: 'platform',
    header: 'Platform',
    cell: ({ row }) => {
      const platform = row.getValue('platform') as string
      const icons = {
        twitter: '🐦',
        linkedin: '💼',
        instagram: '📷',
      }
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg">{icons[platform]}</span>
          <span className="capitalize">{platform}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'content',
    header: 'Content',
    cell: ({ row }) => {
      const content = row.getValue('content') as string
      return (
        <div className="max-w-[400px] truncate" title={content}>
          {content}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusColors = {
        draft: 'bg-gray-100 text-gray-700',
        scheduled: 'bg-blue-100 text-blue-700',
        posted: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
      }
      return (
        <Badge className={statusColors[status]} variant="outline">
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'scheduledTime',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Scheduled Time
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const time = row.getValue('scheduledTime') as string | null
      return time ? (
        <div className="text-sm">
          {new Date(time).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const post = row.original
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      )
    },
  },
]

// Example 2: Reusable Data Table Component
// --------------------------------------

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey = 'content',
  searchPlaceholder = 'Search...',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="pl-9"
          />
        </div>

        {/* Column Visibility Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Settings2 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// Example 3: Posts Table Page Component
// ------------------------------------

export function PostsTablePage() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      platform: 'twitter',
      content: 'Just launched our new feature!',
      status: 'posted',
      scheduledTime: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      platform: 'linkedin',
      content: 'Excited to share our Q4 results...',
      status: 'scheduled',
      scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    // More posts...
  ])

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        <p className="text-gray-600 mt-2">
          Manage your scheduled and posted content
        </p>
      </div>

      <DataTable
        columns={postsColumns}
        data={posts}
        searchKey="content"
        searchPlaceholder="Search posts..."
      />
    </div>
  )
}

// Repurpose-Specific Table Patterns
export const RepurposeTablePatterns = {
  // Pattern 1: Status badge colors
  statusColors: {
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    scheduled: 'bg-blue-100 text-blue-700 border-blue-300',
    posted: 'bg-green-100 text-green-700 border-green-300',
    failed: 'bg-red-100 text-red-700 border-red-300',
  },

  // Pattern 2: Platform icons
  platformIcons: {
    twitter: '🐦',
    linkedin: '💼',
    instagram: '📷',
  },

  // Pattern 3: Pagination sizes
  paginationSizes: [10, 20, 50, 100],

  // Pattern 4: Mobile responsive
  hideOnMobile: 'hidden md:table-cell',
  mobileFullWidth: 'w-full md:w-auto',
}

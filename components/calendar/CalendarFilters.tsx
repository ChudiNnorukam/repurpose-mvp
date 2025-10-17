'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FiltersState {
  platforms: string[]
  status: string
  search: string
}

interface CalendarFiltersProps {
  filters: FiltersState
  onChange: (filters: FiltersState) => void
}

export function CalendarFilters({ filters, onChange }: CalendarFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const platforms = [
    { id: 'twitter', label: 'Twitter', color: 'text-blue-500' },
    { id: 'linkedin', label: 'LinkedIn', color: 'text-blue-600' },
    { id: 'instagram', label: 'Instagram', color: 'text-pink-500' }
  ]

  const statuses = [
    { id: 'all', label: 'All Posts' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'posted', label: 'Posted' },
    { id: 'failed', label: 'Failed' }
  ]

  const hasActiveFilters =
    filters.platforms.length < 3 ||
    filters.status !== 'all' ||
    filters.search.length > 0

  const clearFilters = () => {
    onChange({
      platforms: ['twitter', 'linkedin', 'instagram'],
      status: 'all',
      search: ''
    })
  }

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              {/* Platform filters */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Platforms</Label>
                <div className="flex gap-4">
                  {platforms.map(platform => (
                    <div key={platform.id} className="flex items-center gap-2">
                      <Checkbox
                        id={platform.id}
                        checked={filters.platforms.includes(platform.id)}
                        onCheckedChange={(checked) => {
                          const newPlatforms = checked
                            ? [...filters.platforms, platform.id]
                            : filters.platforms.filter(p => p !== platform.id)
                          onChange({ ...filters, platforms: newPlatforms })
                        }}
                      />
                      <Label
                        htmlFor={platform.id}
                        className={`cursor-pointer ${platform.color}`}
                      >
                        {platform.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status filters */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Status</Label>
                <div className="flex gap-3 flex-wrap">
                  {statuses.map(status => (
                    <Button
                      key={status.id}
                      size="sm"
                      variant={filters.status === status.id ? 'default' : 'outline'}
                      onClick={() => onChange({ ...filters, status: status.id })}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Search Content</Label>
                <Input
                  type="text"
                  placeholder="Search post content..."
                  value={filters.search}
                  onChange={(e) => onChange({ ...filters, search: e.target.value })}
                />
              </div>

              {/* Clear button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

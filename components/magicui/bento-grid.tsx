import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface BentoGridProps {
  children: ReactNode
  className?: string
}

interface BentoCardProps {
  children: ReactNode
  className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn(
      "grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
      className
    )}>
      {children}
    </div>
  )
}

export function BentoCard({ children, className }: BentoCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md",
      className
    )}>
      {children}
    </div>
  )
}

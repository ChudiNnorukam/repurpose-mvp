"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, ReactNode } from "react"

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  shimmerColor?: string
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "#ffffff",
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ backgroundPosition: "-200% 0" }}
        animate={{ backgroundPosition: "200% 0" }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}40, transparent)`,
          backgroundSize: "200% 100%"
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  )
}

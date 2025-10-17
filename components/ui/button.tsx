import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { COLOR_PRIMARY, COLOR_AI, COLOR_SUCCESS, COLOR_DESTRUCTIVE, COLOR_SECONDARY } from "@/lib/design-tokens"

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: `${COLOR_PRIMARY.bg} ${COLOR_PRIMARY.bgHover} text-white ${COLOR_PRIMARY.ring}`,
        ai: `${COLOR_AI.bg} ${COLOR_AI.bgHover} text-white ${COLOR_AI.ring}`,
        success: `${COLOR_SUCCESS.bg} ${COLOR_SUCCESS.bgHover} text-white ${COLOR_SUCCESS.ring}`,
        destructive: `${COLOR_DESTRUCTIVE.bg} ${COLOR_DESTRUCTIVE.bgHover} text-white ${COLOR_DESTRUCTIVE.ring}`,
        secondary: `bg-white ${COLOR_SECONDARY.bgHover} ${COLOR_SECONDARY.text} border ${COLOR_SECONDARY.border} ${COLOR_SECONDARY.ring}`,
        ghost: `hover:bg-gray-100 ${COLOR_SECONDARY.text}`,
        outline: `border-2 ${COLOR_PRIMARY.border} ${COLOR_PRIMARY.text} hover:bg-blue-50`,
        link: "underline-offset-4 hover:underline text-current",
      },
      size: {
        default: "px-4 py-2",
        sm: "px-3 py-1.5 text-sm",
        lg: "px-6 py-3 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

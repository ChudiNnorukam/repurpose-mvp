import React from "react"
import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-base font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:brightness-110 focus:ring-indigo-400",
        secondary:
          "border border-white/15 bg-white/5 text-white/90 shadow-sm backdrop-blur hover:bg-white/10 focus:ring-white/30",
        ghost: "hover:bg-white/10 text-white/90",
        outline:
          "border-2 border-current bg-transparent hover:bg-white/5 focus:ring-current",
        link: "underline-offset-4 hover:underline text-current",
      },
      size: {
        default: "px-5 py-3",
        sm: "px-3 py-2 text-sm",
        lg: "px-6 py-4 text-lg",
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

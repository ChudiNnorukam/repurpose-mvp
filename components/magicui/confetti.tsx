"use client"

import { useEffect, useState } from "react"
import confetti from "canvas-confetti"

export function useConfetti() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fire = (options?: confetti.Options) => {
    if (!isClient) return

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      ...options
    })
  }

  return { fire }
}

export function fireConfetti(options?: confetti.Options) {
  if (typeof window === "undefined") return

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    ...options
  })
}

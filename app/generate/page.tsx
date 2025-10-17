'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { COLOR_PRIMARY } from '@/lib/design-tokens'
import { Loader2 } from 'lucide-react'

export default function GeneratePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to create page with generate mode
    router.replace('/create?mode=generate')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className={`h-8 w-8 animate-spin ${COLOR_PRIMARY.text}`} />
    </div>
  )
}

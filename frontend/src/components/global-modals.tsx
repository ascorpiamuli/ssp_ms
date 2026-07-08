'use client'

import { useState, useEffect } from 'react'

// This is where you'll put global modals like confirmation dialogs
export function GlobalModals() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Add your global modals here */}
      {/* Example: <ConfirmationModal /> */}
    </>
  )
}

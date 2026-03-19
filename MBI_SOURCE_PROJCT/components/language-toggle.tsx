"use client"

import { useRouter } from 'next/navigation'

export function LanguageToggle() {
  const router = useRouter()
  const path = window.location.pathname
  const locale = path.startsWith('/fr') ? 'en' : 'fr'

  const switchLang = () => {
    const newPath = locale === 'fr' ? `/fr${path}` : path.replace(/^\/fr/, '')
    router.push(newPath || '/')
  }

  return (
    <button
      onClick={switchLang}
      className="fixed top-4 right-4 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium shadow"
    >
      {locale.toUpperCase()}
    </button>
  )
}
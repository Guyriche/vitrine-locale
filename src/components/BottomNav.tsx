'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const HIDDEN_ON = ['/login', '/register']

const tabs = [
  { href: '/', label: 'Accueil', icon: '🏠' },
  { href: '/orders', label: 'Commandes', icon: '📋' },
  { href: '/profile', label: 'Profil', icon: '👤' },
]

export default function BottomNav() {
  const { user, profile } = useAuth()
  const pathname = usePathname()

  if (HIDDEN_ON.includes(pathname)) return null
  if (!user || profile?.role !== 'client') return null

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-forest/10 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5 flex-1 py-2">
              <span className={`text-xl ${active ? '' : 'opacity-50'}`}>{tab.icon}</span>
              <span className={`text-[10px] ${active ? 'text-forest font-medium' : 'text-forest/50'}`}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
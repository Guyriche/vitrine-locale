'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  { href: '/dashboard', label: "Vue d'ensemble", icon: '◆' },
  { href: '/dashboard/menu', label: 'Menu', icon: '▤' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-ink border-r border-white/5 min-h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-forest ring-1 ring-gold/50 flex items-center justify-center">
            <span className="font-display text-xs font-medium text-gold tracking-widest">3F</span>
          </div>
          <span className="text-ivory/40 text-[11px] tracking-[0.15em] uppercase">Espace pro</span>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active ? 'bg-white/5 text-ivory' : 'text-ivory/50 hover:text-ivory hover:bg-white/5'
              }`}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ivory/25 text-sm cursor-not-allowed">
          <span className="text-xs">◷</span>
          Commandes
          <span className="ml-auto text-[9px] uppercase tracking-wide border border-ivory/15 rounded-full px-2 py-0.5">Bientôt</span>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <p className="text-ivory/70 text-sm px-3 mb-1 truncate">{profile?.name}</p>
        <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-lg text-ivory/40 hover:text-ivory hover:bg-white/5 text-sm transition">
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
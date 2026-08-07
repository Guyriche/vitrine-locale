'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: "Vue d'ensemble" },
  { href: '/dashboard/menu', label: 'Menu' },
]

export default function DashboardMobileNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden sticky top-0 z-30 bg-ink/95 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-forest ring-1 ring-gold/50 flex items-center justify-center shrink-0">
          <span className="font-display text-[10px] font-medium text-gold tracking-widest">3F</span>
        </div>
        <div className="flex gap-4 overflow-x-auto text-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? 'text-ivory' : 'text-ivory/40'}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const HIDDEN_ON = ['/login', '/register']
const HERO_PAGES = ['/']

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (HIDDEN_ON.includes(pathname) || pathname.startsWith('/dashboard')) return null

  const isHeroPage = HERO_PAGES.includes(pathname)
  const transparent = isHeroPage && !scrolled

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        transparent ? 'bg-transparent' : 'bg-ivory/95 backdrop-blur-md border-b border-forest/10 shadow-sm'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ring-1 ring-gold/50 transition-colors ${transparent ? 'bg-white/10 backdrop-blur-md' : 'bg-forest'}`}>
            <span className="font-display text-xs font-medium text-gold tracking-widest">3F</span>
          </div>
        </Link>

        {loading ? null : !user ? (
          <div className={`flex items-center gap-7 text-[13px] tracking-wide transition-colors ${transparent ? 'text-white' : 'text-forest/70'}`}>
            <Link href="/login" className="hover:opacity-70 transition">Connexion</Link>
            <Link href="/register" className={`px-4 py-2 rounded-full transition ${transparent ? 'border border-white/50 hover:bg-white/10' : 'bg-forest text-ivory hover:bg-forest-dark'}`}>
              S&apos;inscrire
            </Link>
          </div>
        ) : profile?.role === 'client' ? (
          <div className={`hidden md:flex items-center gap-7 text-[13px] tracking-wide transition-colors ${transparent ? 'text-white' : 'text-forest/70'}`}>
            <Link href="/orders" className="hover:opacity-70 transition">Mes commandes</Link>
            <Link href="/profile" className="hover:opacity-70 transition">Profil</Link>
            <button onClick={signOut} className="opacity-70 hover:opacity-100 transition">Déconnexion</button>
          </div>
        ) : (
          <div className={`flex items-center gap-7 text-[13px] tracking-wide transition-colors ${transparent ? 'text-white' : 'text-forest/70'}`}>
            <Link href="/dashboard" className="hover:opacity-70 transition">Tableau de bord</Link>
            <span className="opacity-50">{profile?.name}</span>
            <button onClick={signOut} className="opacity-70 hover:opacity-100 transition">Déconnexion</button>
          </div>
        )}
      </div>
    </header>
  )
}
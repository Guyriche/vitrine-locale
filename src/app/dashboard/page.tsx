'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

type Business = {
  id: string
  name: string
  city: string | null
  is_open: boolean
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loadingBusiness, setLoadingBusiness] = useState(true)
  const [togglingOpen, setTogglingOpen] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from('Business')
        .select('id, name, city, is_open')
        .eq('owner_id', user.id)
        .maybeSingle()

      setBusiness(data)
      setLoadingBusiness(false)
    }
    if (user) load()
  }, [user])

  async function toggleOpen() {
    if (!business) return
    setTogglingOpen(true)

    const { error } = await supabase
      .from('Business')
      .update({ is_open: !business.is_open })
      .eq('id', business.id)

    if (!error) {
      setBusiness({ ...business, is_open: !business.is_open })
    }
    setTogglingOpen(false)
  }

  if (loading || loadingBusiness) {
    return <div className="p-10 text-ivory/40 text-sm">Chargement...</div>
  }

  if (!user || profile?.role !== 'owner') {
    return <div className="p-10 text-ivory/60 text-sm">Cette page est réservée aux propriétaires de commerce.</div>
  }

  if (!business) {
    return (
      <div className="p-10 max-w-md">
        <p className="text-ivory/60 mb-6">Vous n&apos;avez pas encore de commerce.</p>
        <Link href="/business/new" className="inline-block bg-leaf text-white rounded-lg px-5 py-3 text-sm font-medium hover:brightness-110 transition">
          Créer mon commerce
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <p className="text-[11px] tracking-[0.25em] text-gold/80 uppercase mb-3">Tableau de bord</p>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-ivory">{business.name}</h1>
          {business.city && <p className="text-sm text-ivory/40 mt-1">{business.city}</p>}
        </div>

        <button
          onClick={toggleOpen}
          disabled={togglingOpen}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition disabled:opacity-50 ${
            business.is_open
              ? 'bg-leaf/15 text-leaf border border-leaf/30 hover:bg-leaf/25'
              : 'bg-white/5 text-ivory/50 border border-white/10 hover:bg-white/10'
          }`}
        >
          {business.is_open ? '🟢 Ouvert — fermer le service' : '⚫ Fermé — ouvrir le service'}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Link href="/dashboard/menu" className="bg-panel rounded-2xl border border-white/5 p-6 hover:border-white/15 transition block">
          <h2 className="font-display text-lg text-ivory mb-1">Gérer le menu</h2>
          <p className="text-sm text-ivory/40">Catégories, produits, prix, disponibilité</p>
        </Link>

        <div className="bg-panel rounded-2xl border border-white/5 p-6 opacity-40 cursor-not-allowed">
          <h2 className="font-display text-lg text-ivory mb-1">Commandes</h2>
          <p className="text-sm text-ivory/40">Bientôt disponible</p>
        </div>
      </div>
    </div>
  )
}
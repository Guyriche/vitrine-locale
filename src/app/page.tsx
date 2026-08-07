'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Business = {
  id: string
  name: string
  description: string | null
  city: string | null
  is_open: boolean
}

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('Business')
        .select('id, name, description, city, is_open')
        .eq('is_active', true)

      setBusinesses(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero — même identité photo que login/register */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-end overflow-hidden">
        <Image src="/images/hero-register4.jpg" alt="Campagne du Territoire des Trois Frontières" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/90 via-forest-dark/25 to-forest-dark/50" />

        <div className="relative max-w-6xl mx-auto px-6 md:px-8 pb-14 md:pb-20 w-full">
          <p className="text-[11px] tracking-[0.25em] text-gold/90 uppercase mb-4">Territoire des Trois Frontières</p>
          <h1 className="font-display text-3xl md:text-5xl leading-tight text-ivory max-w-xl">
            Vos commerces locaux, à portée de main.
          </h1>
          <p className="mt-4 text-ivory/75 max-w-md">
            Découvrez, commandez et soutenez les commerçants de Plombières, Kelmis, Lontzen et Welkenraedt.
          </p>
        </div>
      </section>

      {/* Liste des commerces */}
      <section className="bg-ivory">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <h2 className="font-display text-2xl text-forest mb-8">Commerces disponibles</h2>

          {loading ? (
            <p className="text-forest/50 text-sm">Chargement...</p>
          ) : businesses.length === 0 ? (
            <div className="border border-forest/10 rounded-2xl p-10 text-center bg-white">
              <p className="text-forest/70">Aucun commerce n&apos;est encore disponible.</p>
              <p className="text-forest/40 text-sm mt-1">Le premier partenaire arrive bientôt.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((b) => (
                <Link key={b.id} href={`/business/${b.id}`} className="bg-white rounded-2xl overflow-hidden border border-forest/10 shadow-sm hover:shadow-md transition block">
                  <div className="h-36 bg-sand flex items-center justify-center">
                    <span className="font-display text-forest/30 text-sm">Photo à venir</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display text-lg text-forest">{b.name}</h3>
                      <span className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full ${b.is_open ? 'bg-leaf/10 text-leaf' : 'bg-forest/10 text-forest/50'}`}>
                        {b.is_open ? 'Ouvert' : 'Fermé'}
                      </span>
                    </div>
                    {b.city && <p className="text-xs text-forest/50 mb-2">{b.city}</p>}
                    {b.description && <p className="text-sm text-forest/60 line-clamp-2">{b.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
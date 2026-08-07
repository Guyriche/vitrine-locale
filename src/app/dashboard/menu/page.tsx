'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

type Category = {
  id: string
  name: string
  display_order: number
}

export default function MenuPage() {
  const { user, loading } = useAuth()
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) return

      const { data: business } = await supabase
        .from('Business')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (!business) {
        setReady(true)
        return
      }

      setBusinessId(business.id)

      const { data: cats } = await supabase
        .from('Category')
        .select('id, name, display_order')
        .eq('business_id', business.id)
        .order('display_order', { ascending: true })

      setCategories(cats ?? [])
      setReady(true)
    }
    if (user) load()
  }, [user])

  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!businessId || !newName.trim()) return
    setSaving(true)

    const { data, error } = await supabase
      .from('Category')
      .insert({ business_id: businessId, name: newName.trim(), display_order: categories.length })
      .select('id, name, display_order')
      .single()

    setSaving(false)

    if (!error && data) {
      setCategories([...categories, data])
      setNewName('')
    }
  }

  if (loading || !ready) {
    return <div className="p-10 text-ivory/40 text-sm">Chargement...</div>
  }

  if (!businessId) {
    return (
      <div className="p-10 max-w-md">
        <p className="text-ivory/60 mb-6">Créez d&apos;abord votre commerce avant de gérer un menu.</p>
        <Link href="/business/new" className="inline-block bg-leaf text-white rounded-lg px-5 py-3 text-sm font-medium hover:brightness-110 transition">
          Créer mon commerce
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <p className="text-[11px] tracking-[0.25em] text-gold/80 uppercase mb-3">Menu</p>
      <h1 className="font-display text-3xl text-ivory mb-8">Catégories</h1>

      <form onSubmit={addCategory} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Ex. Pizzas, Boissons, Desserts..."
          className="flex-1 bg-panel border border-white/10 rounded-lg px-4 py-2.5 text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-gold/50 transition"
        />
        <button
          type="submit"
          disabled={saving || !newName.trim()}
          className="bg-leaf text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:brightness-110 transition disabled:opacity-40"
        >
          Ajouter
        </button>
      </form>

      {categories.length === 0 ? (
        <p className="text-ivory/40 text-sm">Aucune catégorie pour l&apos;instant. Créez-en une ci-dessus.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/menu/${cat.id}`}
              className="flex items-center justify-between bg-panel border border-white/5 rounded-xl px-5 py-4 hover:border-white/15 transition"
            >
              <span className="text-ivory">{cat.name}</span>
              <span className="text-ivory/30 text-sm">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function NewBusinessPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const inputClass = "w-full bg-transparent border-0 border-b border-forest/20 px-0 py-2 text-forest placeholder:text-forest/30 focus:outline-none focus:border-gold transition"
  const labelClass = "block text-[11px] tracking-[0.12em] uppercase text-forest/45 mb-1.5"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSaving(true)

    const { error } = await supabase.from('Business').insert({
      owner_id: user.id,
      name,
      description: description || null,
      phone: phone || null,
      street: street || null,
      house_number: houseNumber || null,
      postal_code: postalCode || null,
      city: city || null,
      is_active: true,
      is_open: false,
    })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen bg-ivory pt-32 text-center text-forest/50">Chargement...</div>
  }

  if (!user || profile?.role !== 'owner') {
    return (
      <div className="min-h-screen bg-ivory pt-32 max-w-md mx-auto text-center px-6">
        <p className="text-forest/70">Cette page est réservée aux propriétaires de commerce.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <p className="text-[11px] tracking-[0.25em] text-gold/90 uppercase mb-3">Nouveau commerce</p>
        <h1 className="font-display text-3xl md:text-4xl text-forest mb-2">Créer votre commerce</h1>
        <p className="text-sm text-forest/55 mb-10">
          Ces informations seront visibles par vos clients sur la plateforme.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-forest/10 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label htmlFor="name" className={labelClass}>Nom du commerce</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Ex. Friterie du Village" />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} placeholder="Quelques mots sur votre commerce..." />
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>Téléphone</label>
              <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="081 12 34 56" />
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div className="col-span-2">
                <label htmlFor="street" className={labelClass}>Rue</label>
                <input id="street" type="text" value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass} placeholder="Rue de la Gare" />
              </div>
              <div>
                <label htmlFor="houseNumber" className={labelClass}>N°</label>
                <input id="houseNumber" type="text" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} className={inputClass} placeholder="12" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div>
                <label htmlFor="postalCode" className={labelClass}>Code postal</label>
                <input id="postalCode" type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} placeholder="4850" />
              </div>
              <div className="col-span-2">
                <label htmlFor="city" className={labelClass}>Commune</label>
                <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Plombières" />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={saving} className="mt-2 bg-leaf text-white rounded-lg px-4 py-3 text-sm font-medium hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Création...' : 'Créer mon commerce'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
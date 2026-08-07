'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { supabase } from '@/lib/supabase'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { businessId, businessName, items, total, clearCart } = useCart()

  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')
  const [street, setStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/checkout')
    }
  }, [loading, user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !businessId) return
    setError('')

    if (orderType === 'delivery' && (!street.trim() || !postalCode.trim() || !city.trim())) {
      setError('Merci de compléter votre adresse de livraison.')
      return
    }

    setSubmitting(true)

    const { data: order, error: orderError } = await supabase
      .from('Order')
      .insert({
        business_id: businessId,
        user_id: user.id,
        status: 'pending',
        order_type: orderType,
        delivery_street: orderType === 'delivery' ? street.trim() : null,
        delivery_house_number: orderType === 'delivery' ? houseNumber.trim() : null,
        delivery_postal_code: orderType === 'delivery' ? postalCode.trim() : null,
        delivery_city: orderType === 'delivery' ? city.trim() : null,
        delivery_notes: notes.trim() || null,
        total,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      setSubmitting(false)
      setError(orderError?.message ?? 'Une erreur est survenue.')
      return
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.price,
    }))

    const { error: itemsError } = await supabase.from('OrderItem').insert(orderItems)

    setSubmitting(false)

    if (itemsError) {
      setError(itemsError.message)
      return
    }

    setConfirmedOrderId(order.id)
    clearCart()
  }

  if (loading || (!user && !confirmedOrderId)) {
    return <div className="min-h-screen bg-ivory pt-32 text-center text-forest/50">Chargement...</div>
  }

  if (confirmedOrderId) {
    return (
      <div className="min-h-screen bg-ivory pt-32 max-w-md mx-auto text-center px-6">
        <p className="text-[11px] tracking-[0.25em] text-gold/80 uppercase mb-3">Commande confirmée</p>
        <h1 className="font-display text-2xl text-forest mb-3">Merci pour votre commande !</h1>
        <p className="text-forest/60 mb-8">
          Référence : <span className="text-forest">{confirmedOrderId.slice(0, 8).toUpperCase()}</span>
        </p>
        <Link href="/" className="inline-block bg-leaf text-white rounded-lg px-5 py-3 text-sm font-medium hover:brightness-110 transition">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory pt-32 max-w-md mx-auto text-center px-6">
        <p className="text-forest/60 mb-6">Votre panier est vide.</p>
        <Link href="/" className="inline-block bg-leaf text-white rounded-lg px-5 py-3 text-sm font-medium hover:brightness-110 transition">
          Voir les commerces
        </Link>
      </div>
    )
  }

  const inputClass = "w-full bg-transparent border-0 border-b border-forest/20 px-0 py-2 text-forest placeholder:text-forest/30 focus:outline-none focus:border-gold transition"
  const labelClass = "block text-[11px] tracking-[0.12em] uppercase text-forest/45 mb-1.5"

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-lg mx-auto px-6 pt-24 pb-20">
        <p className="text-[11px] tracking-[0.25em] text-gold/80 uppercase mb-3">Finaliser</p>
        <h1 className="font-display text-3xl text-forest mb-1">Votre commande</h1>
        <p className="text-sm text-forest/55 mb-8">{businessName}</p>

        <div className="bg-white rounded-2xl border border-forest/10 p-6 mb-6">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between py-2 text-sm">
              <span className="text-forest/70">{item.quantity} × {item.name}</span>
              <span className="text-forest">{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-forest/10">
            <span className="text-forest font-medium">Total</span>
            <span className="font-display text-lg text-forest">{total.toFixed(2)} €</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-forest/10 p-6 flex flex-col gap-5">
          <div>
            <label className={labelClass}>Mode de récupération</label>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`flex-1 rounded-lg py-2.5 text-sm transition ${orderType === 'delivery' ? 'bg-forest text-ivory' : 'bg-sand/50 text-forest/60'}`}
              >
                Livraison
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`flex-1 rounded-lg py-2.5 text-sm transition ${orderType === 'pickup' ? 'bg-forest text-ivory' : 'bg-sand/50 text-forest/60'}`}
              >
                À emporter
              </button>
            </div>
          </div>

          {orderType === 'delivery' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label htmlFor="street" className={labelClass}>Rue</label>
                  <input id="street" type="text" value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass} placeholder="Rue de la Gare" />
                </div>
                <div>
                  <label htmlFor="houseNumber" className={labelClass}>N°</label>
                  <input id="houseNumber" type="text" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} className={inputClass} placeholder="12" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="postalCode" className={labelClass}>Code postal</label>
                  <input id="postalCode" type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} placeholder="4850" />
                </div>
                <div className="col-span-2">
                  <label htmlFor="city" className={labelClass}>Commune</label>
                  <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Plombières" />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="notes" className={labelClass}>Remarque (optionnel)</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} placeholder="Sonnette cassée, frapper fort..." />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={submitting} className="mt-2 bg-leaf text-white rounded-lg px-4 py-3 text-sm font-medium hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Validation...' : `Commander · ${total.toFixed(2)} €`}
          </button>
        </form>
      </div>
    </div>
  )
}
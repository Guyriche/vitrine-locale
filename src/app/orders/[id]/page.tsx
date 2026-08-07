'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type OrderItemRow = {
  id: string
  quantity: number
  unit_price: number
  product: { name: string } | null
}

type OrderDetail = {
  id: string
  status: string
  order_type: string
  delivery_street: string | null
  delivery_house_number: string | null
  delivery_postal_code: string | null
  delivery_city: string | null
  delivery_notes: string | null
  total: number
  created_at: string
  business: { name: string; phone: string | null } | null
}

const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'ready', 'on_delivery', 'completed']
const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente de confirmation',
  accepted: 'Acceptée par le commerçant',
  preparing: 'En préparation',
  ready: 'Prête',
  on_delivery: 'En livraison',
  completed: 'Terminée',
  cancelled: 'Annulée',
  refused: 'Refusée',
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [items, setItems] = useState<OrderItemRow[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: orderData } = await supabase
        .from('Order')
        .select('id, status, order_type, delivery_street, delivery_house_number, delivery_postal_code, delivery_city, delivery_notes, total, created_at, business:Business(name, phone)')
        .eq('id', params.id)
        .single()

      setOrder(orderData as unknown as OrderDetail)

      const { data: itemsData } = await supabase
        .from('OrderItem')
        .select('id, quantity, unit_price, product:Product(name)')
        .eq('order_id', params.id)

      setItems((itemsData as unknown as OrderItemRow[]) ?? [])
      setReady(true)
    }
    load()

    // Rafraîchit automatiquement si le statut change (mis à jour par le restaurateur)
    const channel = supabase
      .channel(`order-${params.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Order', filter: `id=eq.${params.id}` }, (payload) => {
        setOrder((prev) => (prev ? { ...prev, status: payload.new.status } : prev))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id])

  if (!ready) {
    return <div className="min-h-screen bg-ivory pt-28 text-center text-forest/50">Chargement...</div>
  }

  if (!order) {
    return <div className="min-h-screen bg-ivory pt-28 text-center text-forest/50">Commande introuvable.</div>
  }

  const isCancelled = order.status === 'cancelled' || order.status === 'refused'
  const currentStepIndex = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-lg mx-auto px-6 pt-24 pb-16">
        <p className="text-[11px] tracking-[0.25em] text-gold/80 uppercase mb-3">Commande {order.id.slice(0, 8).toUpperCase()}</p>
        <h1 className="font-display text-3xl text-forest mb-1">{order.business?.name}</h1>
        <p className="text-sm text-forest/50 mb-8">
          {new Date(order.created_at).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
        </p>

        {/* Timeline de statut */}
        <div className="bg-white rounded-2xl border border-forest/10 p-6 mb-6">
          {isCancelled ? (
            <p className="text-red-600 font-medium">{STATUS_LABELS[order.status]}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStepIndex
                const isCurrent = i === currentStepIndex
                if (order.order_type === 'pickup' && step === 'on_delivery') return null
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${done ? 'bg-leaf' : 'bg-forest/15'}`} />
                    <span className={`text-sm ${isCurrent ? 'text-forest font-medium' : done ? 'text-forest/60' : 'text-forest/30'}`}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Détail produits */}
        <div className="bg-white rounded-2xl border border-forest/10 p-6 mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-forest/70">{item.quantity} × {item.product?.name}</span>
              <span className="text-forest">{(item.unit_price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-forest/10">
            <span className="text-forest font-medium">Total</span>
            <span className="font-display text-lg text-forest">{order.total.toFixed(2)} €</span>
          </div>
        </div>

        {/* Adresse si livraison */}
        {order.order_type === 'delivery' && order.delivery_street && (
          <div className="bg-white rounded-2xl border border-forest/10 p-6">
            <p className="text-[11px] tracking-[0.12em] uppercase text-forest/45 mb-2">Livraison</p>
            <p className="text-forest text-sm">
              {order.delivery_street} {order.delivery_house_number}, {order.delivery_postal_code} {order.delivery_city}
            </p>
            {order.delivery_notes && <p className="text-forest/50 text-sm mt-1">{order.delivery_notes}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

type OrderItemRow = {
  quantity: number
  product: { name: string } | null
}

type OrderRow = {
  id: string
  status: string
  order_type: string
  total: number
  created_at: string
  delivery_street: string | null
  delivery_house_number: string | null
  delivery_city: string | null
  delivery_notes: string | null
  items: OrderItemRow[]
}

const COLUMNS = [
  { status: 'pending', label: 'Nouvelles', accent: 'text-gold' },
  { status: 'accepted', label: 'Acceptées', accent: 'text-ivory/70' },
  { status: 'preparing', label: 'En préparation', accent: 'text-ivory/70' },
  { status: 'ready', label: 'Prêtes', accent: 'text-leaf' },
]

const NEXT_STATUS: Record<string, string> = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'on_delivery',
}

const NEXT_LABEL: Record<string, string> = {
  pending: 'Accepter',
  accepted: 'Démarrer préparation',
  preparing: 'Marquer prête',
  ready: 'Envoyer en livraison',
}

export default function DashboardOrdersPage() {
  const { user } = useAuth()
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [ready, setReady] = useState(false)

  const loadOrders = useCallback(async (bizId: string) => {
    const { data } = await supabase
      .from('Order')
      .select('id, status, order_type, total, created_at, delivery_street, delivery_house_number, delivery_city, delivery_notes, items:OrderItem(quantity, product:Product(name))')
      .eq('business_id', bizId)
      .in('status', ['pending', 'accepted', 'preparing', 'ready'])
      .order('created_at', { ascending: true })

    setOrders((data as unknown as OrderRow[]) ?? [])
    setReady(true)
  }, [])

    useEffect(() => {
    if (!user) return

    let channel: ReturnType<typeof supabase.channel> | null = null

    async function init() {
        const { data: business } = await supabase
        .from('Business')
        .select('id')
        .eq('owner_id', user!.id)
        .maybeSingle()

        if (!business) {
        setReady(true)
        return
        }

        setBusinessId(business.id)
        loadOrders(business.id)

        channel = supabase
        .channel(`orders-${business.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Order', filter: `business_id=eq.${business.id}` }, () => {
            loadOrders(business.id)
        })
        .subscribe()
    }

    init()

    return () => {
        if (channel) supabase.removeChannel(channel)
    }
    }, [user, loadOrders])

  async function advanceStatus(orderId: string, currentStatus: string) {
    const next = NEXT_STATUS[currentStatus]
    if (!next) return

    await supabase.rpc('update_order_status', { order_id: orderId, new_status: next })
    if (businessId) loadOrders(businessId)
  }

  async function refuseOrder(orderId: string) {
    await supabase.rpc('update_order_status', { order_id: orderId, new_status: 'refused' })
    if (businessId) loadOrders(businessId)
  }

  if (!ready) {
    return <div className="p-10 text-ivory/40 text-sm">Chargement...</div>
  }

  if (!businessId) {
    return <div className="p-10 text-ivory/60 text-sm">Créez d&apos;abord votre commerce.</div>
  }

  return (
    <div className="p-6 md:p-10">
      <p className="text-[11px] tracking-[0.25em] text-gold/80 uppercase mb-3">Commandes</p>
      <h1 className="font-display text-3xl text-ivory mb-8">En cours</h1>

      <div className="grid md:grid-cols-4 gap-5">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status)
          return (
            <div key={col.status} className="min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-sm font-medium ${col.accent}`}>{col.label}</h2>
                <span className="text-ivory/30 text-xs">{colOrders.length}</span>
              </div>

              <div className="flex flex-col gap-3">
                {colOrders.length === 0 && (
                  <p className="text-ivory/20 text-xs">Aucune commande</p>
                )}

                {colOrders.map((order) => (
                  <div key={order.id} className="bg-panel border border-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-ivory text-xs font-medium">#{order.id.slice(0, 6).toUpperCase()}</span>
                      <span className="text-ivory/30 text-[10px]">
                        {new Date(order.created_at).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 mb-2">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-ivory/70 text-xs">{item.quantity} × {item.product?.name}</p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${order.order_type === 'delivery' ? 'bg-leaf/15 text-leaf' : 'bg-gold/15 text-gold'}`}>
                        {order.order_type === 'delivery' ? 'Livraison' : 'À emporter'}
                      </span>
                      <span className="text-ivory/60 text-xs">{order.total.toFixed(2)} €</span>
                    </div>

                    {order.order_type === 'delivery' && order.delivery_street && (
                      <p className="text-ivory/40 text-[11px] mb-3 leading-snug">
                        {order.delivery_street} {order.delivery_house_number}, {order.delivery_city}
                      </p>
                    )}
                    {order.delivery_notes && (
                      <p className="text-gold/70 text-[11px] mb-3 italic">&quot;{order.delivery_notes}&quot;</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => advanceStatus(order.id, order.status)}
                        className="flex-1 bg-leaf text-white rounded-lg py-2 text-xs font-medium hover:brightness-110 transition"
                      >
                        {NEXT_LABEL[order.status]}
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => refuseOrder(order.id)}
                          className="px-3 rounded-lg text-xs text-ivory/40 border border-white/10 hover:text-ivory hover:border-white/30 transition"
                        >
                          Refuser
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
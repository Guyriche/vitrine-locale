'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

type OrderRow = {
  id: string
  status: string
  order_type: string
  total: number
  created_at: string
  business: { name: string } | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-forest/10 text-forest/60' },
  accepted: { label: 'Acceptée', color: 'bg-gold/15 text-gold' },
  preparing: { label: 'En préparation', color: 'bg-gold/15 text-gold' },
  ready: { label: 'Prête', color: 'bg-leaf/15 text-leaf' },
  on_delivery: { label: 'En livraison', color: 'bg-leaf/15 text-leaf' },
  completed: { label: 'Terminée', color: 'bg-forest/10 text-forest/40' },
  cancelled: { label: 'Annulée', color: 'bg-red-50 text-red-600' },
  refused: { label: 'Refusée', color: 'bg-red-50 text-red-600' },
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from('Order')
        .select('id, status, order_type, total, created_at, business:Business(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setOrders((data as unknown as OrderRow[]) ?? [])
      setReady(true)
    }
    if (user) load()
  }, [user])

  if (loading || !ready) {
    return <div className="min-h-screen bg-ivory pt-28 text-center text-forest/50">Chargement...</div>
  }

  if (!user) {
    return <div className="min-h-screen bg-ivory pt-28 text-center text-forest/50">Connectez-vous pour voir vos commandes.</div>
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-16">
        <p className="text-[11px] tracking-[0.25em] text-gold/80 uppercase mb-3">Historique</p>
        <h1 className="font-display text-3xl text-forest mb-8">Mes commandes</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-forest/10 p-10 text-center">
            <p className="text-forest/60">Vous n&apos;avez pas encore passé de commande.</p>
            <Link href="/" className="inline-block mt-4 text-leaf text-sm underline underline-offset-2">Voir les commerces</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-forest/10 text-forest/50' }
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-forest/10 px-5 py-4 hover:border-forest/20 transition"
                >
                  <div>
                    <p className="text-forest">{order.business?.name ?? 'Commerce'}</p>
                    <p className="text-forest/40 text-xs mt-1">
                      {new Date(order.created_at).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-forest text-sm mb-1.5">{order.total.toFixed(2)} €</p>
                    <span className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full ${status.color}`}>{status.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
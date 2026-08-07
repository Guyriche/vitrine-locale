'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

export default function CartPanel() {
  const { items, businessName, updateQuantity, total } = useCart()
  const router = useRouter()

  if (items.length === 0) return null

  return (
    <aside className="hidden md:flex flex-col fixed top-16 right-0 bottom-0 w-96 bg-white border-l border-forest/10 z-30">
      <div className="p-6 border-b border-forest/10">
        <p className="text-[11px] tracking-[0.2em] text-gold/80 uppercase mb-1">Votre commande</p>
        <h2 className="font-display text-xl text-forest">{businessName}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {items.map((item) => (
          <div key={item.productId} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-forest text-sm">{item.name}</p>
              <p className="text-forest/40 text-xs mt-0.5">{item.price.toFixed(2)} € l&apos;unité</p>
            </div>
            <div className="flex items-center gap-2 bg-sand/50 rounded-full px-1 py-1 shrink-0">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 rounded-full bg-white text-forest text-xs flex items-center justify-center hover:bg-forest hover:text-ivory transition">−</button>
              <span className="text-forest text-xs w-3 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 rounded-full bg-white text-forest text-xs flex items-center justify-center hover:bg-forest hover:text-ivory transition">+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-forest/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-forest/60 text-sm">Total</span>
          <span className="font-display text-xl text-forest">{total.toFixed(2)} €</span>
        </div>
        <button onClick={() => router.push('/checkout')} className="w-full bg-leaf text-white rounded-lg py-3 text-sm font-medium hover:brightness-110 transition">
          Commander
        </button>
      </div>
    </aside>
  )
}
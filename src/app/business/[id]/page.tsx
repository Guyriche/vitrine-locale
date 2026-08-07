'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import CartPanel from '@/components/CartPanel'

type BusinessInfo = {
  id: string
  name: string
  description: string | null
  city: string | null
  is_open: boolean
}

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  is_available: boolean
}

type CategoryWithProducts = {
  id: string
  name: string
  products: Product[]
}

export default function BusinessPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { items, addItem, updateQuantity, total } = useCart()

  const [business, setBusiness] = useState<BusinessInfo | null>(null)
  const [categories, setCategories] = useState<CategoryWithProducts[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: biz } = await supabase
        .from('Business')
        .select('id, name, description, city, is_open')
        .eq('id', params.id)
        .single()

      setBusiness(biz)

      const { data: cats } = await supabase
        .from('Category')
        .select('id, name')
        .eq('business_id', params.id)
        .order('display_order', { ascending: true })

      if (cats && cats.length > 0) {
        const catIds = cats.map((c) => c.id)
        const { data: prods } = await supabase
          .from('Product')
          .select('id, category_id, name, description, price, is_available')
          .in('category_id', catIds)

        const grouped = cats.map((cat) => ({
          ...cat,
          products: (prods ?? []).filter((p) => p.category_id === cat.id),
        }))

        setCategories(grouped)
      }

      setReady(true)
    }
    load()
  }, [params.id])

  function quantityOf(productId: string) {
    return items.find((i) => i.productId === productId)?.quantity ?? 0
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  if (!ready) {
    return <div className="min-h-screen bg-ivory pt-28 text-center text-forest/50">Chargement...</div>
  }

  if (!business) {
    return <div className="min-h-screen bg-ivory pt-28 text-center text-forest/50">Ce commerce n&apos;existe pas.</div>
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero */}
      <section className="relative h-[38vh] md:h-[44vh] flex items-end overflow-hidden">
        <Image src="/images/hero-register2.jpg" alt={business.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/95 via-forest-dark/35 to-forest-dark/40" />

        <div className="relative max-w-3xl mx-auto px-6 w-full pb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full ${business.is_open ? 'bg-leaf/90 text-white' : 'bg-white/15 text-ivory/70 backdrop-blur-sm'}`}>
              {business.is_open ? '● Ouvert' : 'Fermé'}
            </span>
            {business.city && <span className="text-ivory/60 text-xs tracking-wide uppercase">{business.city}</span>}
          </div>
          <h1 className="font-display text-3xl md:text-5xl text-ivory leading-tight">{business.name}</h1>
        </div>
      </section>

      <div className={`max-w-3xl mx-auto px-6 ${itemCount > 0 ? 'md:mr-96 md:max-w-none md:ml-auto' : ''}`}>
        {business.description && (
          <p className="text-forest/60 pt-6 pb-2 max-w-xl">{business.description}</p>
        )}

        {/* Navigation rapide entre catégories */}
        {categories.length > 1 && (
          <div className="sticky top-16 z-20 bg-ivory/95 backdrop-blur-md -mx-6 px-6 py-3 flex gap-2 overflow-x-auto border-b border-forest/5 mb-4">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="shrink-0 text-xs tracking-wide uppercase text-forest/50 hover:text-forest border border-forest/15 rounded-full px-4 py-1.5 transition"
                >
                    {cat.name}
                </button>
                ))
            }
          </div>
        )}

        <div className="pb-32 pt-4">
          {categories.length === 0 ? (
            <p className="text-forest/40 text-sm">Le menu n&apos;est pas encore disponible.</p>
          ) : (
            <div className="flex flex-col gap-12">
              {categories.map((cat) => (
                <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-32">
                  <h2 className="font-display text-2xl text-forest mb-5">{cat.name}</h2>
                  <div className="flex flex-col gap-4">
                    {cat.products.filter((p) => p.is_available).map((product) => {
                      const qty = quantityOf(product.id)
                      return (
                        <div key={product.id} className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-forest/10 px-5 py-5 hover:border-forest/20 transition">
                          <div className="min-w-0">
                            <p className="font-display text-lg text-forest">{product.name}</p>
                            {product.description && (
                              <p className="text-forest/45 text-sm mt-1 line-clamp-2">{product.description}</p>
                            )}
                            <p className="text-gold font-medium text-sm mt-2">{product.price.toFixed(2)} €</p>
                          </div>

                          <div className="shrink-0">
                            {qty === 0 ? (
                              <button
                                onClick={() => addItem(business.id, business.name, product)}
                                disabled={!business.is_open}
                                className="bg-forest text-ivory rounded-full w-10 h-10 flex items-center justify-center text-lg hover:bg-forest-dark transition disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            ) : (
                              <div className="flex items-center gap-3 bg-sand/50 rounded-full px-1 py-1">
                                <button
                                  onClick={() => updateQuantity(product.id, qty - 1)}
                                  className="w-8 h-8 rounded-full bg-white text-forest flex items-center justify-center hover:bg-forest hover:text-ivory transition"
                                >
                                  −
                                </button>
                                <span className="text-forest text-sm w-4 text-center">{qty}</span>
                                <button
                                  onClick={() => addItem(business.id, business.name, product)}
                                  className="w-8 h-8 rounded-full bg-white text-forest flex items-center justify-center hover:bg-forest hover:text-ivory transition"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {itemCount > 0 && (
        <div className="md:hidden fixed bottom-16 md:bottom-0 left-0 right-0 z-30 p-4 md:p-6">
          <button
            onClick={() => router.push('/checkout')}
            className="max-w-3xl mx-auto flex items-center justify-between bg-forest text-ivory rounded-2xl px-6 py-4 shadow-2xl shadow-forest/30 w-full hover:bg-forest-dark transition"
          >
            <span className="flex items-center gap-2 text-sm">
              <span className="bg-gold text-forest-dark rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-medium">{itemCount}</span>
              Voir le panier
            </span>
            <span className="font-display text-lg">{total.toFixed(2)} €</span>
          </button>
        </div>
      )}
      <CartPanel />
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  is_available: boolean
}

export default function CategoryProductsPage() {
  const params = useParams<{ categoryId: string }>()
  const router = useRouter()

  const [categoryName, setCategoryName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [ready, setReady] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: cat } = await supabase
        .from('Category')
        .select('name')
        .eq('id', params.categoryId)
        .single()

      setCategoryName(cat?.name ?? '')

      const { data: prods } = await supabase
        .from('Product')
        .select('id, name, description, price, is_available')
        .eq('category_id', params.categoryId)

      setProducts(prods ?? [])
      setReady(true)
    }
    load()
  }, [params.categoryId])

  async function addProduct(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const priceValue = parseFloat(price.replace(',', '.'))

    if (!name.trim() || isNaN(priceValue) || priceValue <= 0) {
      setError('Nom et prix (supérieur à 0) sont obligatoires.')
      return
    }

    setSaving(true)
    const { data, error: insertError } = await supabase
      .from('Product')
      .insert({
        category_id: params.categoryId,
        name: name.trim(),
        description: description.trim() || null,
        price: priceValue,
        is_available: true,
      })
      .select('id, name, description, price, is_available')
      .single()

    setSaving(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    if (data) {
      setProducts([...products, data])
      setName('')
      setDescription('')
      setPrice('')
    }
  }

  async function toggleAvailable(product: Product) {
    const { error } = await supabase
      .from('Product')
      .update({ is_available: !product.is_available })
      .eq('id', product.id)

    if (!error) {
      setProducts(products.map((p) => (p.id === product.id ? { ...p, is_available: !p.is_available } : p)))
    }
  }

  if (!ready) {
    return <div className="p-10 text-ivory/40 text-sm">Chargement...</div>
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <button onClick={() => router.push('/dashboard/menu')} className="text-ivory/40 hover:text-ivory text-sm mb-4 transition">
        ← Catégories
      </button>

      <p className="text-[11px] tracking-[0.25em] text-gold/80 uppercase mb-3">Produits</p>
      <h1 className="font-display text-3xl text-ivory mb-8">{categoryName}</h1>

      <form onSubmit={addProduct} className="bg-panel border border-white/5 rounded-2xl p-6 mb-8 flex flex-col gap-4">
        <div className="grid sm:grid-cols-[1fr_120px] gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du produit"
            className="bg-transparent border-0 border-b border-white/15 px-0 py-2 text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-gold transition"
          />
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Prix (€)"
            className="bg-transparent border-0 border-b border-white/15 px-0 py-2 text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-gold transition"
          />
        </div>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="bg-transparent border-0 border-b border-white/15 px-0 py-2 text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-gold transition"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="self-start bg-leaf text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:brightness-110 transition disabled:opacity-40"
        >
          {saving ? 'Ajout...' : 'Ajouter le produit'}
        </button>
      </form>

      {products.length === 0 ? (
        <p className="text-ivory/40 text-sm">Aucun produit dans cette catégorie.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-panel border border-white/5 rounded-xl px-5 py-4">
              <div>
                <p className="text-ivory">{p.name}</p>
                {p.description && <p className="text-ivory/40 text-sm mt-0.5">{p.description}</p>}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-ivory/70 text-sm">{p.price.toFixed(2)} €</span>
                <button
                  onClick={() => toggleAvailable(p)}
                  className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full transition ${
                    p.is_available ? 'bg-leaf/15 text-leaf' : 'bg-white/5 text-ivory/30'
                  }`}
                >
                  {p.is_available ? 'Disponible' : 'Masqué'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
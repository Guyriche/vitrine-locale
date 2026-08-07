'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

type CartContextType = {
  businessId: string | null
  businessName: string | null
  items: CartItem[]
  addItem: (businessId: string, businessName: string, product: { id: string; name: string; price: number }) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType>({
  businessId: null,
  businessName: null,
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  total: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Charge le panier sauvegardé au premier affichage
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      const parsed = JSON.parse(saved)
      setBusinessId(parsed.businessId)
      setBusinessName(parsed.businessName)
      setItems(parsed.items)
    }
    setLoaded(true)
  }, [])

  // Sauvegarde à chaque changement (une fois le chargement initial fait)
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem('cart', JSON.stringify({ businessId, businessName, items }))
  }, [businessId, businessName, items, loaded])

  function addItem(newBusinessId: string, newBusinessName: string, product: { id: string; name: string; price: number }) {
    if (businessId && businessId !== newBusinessId) {
      const confirmed = window.confirm(
        'Votre panier contient des produits d\'un autre commerce. Le vider pour ajouter celui-ci ?'
      )
      if (!confirmed) return
      setItems([{ productId: product.id, name: product.name, price: product.price, quantity: 1 }])
      setBusinessId(newBusinessId)
      setBusinessName(newBusinessName)
      return
    }

    setBusinessId(newBusinessId)
    setBusinessName(newBusinessName)

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)))
  }

  function removeItem(productId: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId)
      if (next.length === 0) {
        setBusinessId(null)
        setBusinessName(null)
      }
      return next
    })
  }

  function clearCart() {
    setItems([])
    setBusinessId(null)
    setBusinessName(null)
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ businessId, businessName, items, addItem, updateQuantity, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/login')
  }

  const inputClass = "w-full bg-transparent border-0 border-b border-forest/20 px-0 py-2 text-forest placeholder:text-forest/30 focus:outline-none focus:border-gold transition"
  const labelClass = "block text-[11px] tracking-[0.12em] uppercase text-forest/45 mb-1.5"

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-10 overflow-hidden bg-forest-dark">

      {/* Fond plein écran */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-none scale-105"
        style={{ backgroundImage: "url('/images/hero-register3.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-forest-dark/75 via-forest/45 to-forest-dark/80" />

      {/* Carte, agrandie */}
      <div className="relative w-full max-w-3xl grid md:grid-cols-[1fr_1.1fr] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 bg-white">

        {/* Photo nette, panneau gauche — traitement colorimétrique très léger */}
        <div className="relative hidden md:block min-h-[540px]">
          <Image src="/images/hero-register2.jpg" alt="Campagne du Territoire des Trois Frontières" fill priority sizes="(max-width: 768px) 0px, 50vw" className="object-cover" />
          <div className="absolute inset-0 bg-forest mix-blend-color opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/50 via-transparent to-forest-dark/90" />

          <div className="absolute top-7 left-7">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-gold/40 shadow-lg shadow-black/20 flex items-center justify-center">
              <span className="font-display text-xs font-medium text-gold tracking-widest">3F</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <p className="text-[10px] tracking-[0.25em] text-gold/90 uppercase mb-3">Territoire des Trois Frontières</p>
            <p className="font-display text-xl leading-snug max-w-[240px] text-ivory/95">Chaque commande soutient un commerçant du village.</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[10px] tracking-[0.1em] uppercase text-ivory/50 pr-2">
              <span>Plombières</span>
              <span className="w-px h-2.5 bg-ivory/20" />
              <span>Kelmis</span>
              <span className="w-px h-2.5 bg-ivory/20" />
              <span>Lontzen</span>
              <span className="w-px h-2.5 bg-ivory/20" />
              <span>Welkenraedt</span>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="flex items-center justify-center p-10 md:p-12">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-2xl text-forest mb-1">Créer votre compte</h1>
            <p className="text-xs text-forest/55 mb-8">
              Déjà inscrit ? <a href="/login" className="text-forest underline underline-offset-2">Connectez-vous</a>
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="name" className={labelClass}>Nom</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Votre nom" />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="vous@exemple.be" />
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>Mot de passe</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} placeholder="6 caractères minimum" />
              </div>

              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading} className="mt-3 bg-leaf text-white rounded-lg px-4 py-3 text-sm font-medium hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Création du compte...' : 'Créer mon compte'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
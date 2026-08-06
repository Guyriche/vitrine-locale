'use client'

import { useAuth } from '@/lib/auth-context'

export default function Home() {
  const { user, profile, loading } = useAuth()

  if (loading) return <p className="p-8">Chargement...</p>

  return (
    <div className="p-8">
      <p>Connecté : {user ? 'oui' : 'non'}</p>
      <p>Email : {user?.email ?? '-'}</p>
      <p>Nom : {profile?.name ?? '-'}</p>
      <p>Rôle : {profile?.role ?? '-'}</p>
    </div>
  )
}
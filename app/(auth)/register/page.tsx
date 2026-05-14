'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nom: '', email: '', motDePasse: '', confirmation: '' })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    if (form.motDePasse !== form.confirmation) {
      setErreur('Les mots de passe ne correspondent pas')
      return
    }
    setChargement(true)
    try {
      await api.post('/auth/register', {
        nom: form.nom,
        email: form.email,
        motDePasse: form.motDePasse,
      })
      router.push('/login')
    } catch (err: any) {
      setErreur(err.response?.data?.error || 'Erreur lors de l\'inscription')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* Titre */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">Rejoignez la plateforme de gestion financière</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleRegister} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Votre nom"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              name="motDePasse"
              value={form.motDePasse}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmation"
              value={form.confirmation}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {erreur}
            </div>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50"
          >
            {chargement ? 'Création...' : 'Créer mon compte'}
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Se connecter
          </a>
        </p>

      </div>
    </div>
  )
}
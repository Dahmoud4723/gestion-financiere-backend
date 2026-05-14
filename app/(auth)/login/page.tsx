'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [motDePasse, setMotDePasse] = useState('')
    const [erreur, setErreur] = useState('')
    const [chargement, setChargement] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setErreur('')
        setChargement(true)
        try {
            const res = await api.post('/auth/login', { email, motDePasse })
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur))
            router.push('/dashboard')
        } catch (err: any) {
            setErreur(err.response?.data?.error || 'Erreur de connexion')
        } finally {
            setChargement(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

                {/* Logo / Titre */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestion Financière</h1>
                    <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte</p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={motDePasse}
                            onChange={(e) => setMotDePasse(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Erreur */}
                    {erreur && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {erreur}
                        </div>
                    )}

                    {/* Bouton */}
                    <button
                        type="submit"
                        disabled={chargement}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {chargement ? 'Connexion...' : 'Se connecter'}
                    </button>

                </form>

                {/* Lien inscription */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Pas encore de compte ?{' '}
                    <a href="/register" className="text-blue-600 hover:underline font-medium">
                        S'inscrire
                    </a>
                </p>

            </div>
        </div>
    )
}
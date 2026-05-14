'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/api'

export default function ComptesPage() {
    const [comptes, setComptes] = useState<any[]>([])
    const [chargement, setChargement] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ nom: '', type: 'bancaire', soldeInitial: '', devise: 'MRU' })
    const [erreur, setErreur] = useState('')

    const fetchComptes = async () => {
        try {
            const res = await api.get('/comptes')
            setComptes(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setChargement(false)
        }
    }

    useEffect(() => { fetchComptes() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErreur('')
        try {
            await api.post('/comptes', {
                nom: form.nom,
                type: form.type,
                soldeInitial: parseFloat(form.soldeInitial) || 0,
                devise: form.devise,
            })
            setShowModal(false)
            setForm({ nom: '', type: 'bancaire', soldeInitial: '', devise: 'MRU' })
            fetchComptes()
        } catch (err: any) {
            setErreur(err.response?.data?.error || 'Erreur')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce compte ?')) return
        try {
            await api.delete(`/comptes/${id}`)
            fetchComptes()
        } catch (err) {
            console.error(err)
        }
    }

    const typeIcon: Record<string, string> = {
        bancaire: '🏦', caisse: '💵', epargne: '🏧', autre: '💼'
    }

    return (
        <div className="space-y-6">

            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Comptes financiers</h1>
                    <p className="text-gray-500 text-sm">Gérez vos comptes bancaires et caisses</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
                >
                    + Nouveau compte
                </button>
            </div>

            {/* Liste des comptes */}
            {chargement ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : comptes.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <p className="text-4xl mb-3">🏦</p>
                    <p className="text-gray-500">Aucun compte créé. Ajoutez votre premier compte !</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {comptes.map((compte: any) => (
                        <div key={compte.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                                        {typeIcon[compte.type] || '💼'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{compte.nom}</h3>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{compte.type}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(compte.id)}
                                    className="text-gray-400 hover:text-red-500 transition text-lg"
                                >
                                    🗑️
                                </button>
                            </div>
                            <div className="border-t border-gray-50 pt-4">
                                <p className="text-gray-400 text-xs">Solde actuel</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">
                                    {compte.soldeActuel.toLocaleString()} <span className="text-sm font-normal text-gray-400">{compte.devise}</span>
                                </p>
                                <p className="text-gray-400 text-xs mt-2">
                                    Solde initial : {compte.soldeInitial.toLocaleString()} {compte.devise}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal création */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800">Nouveau compte</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du compte</label>
                                <input
                                    type="text"
                                    value={form.nom}
                                    onChange={e => setForm({ ...form, nom: e.target.value })}
                                    placeholder="Ex: Compte BCI"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type de compte</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="bancaire">Bancaire</option>
                                    <option value="caisse">Caisse</option>
                                    <option value="epargne">Épargne</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Solde initial</label>
                                <input
                                    type="number"
                                    value={form.soldeInitial}
                                    onChange={e => setForm({ ...form, soldeInitial: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                                <select
                                    value={form.devise}
                                    onChange={e => setForm({ ...form, devise: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="MRU">MRU (Ouguiya)</option>
                                    <option value="EUR">EUR (Euro)</option>
                                    <option value="USD">USD (Dollar)</option>
                                </select>
                            </div>
                            {erreur && <p className="text-red-500 text-sm">{erreur}</p>}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}
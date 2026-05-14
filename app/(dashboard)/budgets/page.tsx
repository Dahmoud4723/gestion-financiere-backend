'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/api'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [chargement, setChargement] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [erreur, setErreur] = useState('')
  const [form, setForm] = useState({
    categorieId: '',
    montantLimite: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
  })

  const fetchData = async () => {
    try {
      const [b, c] = await Promise.all([
        api.get('/budgets'),
        api.get('/categories'),
      ])
      setBudgets(b.data)
      setCategories(c.data)
    } catch (err) {
      console.error(err)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    try {
      await api.post('/budgets', {
        ...form,
        montantLimite: parseFloat(form.montantLimite),
      })
      setShowModal(false)
      setForm({ categorieId: '', montantLimite: '', dateDebut: new Date().toISOString().split('T')[0], dateFin: '' })
      fetchData()
    } catch (err: any) {
      setErreur(err.response?.data?.error || 'Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce budget ?')) return
    try {
      await api.delete(`/budgets/${id}`)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const getPourcentage = (depense: number, limite: number) => {
    return Math.min(Math.round((depense / limite) * 100), 100)
  }

  const getColor = (pct: number) => {
    if (pct >= 100) return 'bg-red-500'
    if (pct >= 80) return 'bg-orange-400'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Budgets</h1>
          <p className="text-gray-500 text-sm">Définissez et suivez vos budgets par catégorie</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
        >
          + Nouveau budget
        </button>
      </div>

      {chargement ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500">Aucun budget défini. Créez votre premier budget !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b: any) => {
            const pct = getPourcentage(b.montantDepense, b.montantLimite)
            return (
              <div key={b.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{b.categorieNom || 'Budget'}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(b.dateDebut).toLocaleDateString('fr-FR')} → {new Date(b.dateFin).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      pct >= 100 ? 'bg-red-100 text-red-700' :
                      pct >= 80 ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {pct}%
                    </span>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                  <div
                    className={`h-3 rounded-full transition-all ${getColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Dépensé : <strong className="text-gray-800">{b.montantDepense?.toLocaleString()} MRU</strong>
                  </span>
                  <span className="text-gray-500">
                    Limite : <strong className="text-gray-800">{b.montantLimite?.toLocaleString()} MRU</strong>
                  </span>
                </div>

                {pct >= 100 && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 font-medium">
                    ⚠️ Budget dépassé !
                  </div>
                )}
                {pct >= 80 && pct < 100 && (
                  <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-xs text-orange-600 font-medium">
                    ⚠️ Attention, vous approchez de la limite !
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Nouveau budget</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={form.categorieId}
                  onChange={e => setForm({ ...form, categorieId: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant limite (MRU)</label>
                <input
                  type="number"
                  value={form.montantLimite}
                  onChange={e => setForm({ ...form, montantLimite: e.target.value })}
                  placeholder="0"
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                <input
                  type="date"
                  value={form.dateDebut}
                  onChange={e => setForm({ ...form, dateDebut: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                <input
                  type="date"
                  value={form.dateFin}
                  onChange={e => setForm({ ...form, dateFin: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
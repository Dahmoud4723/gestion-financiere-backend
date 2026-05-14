'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/api'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [comptes, setComptes] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [chargement, setChargement] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filtreType, setFiltreType] = useState('')
  const [filtreSource, setFiltreSource] = useState('')
  const [form, setForm] = useState({
    compteId: '', categorieId: '', montant: '',
    type: 'ENTREE', sourcePaiement: 'VIREMENT',
    description: '', dateTransaction: new Date().toISOString().split('T')[0]
  })
  const [erreur, setErreur] = useState('')

  const fetchData = async () => {
    try {
      const [t, c, cat] = await Promise.all([
        api.get('/transactions'),
        api.get('/comptes'),
        api.get('/categories'),
      ])
      setTransactions(t.data)
      setComptes(c.data)
      setCategories(cat.data)
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
      await api.post('/transactions', {
        ...form,
        montant: parseFloat(form.montant),
        categorieId: form.categorieId || null,
      })
      setShowModal(false)
      setForm({
        compteId: '', categorieId: '', montant: '',
        type: 'ENTREE', sourcePaiement: 'VIREMENT',
        description: '', dateTransaction: new Date().toISOString().split('T')[0]
      })
      fetchData()
    } catch (err: any) {
      setErreur(err.response?.data?.error || 'Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette transaction ?')) return
    try {
      await api.delete(`/transactions/${id}`)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const transactionsFiltrees = transactions.filter(t => {
    if (filtreType && t.type !== filtreType) return false
    if (filtreSource && t.sourcePaiement !== filtreSource) return false
    return true
  })

  const sources = ['CASH', 'VIREMENT', 'BANKILY', 'MASRVI', 'SEDAD', 'AUTRE']

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-500 text-sm">Suivi de toutes vos entrées et sorties financières</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
        >
          + Nouvelle transaction
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 flex-wrap">
        <select
          value={filtreType}
          onChange={e => setFiltreType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les types</option>
          <option value="ENTREE">Entrées</option>
          <option value="SORTIE">Sorties</option>
        </select>
        <select
          value={filtreSource}
          onChange={e => setFiltreSource(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les sources</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-gray-400 text-sm self-center">
          {transactionsFiltrees.length} transaction(s)
        </span>
      </div>

      {/* Liste */}
      {chargement ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : transactionsFiltrees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-gray-500">Aucune transaction trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Source</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactionsFiltrees.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      t.type === 'ENTREE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {t.type === 'ENTREE' ? '↑' : '↓'} {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-800">{t.description || '—'}</p>
                    <p className="text-xs text-gray-400">{t.compteNom || t.categorieNom || ''}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">
                      {t.sourcePaiement}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(t.dateTransaction).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold text-sm ${t.type === 'ENTREE' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'ENTREE' ? '+' : '-'}{t.montant.toLocaleString()} MRU
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Nouvelle transaction</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compte</label>
                <select
                  value={form.compteId}
                  onChange={e => setForm({ ...form, compteId: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un compte</option>
                  {comptes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ENTREE">Entrée</option>
                  <option value="SORTIE">Sortie</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source de paiement</label>
                <select
                  value={form.sourcePaiement}
                  onChange={e => setForm({ ...form, sourcePaiement: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={form.categorieId}
                  onChange={e => setForm({ ...form, categorieId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sans catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MRU)</label>
                <input
                  type="number"
                  value={form.montant}
                  onChange={e => setForm({ ...form, montant: e.target.value })}
                  placeholder="0"
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Description optionnelle"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.dateTransaction}
                  onChange={e => setForm({ ...form, dateTransaction: e.target.value })}
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
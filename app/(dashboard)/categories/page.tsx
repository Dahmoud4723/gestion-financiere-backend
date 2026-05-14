'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/api'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [chargement, setChargement] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nom: '', type: 'ENTREE', couleur: '#2563eb' })
  const [erreur, setErreur] = useState('')

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    try {
      await api.post('/categories', form)
      setShowModal(false)
      setForm({ nom: '', type: 'ENTREE', couleur: '#2563eb' })
      fetchCategories()
    } catch (err: any) {
      setErreur(err.response?.data?.error || 'Erreur')
    }
  }

  const handleDelete = async (id: string, estSysteme: boolean) => {
    if (estSysteme) return alert('Impossible de supprimer une catégorie système')
    if (!confirm('Supprimer cette catégorie ?')) return
    try {
      await api.delete(`/categories/${id}`)
      fetchCategories()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catégories</h1>
          <p className="text-gray-500 text-sm">Organisez vos transactions par catégorie</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
        >
          + Nouvelle catégorie
        </button>
      </div>

      {chargement ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: any) => (
            <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: cat.couleur || '#2563eb' }}
                >
                  {cat.nom.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{cat.nom}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    cat.type === 'ENTREE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {cat.type}
                  </span>
                </div>
              </div>
              {!cat.estSysteme && (
                <button
                  onClick={() => handleDelete(cat.id, cat.estSysteme)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Nouvelle catégorie</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex: Salaire, Loyer..."
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                <input
                  type="color"
                  value={form.couleur}
                  onChange={e => setForm({ ...form, couleur: e.target.value })}
                  className="w-full h-12 border border-gray-300 rounded-xl cursor-pointer"
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
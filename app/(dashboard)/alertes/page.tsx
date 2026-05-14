'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/api'

export default function AlertesPage() {
  const [alertes, setAlertes] = useState<any[]>([])
  const [chargement, setChargement] = useState(true)
  const [filtre, setFiltre] = useState('')

  const fetchAlertes = async () => {
    setChargement(true)
    try {
      const url = filtre !== '' ? `/alertes?lue=${filtre}` : '/alertes'
      const res = await api.get(url)
      setAlertes(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { fetchAlertes() }, [filtre])

  const marquerLue = async (id: string) => {
    try {
      await api.put(`/alertes/${id}`)
      fetchAlertes()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette alerte ?')) return
    try {
      await api.delete(`/alertes/${id}`)
      fetchAlertes()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Alertes</h1>
        <p className="text-gray-500 text-sm">Notifications et alertes budgétaires</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
        {[
          { val: '', label: 'Toutes' },
          { val: 'false', label: 'Non lues' },
          { val: 'true', label: 'Lues' },
        ].map(f => (
          <button
            key={f.val}
            onClick={() => setFiltre(f.val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filtre === f.val
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {chargement ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : alertes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-500">Aucune alerte pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertes.map((alerte: any) => (
            <div
              key={alerte.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition ${
                alerte.lue ? 'border-gray-100' : 'border-orange-200 bg-orange-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{alerte.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alerte.creeLe).toLocaleDateString('fr-FR')}
                    </p>
                    {!alerte.lue && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        Non lue
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!alerte.lue && (
                    <button
                      onClick={() => marquerLue(alerte.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                    >
                      ✓ Lue
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(alerte.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
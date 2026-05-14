'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed']

export default function DashboardPage() {
  const [comptes, setComptes] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [alertes, setAlertes] = useState<any[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, t, b, a] = await Promise.all([
          api.get('/comptes'),
          api.get('/transactions'),
          api.get('/budgets'),
          api.get('/alertes?lue=false'),
        ])
        setComptes(c.data)
        setTransactions(t.data)
        setBudgets(b.data)
        setAlertes(a.data)
      } catch (err) {
        console.error(err)
      } finally {
        setChargement(false)
      }
    }
    fetchData()
  }, [])

  // Calculs
  const totalSolde = comptes.reduce((acc, c) => acc + c.soldeActuel, 0)
  const totalEntrees = transactions.filter(t => t.type === 'ENTREE').reduce((acc, t) => acc + t.montant, 0)
  const totalSorties = transactions.filter(t => t.type === 'SORTIE').reduce((acc, t) => acc + t.montant, 0)

  // Données graphique ligne
  const derniers7Jours = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    const label = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
    const entrees = transactions.filter(t => t.type === 'ENTREE' && t.dateTransaction?.startsWith(dateStr)).reduce((acc, t) => acc + t.montant, 0)
    const sorties = transactions.filter(t => t.type === 'SORTIE' && t.dateTransaction?.startsWith(dateStr)).reduce((acc, t) => acc + t.montant, 0)
    return { label, entrees, sorties }
  })

  // Données graphique camembert (par source paiement)
  const parSource: Record<string, number> = {}
  transactions.forEach(t => {
    parSource[t.sourcePaiement] = (parSource[t.sourcePaiement] || 0) + t.montant
  })
  const dataPie = Object.entries(parSource).map(([name, value]) => ({ name, value }))

  if (chargement) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-500 text-sm">Vue d'ensemble de votre situation financière</p>
      </div>

      {/* Alertes non lues */}
      {alertes.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <p className="text-orange-700 text-sm font-medium">
            Vous avez <strong>{alertes.length}</strong> alerte(s) non lue(s).{' '}
            <a href="/alertes" className="underline">Voir les alertes</a>
          </p>
        </div>
      )}

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Solde total</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalSolde.toLocaleString()} MRU</p>
          <p className="text-gray-400 text-xs mt-1">{comptes.length} compte(s)</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total entrées</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalEntrees.toLocaleString()} MRU</p>
          <p className="text-gray-400 text-xs mt-1">↑ {transactions.filter(t => t.type === 'ENTREE').length} transactions</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total sorties</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{totalSorties.toLocaleString()} MRU</p>
          <p className="text-gray-400 text-xs mt-1">↓ {transactions.filter(t => t.type === 'SORTIE').length} transactions</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Budgets actifs</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{budgets.length}</p>
          <p className="text-gray-400 text-xs mt-1">budgets définis</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Graphique ligne */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">Flux des 7 derniers jours</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={derniers7Jours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="entrees" stroke="#16a34a" strokeWidth={2} name="Entrées" dot={false} />
              <Line type="monotone" dataKey="sorties" stroke="#dc2626" strokeWidth={2} name="Sorties" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique camembert */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">Répartition par source de paiement</h2>
          {dataPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={dataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {dataPie.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Aucune transaction enregistrée
            </div>
          )}
        </div>

      </div>

      {/* Dernières transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Dernières transactions</h2>
          <a href="/transactions" className="text-blue-600 text-sm hover:underline">Voir tout</a>
        </div>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Aucune transaction</p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${t.type === 'ENTREE' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {t.type === 'ENTREE' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t.description || t.categorieNom || 'Transaction'}</p>
                    <p className="text-xs text-gray-400">{t.sourcePaiement} • {new Date(t.dateTransaction).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${t.type === 'ENTREE' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'ENTREE' ? '+' : '-'}{t.montant.toLocaleString()} MRU
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
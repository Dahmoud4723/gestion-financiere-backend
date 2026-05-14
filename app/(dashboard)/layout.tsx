'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [utilisateur, setUtilisateur] = useState<any>(null)
    const [menuOuvert, setMenuOuvert] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('utilisateur')
        if (!token) {
            router.push('/login')
            return
        }
        if (user) setUtilisateur(JSON.parse(user))
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('utilisateur')
        router.push('/login')
    }

    const navLinks = [
        { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
        { href: '/comptes', label: 'Comptes', icon: '🏦' },
        { href: '/transactions', label: 'Transactions', icon: '💸' },
        { href: '/categories', label: 'Catégories', icon: '🏷️' },
        { href: '/budgets', label: 'Budgets', icon: '📋' },
        { href: '/alertes', label: 'Alertes', icon: '🔔' },
    ]

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* Sidebar */}
            <aside className="w-64 bg-blue-950 text-white flex flex-col fixed h-full z-10">

                {/* Logo */}
                <div className="p-6 border-b border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-xl">💰</div>
                        <div>
                            <h1 className="font-bold text-sm">Gestion Financière</h1>
                            <p className="text-blue-300 text-xs">IDER SI</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${pathname === link.href
                                    ? 'bg-blue-600 text-white'
                                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                                }`}
                        >
                            <span className="text-lg">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Utilisateur */}
                <div className="p-4 border-t border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {utilisateur?.nom?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{utilisateur?.nom || 'Utilisateur'}</p>
                            <p className="text-blue-300 text-xs truncate">{utilisateur?.email || ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:bg-red-900/30 rounded-xl transition"
                    >
                        <span>🚪</span> Déconnexion
                    </button>
                </div>

            </aside>

            {/* Contenu principal */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>

        </div>
    )
}
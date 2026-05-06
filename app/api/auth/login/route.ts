import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
    try {
        const { email, motDePasse } = await req.json()
        const result = await sql`SELECT * FROM "Utilisateur" WHERE email = ${email}`
        if (result.length === 0) {
            return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
        }
        const utilisateur = result[0]
        const ok = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash)
        if (!ok) {
            return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
        }
        const token = jwt.sign(
            { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
            'monsecretjwt2024',
            { expiresIn: '7d' }
        )
        return NextResponse.json({
            message: 'Connexion reussie',
            token,
            utilisateur: { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email, role: utilisateur.role }
        })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}
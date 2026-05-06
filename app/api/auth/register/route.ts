import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const { nom, email, motDePasse, role } = await req.json()

        // Vérifier si l'email existe déjà
        const existant = await sql`SELECT id FROM "Utilisateur" WHERE email = ${email}`

        if (existant.length > 0) {
            return NextResponse.json(
                { error: 'Cet email est déjà utilisé' },
                { status: 400 }
            )
        }

        // Hasher le mot de passe
        const motDePasseHash = await bcrypt.hash(motDePasse, 10)
        const id = crypto.randomUUID()

        // Créer l'utilisateur
        const utilisateur = await sql`
      INSERT INTO "Utilisateur" (id, nom, email, "motDePasseHash", role, "creeLe")
      VALUES (${id}, ${nom}, ${email}, ${motDePasseHash}, ${role || 'user'}, NOW())
      RETURNING id, nom, email, role, "creeLe"
    `

        return NextResponse.json(
            { message: 'Compte créé avec succès', utilisateur: utilisateur[0] },
            { status: 201 }
        )

    } catch (error) {
        console.error('ERREUR REGISTER:', error)
        return NextResponse.json(
            { error: 'Erreur serveur', details: String(error) },
            { status: 500 }
        )
    }
}
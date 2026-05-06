import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import { verifierToken, nonAutorise } from '@/lib/auth'

// GET - Récupérer tous les comptes
export async function GET(req: NextRequest) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const comptes = await sql`
      SELECT * FROM "Compte" 
      WHERE "utilisateurId" = ${payload.id}
      ORDER BY "creeLe" DESC
    `
        return NextResponse.json(comptes)
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// POST - Créer un compte
export async function POST(req: NextRequest) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const { nom, type, soldeInitial, devise } = await req.json()
        const id = crypto.randomUUID()
        const solde = soldeInitial || 0

        const compte = await sql`
      INSERT INTO "Compte" (id, "utilisateurId", nom, type, "soldeInitial", "soldeActuel", devise, actif, "creeLe")
      VALUES (${id}, ${payload.id}, ${nom}, ${type}, ${solde}, ${solde}, ${devise || 'MRU'}, true, NOW())
      RETURNING *
    `
        return NextResponse.json(compte[0], { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import { verifierToken, nonAutorise } from '@/lib/auth'

// GET - Récupérer tous les budgets
export async function GET(req: NextRequest) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const budgets = await sql`
      SELECT b.*, c.nom as categorieNom, c.couleur as categorieCouleur
      FROM "Budget" b
      JOIN "Categorie" c ON b."categorieId" = c.id
      WHERE b."utilisateurId" = ${payload.id}
      ORDER BY b."dateDebut" DESC
    `
        return NextResponse.json(budgets)
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// POST - Créer un budget
export async function POST(req: NextRequest) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const { categorieId, montantLimite, dateDebut, dateFin } = await req.json()
        const id = crypto.randomUUID()

        const budget = await sql`
      INSERT INTO "Budget" (id, "utilisateurId", "categorieId", "montantLimite", "montantDepense", "dateDebut", "dateFin")
      VALUES (${id}, ${payload.id}, ${categorieId}, ${montantLimite}, 0, ${dateDebut}, ${dateFin})
      RETURNING *
    `
        return NextResponse.json(budget[0], { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import { verifierToken, nonAutorise } from '@/lib/auth'

// GET - Récupérer un budget par ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const budget = await sql`
      SELECT b.*, c.nom as categorieNom, c.couleur as categorieCouleur
      FROM "Budget" b
      JOIN "Categorie" c ON b."categorieId" = c.id
      WHERE b.id = ${params.id} AND b."utilisateurId" = ${payload.id}
    `
        if (budget.length === 0) {
            return NextResponse.json({ error: 'Budget non trouvé' }, { status: 404 })
        }

        const b = budget[0]
        const pourcentage = Math.round((b.montantDepense / b.montantLimite) * 100)

        return NextResponse.json({ ...b, pourcentage })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// PUT - Modifier un budget
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const { montantLimite, categorieId, dateDebut, dateFin } = await req.json()

        const budget = await sql`
      UPDATE "Budget"
      SET "montantLimite" = ${montantLimite},
          "categorieId" = ${categorieId},
          "dateDebut" = ${dateDebut},
          "dateFin" = ${dateFin}
      WHERE id = ${params.id} AND "utilisateurId" = ${payload.id}
      RETURNING *
    `
        if (budget.length === 0) {
            return NextResponse.json({ error: 'Budget non trouvé' }, { status: 404 })
        }
        return NextResponse.json(budget[0])
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// DELETE - Supprimer un budget
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const budget = await sql`
      DELETE FROM "Budget"
      WHERE id = ${params.id} AND "utilisateurId" = ${payload.id}
      RETURNING *
    `
        if (budget.length === 0) {
            return NextResponse.json({ error: 'Budget non trouvé' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Budget supprimé avec succès' })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}
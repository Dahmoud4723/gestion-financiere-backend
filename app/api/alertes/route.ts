import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import { verifierToken, nonAutorise } from '@/lib/auth'

// GET - Récupérer toutes les alertes
export async function GET(req: NextRequest) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const { searchParams } = new URL(req.url)
        const lue = searchParams.get('lue')

        let alertes

        if (lue !== null) {
            alertes = await sql`
        SELECT a.*, b."montantLimite", b."montantDepense", c.nom as categorieNom
        FROM "Alerte" a
        JOIN "Budget" b ON a."budgetId" = b.id
        JOIN "Categorie" c ON b."categorieId" = c.id
        WHERE a."utilisateurId" = ${payload.id}
        AND a.lue = ${lue === 'true'}
        ORDER BY a."creeLe" DESC
      `
        } else {
            alertes = await sql`
        SELECT a.*, b."montantLimite", b."montantDepense", c.nom as categorieNom
        FROM "Alerte" a
        JOIN "Budget" b ON a."budgetId" = b.id
        JOIN "Categorie" c ON b."categorieId" = c.id
        WHERE a."utilisateurId" = ${payload.id}
        ORDER BY a."creeLe" DESC
      `
        }

        return NextResponse.json(alertes)
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import { verifierToken, nonAutorise } from '@/lib/auth'

// PUT - Marquer une alerte comme lue
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const alerte = await sql`
      UPDATE "Alerte"
      SET lue = true
      WHERE id = ${params.id} AND "utilisateurId" = ${payload.id}
      RETURNING *
    `
        if (alerte.length === 0) {
            return NextResponse.json({ error: 'Alerte non trouvée' }, { status: 404 })
        }
        return NextResponse.json(alerte[0])
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// DELETE - Supprimer une alerte
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const alerte = await sql`
      DELETE FROM "Alerte"
      WHERE id = ${params.id} AND "utilisateurId" = ${payload.id}
      RETURNING *
    `
        if (alerte.length === 0) {
            return NextResponse.json({ error: 'Alerte non trouvée' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Alerte supprimée avec succès' })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}
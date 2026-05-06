import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import { verifierToken, nonAutorise } from '@/lib/auth'

// GET - Récupérer un compte par ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const compte = await sql`
      SELECT * FROM "Compte" 
      WHERE id = ${params.id} AND "utilisateurId" = ${payload.id}
    `
        if (compte.length === 0) {
            return NextResponse.json({ error: 'Compte non trouvé' }, { status: 404 })
        }
        return NextResponse.json(compte[0])
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// PUT - Modifier un compte
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const { nom, type, devise, actif } = await req.json()

        const compte = await sql`
      UPDATE "Compte" 
      SET nom = ${nom}, type = ${type}, devise = ${devise}, actif = ${actif}
      WHERE id = ${params.id} AND "utilisateurId" = ${payload.id}
      RETURNING *
    `
        if (compte.length === 0) {
            return NextResponse.json({ error: 'Compte non trouvé' }, { status: 404 })
        }
        return NextResponse.json(compte[0])
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// DELETE - Supprimer un compte
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const compte = await sql`
      DELETE FROM "Compte" 
      WHERE id = ${params.id} AND "utilisateurId" = ${payload.id}
      RETURNING *
    `
        if (compte.length === 0) {
            return NextResponse.json({ error: 'Compte non trouvé' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Compte supprimé avec succès' })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}
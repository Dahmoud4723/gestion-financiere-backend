import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import { verifierToken, nonAutorise } from '@/lib/auth'

// GET - Récupérer une catégorie par ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const categorie = await sql`
      SELECT * FROM "Categorie" WHERE id = ${params.id}
    `
        if (categorie.length === 0) {
            return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
        }
        return NextResponse.json(categorie[0])
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// PUT - Modifier une catégorie
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const { nom, type, couleur } = await req.json()

        // Vérifier si c'est une catégorie système
        const existante = await sql`
      SELECT * FROM "Categorie" WHERE id = ${params.id}
    `
        if (existante.length === 0) {
            return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
        }
        if (existante[0].estSysteme) {
            return NextResponse.json({ error: 'Impossible de modifier une catégorie système' }, { status: 403 })
        }

        const categorie = await sql`
      UPDATE "Categorie"
      SET nom = ${nom}, type = ${type}, couleur = ${couleur || null}
      WHERE id = ${params.id}
      RETURNING *
    `
        return NextResponse.json(categorie[0])
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// DELETE - Supprimer une catégorie
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const existante = await sql`
      SELECT * FROM "Categorie" WHERE id = ${params.id}
    `
        if (existante.length === 0) {
            return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
        }
        if (existante[0].estSysteme) {
            return NextResponse.json({ error: 'Impossible de supprimer une catégorie système' }, { status: 403 })
        }

        await sql`DELETE FROM "Categorie" WHERE id = ${params.id}`
        return NextResponse.json({ message: 'Catégorie supprimée avec succès' })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}
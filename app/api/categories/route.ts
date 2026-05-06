import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import { verifierToken, nonAutorise } from '@/lib/auth'

// GET - Récupérer toutes les catégories
export async function GET(req: NextRequest) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const categories = await sql`
      SELECT * FROM "Categorie" ORDER BY nom ASC
    `
        return NextResponse.json(categories)
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// POST - Créer une catégorie
export async function POST(req: NextRequest) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const { nom, type, couleur } = await req.json()
        const id = crypto.randomUUID()

        const categorie = await sql`
      INSERT INTO "Categorie" (id, nom, type, couleur, "estSysteme")
      VALUES (${id}, ${nom}, ${type}, ${couleur || null}, false)
      RETURNING *
    `
        return NextResponse.json(categorie[0], { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}
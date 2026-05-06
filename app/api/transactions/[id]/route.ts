import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import { verifierToken, nonAutorise } from '@/lib/auth'

// GET - Récupérer une transaction par ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const transaction = await sql`
      SELECT t.*, c.nom as compteNom, c.devise, cat.nom as categorieNom
      FROM "Transaction" t
      JOIN "Compte" c ON t."compteId" = c.id
      LEFT JOIN "Categorie" cat ON t."categorieId" = cat.id
      WHERE t.id = ${params.id} AND c."utilisateurId" = ${payload.id}
    `
        if (transaction.length === 0) {
            return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 })
        }
        return NextResponse.json(transaction[0])
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// PUT - Modifier une transaction
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const { categorieId, description, sourcePaiement, dateTransaction } = await req.json()

        const transaction = await sql`
      UPDATE "Transaction" t
      SET "categorieId" = ${categorieId || null},
          description = ${description || null},
          "sourcePaiement" = ${sourcePaiement},
          "dateTransaction" = ${dateTransaction}
      FROM "Compte" c
      WHERE t."compteId" = c.id
      AND t.id = ${params.id}
      AND c."utilisateurId" = ${payload.id}
      RETURNING t.*
    `
        if (transaction.length === 0) {
            return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 })
        }
        return NextResponse.json(transaction[0])
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// DELETE - Supprimer une transaction
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        // Récupérer la transaction
        const transaction = await sql`
      SELECT t.*, c."soldeActuel"
      FROM "Transaction" t
      JOIN "Compte" c ON t."compteId" = c.id
      WHERE t.id = ${params.id} AND c."utilisateurId" = ${payload.id}
    `
        if (transaction.length === 0) {
            return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 })
        }

        const t = transaction[0]
        const nouveauSolde = t.type === 'ENTREE'
            ? t.soldeActuel - t.montant
            : t.soldeActuel + t.montant

        // Supprimer la transaction
        await sql`DELETE FROM "Transaction" WHERE id = ${params.id}`

        // Recalculer le solde
        await sql`UPDATE "Compte" SET "soldeActuel" = ${nouveauSolde} WHERE id = ${t.compteId}`

        return NextResponse.json({ message: 'Transaction supprimée avec succès' })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}
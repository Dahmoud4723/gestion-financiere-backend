import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/prisma'
import { verifierToken, nonAutorise } from '@/lib/auth'

// GET - Récupérer toutes les transactions
export async function GET(req: NextRequest) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const { searchParams } = new URL(req.url)
        const compteId = searchParams.get('compteId')
        const type = searchParams.get('type')
        const sourcePaiement = searchParams.get('sourcePaiement')

        let transactions

        if (compteId && type && sourcePaiement) {
            transactions = await sql`
        SELECT t.*, c.nom as compteNom, c.devise, cat.nom as categorieNom
        FROM "Transaction" t
        JOIN "Compte" c ON t."compteId" = c.id
        LEFT JOIN "Categorie" cat ON t."categorieId" = cat.id
        WHERE c."utilisateurId" = ${payload.id}
        AND t."compteId" = ${compteId}
        AND t.type = ${type}
        AND t."sourcePaiement" = ${sourcePaiement}
        ORDER BY t."dateTransaction" DESC
      `
        } else if (compteId) {
            transactions = await sql`
        SELECT t.*, c.nom as compteNom, c.devise, cat.nom as categorieNom
        FROM "Transaction" t
        JOIN "Compte" c ON t."compteId" = c.id
        LEFT JOIN "Categorie" cat ON t."categorieId" = cat.id
        WHERE c."utilisateurId" = ${payload.id}
        AND t."compteId" = ${compteId}
        ORDER BY t."dateTransaction" DESC
      `
        } else {
            transactions = await sql`
        SELECT t.*, c.nom as compteNom, c.devise, cat.nom as categorieNom
        FROM "Transaction" t
        JOIN "Compte" c ON t."compteId" = c.id
        LEFT JOIN "Categorie" cat ON t."categorieId" = cat.id
        WHERE c."utilisateurId" = ${payload.id}
        ORDER BY t."dateTransaction" DESC
      `
        }

        return NextResponse.json(transactions)
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}

// POST - Créer une transaction
export async function POST(req: NextRequest) {
    const payload = verifierToken(req)
    if (!payload) return nonAutorise()

    try {
        const { compteId, categorieId, montant, type, sourcePaiement, description, dateTransaction } = await req.json()

        // Vérifier que le compte appartient à l'utilisateur
        const compte = await sql`
      SELECT * FROM "Compte" WHERE id = ${compteId} AND "utilisateurId" = ${payload.id}
    `
        if (compte.length === 0) {
            return NextResponse.json({ error: 'Compte non trouvé' }, { status: 404 })
        }

        const id = crypto.randomUUID()
        const soldeActuel = compte[0].soldeActuel
        const nouveauSolde = type === 'ENTREE' ? soldeActuel + montant : soldeActuel - montant

        // Créer la transaction
        const transaction = await sql`
      INSERT INTO "Transaction" (id, "compteId", "categorieId", montant, type, "sourcePaiement", description, "dateTransaction", "creeLe")
      VALUES (${id}, ${compteId}, ${categorieId || null}, ${montant}, ${type}, ${sourcePaiement}, ${description || null}, ${dateTransaction}, NOW())
      RETURNING *
    `

        // Mettre à jour le solde du compte
        await sql`
      UPDATE "Compte" SET "soldeActuel" = ${nouveauSolde} WHERE id = ${compteId}
    `

        return NextResponse.json(transaction[0], { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
    }
}
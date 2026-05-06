import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export interface JwtPayload {
    id: string
    email: string
    role: string
}

export function verifierToken(req: NextRequest): JwtPayload | null {
    try {
        const authHeader = req.headers.get('authorization')
        console.log('HEADER COMPLET:', authHeader)
        if (!authHeader) return null
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader
        console.log('TOKEN COMPLET:', token)
        const payload = jwt.verify(token, 'monsecretjwt2024') as JwtPayload
        return payload
    } catch (error) {
        console.log('ERREUR JWT:', error)
        return null
    }
}

export function nonAutorise() {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
}
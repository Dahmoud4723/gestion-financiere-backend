import { neon } from '@neondatabase/serverless'

const DATABASE_URL = "postgresql://neondb_owner:npg_LpR8nugcmDt3@ep-fragrant-mouse-amx0apto-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

export const sql = neon(DATABASE_URL)
import { defineConfig } from 'prisma/config'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  datasource: {
    url: 'postgresql://neondb_owner:npg_LpR8nugcmDt3@ep-fragrant-mouse-amx0apto.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  },
  migrate: {
    adapter: () => {
      const pool = new Pool({
        connectionString: 'postgresql://neondb_owner:npg_LpR8nugcmDt3@ep-fragrant-mouse-amx0apto.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
      })
      return new PrismaNeon(pool)
    },
  },
})
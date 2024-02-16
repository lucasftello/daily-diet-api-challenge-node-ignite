import { Knex, knex as knexConfig } from 'knex'
import { env } from './env'

const databaseConnection =
  env.DATABASE_CLIENT === 'sqlite3'
    ? {
        filename: env.DATABASE_URL,
      }
    : env.DATABASE_URL

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: databaseConnection,
  migrations: {
    directory: './src/db/migrations',
    extension: 'ts',
  },
  useNullAsDefault: true,
}

export const knex = knexConfig(config)

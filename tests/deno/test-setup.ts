import {PGColdDialect} from '../../dist/index.mjs'

const POOL_SIZE = 10

export const CONFIGS = {
  pg: {
    knexConfig: {
      client: 'pg',
      connection: {
        database: 'kysely_test',
        host: 'localhost',
        port: 5434,
        user: 'kysely',
      },
      pool: {min: 0, max: POOL_SIZE},
    },
    kyselySubDialect: new PGColdDialect(),
  },
}

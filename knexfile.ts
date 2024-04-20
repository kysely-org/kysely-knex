const {PGColdDialect} = require('./dist/cjs')
const {KyselyFsMigrationSource} = require('./dist/cjs/migrations')

module.exports = {
  client: 'pg',
  connection: {
    database: 'kysely_test',
    host: 'localhost',
    port: 5434,
    user: 'kysely',
  },
  pool: {
    min: 1,
    max: 1,
  },
  migrations: {
    migrationSource: new KyselyFsMigrationSource({
      kyselySubDialect: new PGColdDialect(),
      migrationDirectories: 'migrations',
    }),
  },
}

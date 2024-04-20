import type {FsMigrations} from 'knex/lib/migrations/migrate/sources/fs-migrations.js'
import {join} from 'node:path'
import {KyselyFsMigrationSource} from '../../dist/esm/migrations'
import {
  CONFIGS,
  SUPPORTED_DIALECTS,
  dropDatabase,
  expect,
  initTest,
  type TestContext,
} from './test-setup'

for (const dialect of SUPPORTED_DIALECTS) {
  describe(`KyselyFsMigrationSource: ${dialect}`, () => {
    let ctx: TestContext
    let migrationSource: FsMigrations

    before(async function () {
      ctx = await initTest(this, dialect)
      migrationSource = new KyselyFsMigrationSource({
        kyselySubDialect: CONFIGS[dialect].kyselySubDialect,
        migrationDirectories: join(__dirname, '../../migrations'),
      })
    })

    after(async () => {
      await dropDatabase(ctx.knex)
      await ctx.kysely.destroy()
    })

    it('should migrate to latest, using both knex and kysely in migrations', async () => {
      await ctx.knex.migrate.latest({migrationSource})

      expect(await ctx.knex.schema.hasTable('dog_walker')).to.be.true
      expect(await ctx.knex.schema.hasColumn('dog_walker', 'email')).to.be.true
    })

    it('should rollback all, using both knex and kysely in migrations', async () => {
      await ctx.knex.migrate.rollback({migrationSource}, true)

      expect(await ctx.knex.schema.hasTable('dog_walker')).to.be.false
    })
  })
}

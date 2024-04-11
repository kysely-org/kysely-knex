import {join} from 'node:path'
import {KyselyFsMigrationSource} from '../..'
import {
  SUPPORTED_DIALECTS,
  expect,
  initTest,
  type TestContext,
} from './test-setup'

for (const dialect of SUPPORTED_DIALECTS) {
  describe.only(`KyselyFsMigrationSource: ${dialect}`, () => {
    let ctx: TestContext
    let migrationSource: KyselyFsMigrationSource

    before(async function () {
      ctx = await initTest(this, 'pg')
      migrationSource = new KyselyFsMigrationSource({
        knex: ctx.knex,
        kysely: ctx.kysely,
        migrationDirectories: join(__dirname, 'migrations'),
      })
    })

    after(async () => {
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

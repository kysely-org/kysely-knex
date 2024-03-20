import {InsertResult, UpdateResult} from 'kysely'
import {expectType} from 'tsd'
import {SUPPORTED_DIALECTS} from '../../src/supported-dialects'
import {
  DEFAULT_DATA_SET,
  PerDialect,
  dropDatabase,
  expect,
  initTest,
  seedDatabase,
  type TestContext,
} from './test-setup'

for (const dialect of SUPPORTED_DIALECTS.slice(0, 1)) {
  describe(`KyselyKnexDialect: ${dialect}`, () => {
    let ctx: TestContext

    beforeEach(async function () {
      ctx = await initTest(this, dialect)
      await seedDatabase(ctx)
    })

    afterEach(async () => {
      await dropDatabase(ctx.knex)
    })

    after(async () => {
      await ctx.kysely.destroy()
    })

    it.only('should be able to perform select queries', async () => {
      const knexPeople = await ctx.knex.from('person').select('*')

      const kyselyPeople = await ctx.kysely.selectFrom('person').selectAll().execute()

      expect(kyselyPeople).to.deep.equal(knexPeople)
      expectType<typeof knexPeople>(kyselyPeople)
    })

    it.only('should be able to perform insert queries', async () => {
      const result = await ctx.kysely.insertInto('person').values({gender: 'female'}).executeTakeFirstOrThrow()

      expect(result).to.deep.equal(
        (
          {
            'better-sqlite3': {insertId: BigInt(DEFAULT_DATA_SET.length + 1), numInsertedOrUpdatedRows: BigInt(1)},
            mssql: {insertId: undefined, numInsertedOrUpdatedRows: BigInt(1)},
            mysql: {insertId: BigInt(DEFAULT_DATA_SET.length + 1), numInsertedOrUpdatedRows: BigInt(1)},
            pg: {insertId: undefined, numInsertedOrUpdatedRows: BigInt(1)},
            sqlite3: {insertId: undefined, numInsertedOrUpdatedRows: undefined},
          } satisfies PerDialect<{[K in keyof InsertResult]: InsertResult[K]}>
        )[dialect],
      )
    })

    if (dialect === 'better-sqlite3' || dialect === 'pg' || dialect === 'sqlite3') {
      it('should be able to perform insert queries with returning', async () => {
        const result = await ctx.kysely
          .insertInto('person')
          .values({gender: 'female'})
          .returning('id')
          .executeTakeFirst()

        expect(result).to.deep.equal({id: DEFAULT_DATA_SET.length + 1})
      })
    }

    it('should be able to perform update queries', async () => {
      const result = await ctx.kysely
        .updateTable('person')
        .set({marital_status: 'widowed'})
        .where('id', '=', 1)
        .executeTakeFirstOrThrow()

      expect(result).to.deep.equal(
        (
          {
            'better-sqlite3': new UpdateResult(BigInt(1), undefined),
            mssql: new UpdateResult(BigInt(1), undefined),
            mysql: new UpdateResult(BigInt(1), BigInt(1)),
            pg: new UpdateResult(BigInt(1), undefined),
            sqlite3: new UpdateResult(BigInt(0), undefined),
          } satisfies PerDialect<{[K in keyof UpdateResult]: UpdateResult[K]}>
        )[dialect],
      )
    })
  })
}

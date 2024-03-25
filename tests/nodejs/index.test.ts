import {DeleteResult, InsertResult, UpdateResult} from 'kysely'
import {expectType} from 'tsd'
import {
  DEFAULT_DATA_SET,
  SUPPORTED_DIALECTS,
  dropDatabase,
  expect,
  initTest,
  seedDatabase,
  type PerDialect,
  type TestContext,
} from './test-setup'

for (const dialect of SUPPORTED_DIALECTS) {
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

    it('should be able to perform select queries', async () => {
      const knexPeople = await ctx.knex.from('person').select('*')

      const kyselyPeople = await ctx.kysely.selectFrom('person').selectAll().execute()

      expect(kyselyPeople).to.deep.equal(knexPeople)
      expectType<typeof knexPeople>(kyselyPeople)
    })

    it('should be able to perform insert queries', async () => {
      const result = await ctx.kysely.insertInto('person').values({gender: 'female'}).executeTakeFirstOrThrow()

      expect(result).to.deep.equal(
        (
          {
            'better-sqlite3': {
              insertId: BigInt(DEFAULT_DATA_SET.length + 1),
              numInsertedOrUpdatedRows: BigInt(1),
            },
            mssql: {insertId: undefined, numInsertedOrUpdatedRows: undefined},
            mysql: {
              insertId: BigInt(DEFAULT_DATA_SET.length + 1),
              numInsertedOrUpdatedRows: BigInt(1),
            },
            mysql2: {
              insertId: BigInt(DEFAULT_DATA_SET.length + 1),
              numInsertedOrUpdatedRows: BigInt(1),
            },
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
            mssql: new UpdateResult(BigInt(0), undefined),
            mysql: new UpdateResult(BigInt(1), BigInt(1)),
            mysql2: new UpdateResult(BigInt(1), BigInt(1)),
            pg: new UpdateResult(BigInt(1), undefined),
            sqlite3: new UpdateResult(BigInt(0), undefined),
          } satisfies PerDialect<{[K in keyof UpdateResult]: UpdateResult[K]}>
        )[dialect],
      )
    })

    if (dialect === 'better-sqlite3' || dialect === 'pg' || dialect === 'sqlite3') {
      it('should be able to perform update queries with returning', async () => {
        const result = await ctx.kysely
          .updateTable('person')
          .set({marital_status: 'widowed'})
          .where('id', '=', 1)
          .returning(['gender'])
          .executeTakeFirstOrThrow()

        expect(result).to.deep.equal({gender: DEFAULT_DATA_SET[0].gender})
      })
    }

    it('should be able to perform delete queries', async () => {
      const result = await ctx.kysely.deleteFrom('person').where('id', '=', 1).executeTakeFirstOrThrow()

      expect(result).to.deep.equal(
        (
          {
            'better-sqlite3': {numDeletedRows: BigInt(1)},
            mssql: {numDeletedRows: BigInt(0)},
            mysql: {numDeletedRows: BigInt(1)},
            mysql2: {numDeletedRows: BigInt(1)},
            pg: {numDeletedRows: BigInt(1)},
            sqlite3: {numDeletedRows: BigInt(0)},
          } satisfies PerDialect<{[K in keyof DeleteResult]: DeleteResult[K]}>
        )[dialect],
      )
    })

    if (dialect === 'better-sqlite3' || dialect === 'pg' || dialect === 'sqlite3') {
      it('should be able to perform delete queries with returning', async () => {
        const result = await ctx.kysely
          .deleteFrom('person')
          .where('id', '=', 1)
          .returning('gender')
          .executeTakeFirstOrThrow()

        expect(result).to.deep.equal({gender: DEFAULT_DATA_SET[0].gender})
      })
    }

    it.skip('should be able to stream results', async () => {
      const stream = ctx.kysely.selectFrom('person').selectAll().stream(1)

      // let called = 0
      for await (const chunk of stream) {
        // expect(chunk).to.be.an('array').with.lengthOf(1)
        // called++
      }
      // expect(called).to.equal(DEFAULT_DATA_SET.length)
    })
  })
}

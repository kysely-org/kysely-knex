import knex, {type Knex} from 'knex'
import type {Tables} from 'knex/types/tables'
import {
  Kysely,
  MssqlAdapter,
  MssqlIntrospector,
  MssqlQueryCompiler,
  MysqlAdapter,
  MysqlIntrospector,
  MysqlQueryCompiler,
  PostgresAdapter,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
  type Insertable,
  type KyselyPlugin,
} from 'kysely'
import omit from 'lodash/omit'
import {KyselyKnexDialect, type KyselifyTables, type KyselyKnexDialectConfig, type KyselySubDialect} from '../../src'
import type {SupportedDialect} from '../../src/supported-dialects'
export {expect} from 'chai'

export type Database = KyselifyTables<Tables>

export interface TestContext {
  dialect: SupportedDialect
  knex: Knex
  kysely: Kysely<Database>
}

export type PerDialect<T> = Record<SupportedDialect, T>

const TEST_INIT_TIMEOUT = 5 * 60 * 1000

export const PLUGINS: KyselyPlugin[] = []

const POOL_SIZE = 10

const sqliteSubDialect = {
  createAdapter: () => new SqliteAdapter(),
  createIntrospector: (db) => new SqliteIntrospector(db),
  createQueryCompiler: () => new SqliteQueryCompiler(),
} satisfies KyselySubDialect

export const CONFIGS: PerDialect<
  Omit<KyselyKnexDialectConfig, 'knex'> & {
    knexConfig: Knex.Config
  }
> = {
  'better-sqlite3': {
    kyselySubDialect: sqliteSubDialect,
    knexConfig: {
      client: 'better-sqlite3',
      connection: {
        filename: ':memory:',
      },
      useNullAsDefault: true,
    },
  },
  mssql: {
    kyselySubDialect: {
      createAdapter: () => new MssqlAdapter(),
      createIntrospector: (db) => new MssqlIntrospector(db),
      createQueryCompiler: () => new MssqlQueryCompiler(),
    },
    knexConfig: {
      client: 'mssql',
      connection: {
        database: 'kysely_test',
        host: 'localhost',
        password: 'KyselyTest0',
        pool: {min: 0, max: POOL_SIZE},
        port: 21433,
        userName: 'sa',
        options: {
          trustServerCertificate: true,
          useUTC: true,
        },
      },
    },
  },
  mysql: {
    kyselySubDialect: {
      createAdapter: () => new MysqlAdapter(),
      createIntrospector: (db) => new MysqlIntrospector(db),
      createQueryCompiler: () => new MysqlQueryCompiler(),
    },
    knexConfig: {
      client: 'mysql2',
      connection: {
        bigNumberStrings: true,
        database: 'kysely_test',
        host: 'localhost',
        password: 'kysely',
        pool: {min: 0, max: POOL_SIZE},
        port: 3308,
        supportBigNumbers: true,
        user: 'kysely',
      },
    },
  },
  pg: {
    kyselySubDialect: {
      createAdapter: () => new PostgresAdapter(),
      createIntrospector: (db) => new MysqlIntrospector(db),
      createQueryCompiler: () => new MysqlQueryCompiler(),
    },
    knexConfig: {
      client: 'pg',
      connection: {
        database: 'kysely_test',
        host: 'localhost',
        pool: {min: 0, max: POOL_SIZE},
        port: 5434,
        userName: 'kysely',
        options: {
          useUTC: true,
        },
      },
    },
  },
  sqlite3: {
    kyselySubDialect: sqliteSubDialect,
    knexConfig: {
      client: 'sqlite3',
      connection: {
        filename: ':memory:',
      },
    },
  },
}

export async function initTest(ctx: Mocha.Context, dialect: SupportedDialect): Promise<TestContext> {
  const config = CONFIGS[dialect]

  ctx.timeout(TEST_INIT_TIMEOUT)
  const kneks = await connect(config.knexConfig)
  await createDatabase(kneks)

  const kysely = new Kysely<Database>({
    dialect: new KyselyKnexDialect({
      knex: kneks,
      kyselySubDialect: config.kyselySubDialect,
    }),
    plugins: PLUGINS,
  })

  return {dialect, knex: kneks, kysely}
}

async function connect(config: Knex.Config): Promise<Knex> {
  for (let i = 0; i < TEST_INIT_TIMEOUT; i += 1_000) {
    let kneks: Knex | undefined

    try {
      kneks = knex(config)

      await kneks.raw('SELECT 1')

      return kneks
    } catch (error) {
      console.error(error)

      if (kneks) {
        await kneks.destroy().catch((error) => error)
      }

      console.log('Waiting for the database to become available. Did you remember to run `docker-compose up`?')

      await sleep(1_000)
    }
  }

  throw new Error('could not connect to database')
}

function sleep(millis: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millis))
}

async function createDatabase(knex: Knex): Promise<void> {
  await dropDatabase(knex)

  await knex.schema.createTable('person', (tb) => {
    tb.increments('id', {primaryKey: true})
    tb.string('first_name', 255).nullable()
    tb.string('middle_name', 255).nullable()
    tb.string('last_name', 255).nullable()
    tb.string('gender', 50).notNullable()
    tb.string('marital_status', 50).nullable()
  })

  await knex.schema.createTable('pet', (tb) => {
    tb.increments('id', {primaryKey: true})
    tb.string('name', 255).notNullable().unique()
    tb.integer('owner_id').notNullable().references('person.id').onDelete('cascade').index('pet_owner_id_index')
    tb.string('species', 50).notNullable()
  })

  await knex.schema.createTable('toy', (tb) => {
    tb.increments('id', {primaryKey: true})
    tb.string('name', 255).notNullable()
    tb.double('price').notNullable()
    tb.integer('pet_id').notNullable().references('pet.id')
  })
}

export async function dropDatabase(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('toy')
  await knex.schema.dropTableIfExists('pet')
  await knex.schema.dropTableIfExists('person')
}

export const DEFAULT_DATA_SET: (Insertable<Database['person']> & {
  pets: (Insertable<Omit<Database['pet'], 'owner_id'>> & {
    toys: Insertable<Omit<Database['toy'], 'pet_id'>>[]
  })[]
})[] = [
  {
    first_name: 'Jennifer',
    middle_name: null,
    last_name: 'Aniston',
    gender: 'female',
    pets: [{name: 'Catto', species: 'cat', toys: []}],
    marital_status: 'divorced',
  },
  {
    first_name: 'Arnold',
    middle_name: null,
    last_name: 'Schwarzenegger',
    gender: 'male',
    pets: [{name: 'Doggo', species: 'dog', toys: []}],
    marital_status: 'divorced',
  },
  {
    first_name: 'Sylvester',
    middle_name: 'Rocky',
    last_name: 'Stallone',
    gender: 'male',
    pets: [{name: 'Hammo', species: 'hamster', toys: []}],
    marital_status: 'married',
  },
]

export async function seedDatabase(ctx: TestContext): Promise<void> {
  const personInsertionQuery = ctx.knex('person').insert(DEFAULT_DATA_SET.map((person) => omit(person, 'pets')))
  let personIds: number[]

  if (['better-sqlite3', 'pg', 'mssql', 'sqlite3'].includes(ctx.dialect)) {
    const personIdContainers = await personInsertionQuery.returning('id')

    personIds = personIdContainers.map((container) => container.id)
  } else {
    personIds = await personInsertionQuery
  }

  await ctx
    .knex('pet')
    .insert(
      DEFAULT_DATA_SET.flatMap((person, index) =>
        person.pets.map((pet) => ({...omit(pet, 'toys'), owner_id: personIds[index]})),
      ),
    )
}

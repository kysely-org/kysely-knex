import knex, {type Knex} from 'knex'
import type {Tables} from 'knex/types/tables'
import {Kysely, type Insertable, type KyselyPlugin} from 'kysely'
import omit from 'lodash/omit'
import {
  BetterSQLite3ColdDialect,
  KyselyKnexDialect,
  MSSQLColdDialect,
  MySQL2ColdDialect,
  MySQLColdDialect,
  PGColdDialect,
  SQLite3ColdDialect,
  type KyselifyTables,
  type KyselyKnexDialectConfig,
} from '../..'
import '../tables'
export {expect} from 'chai'

export const SUPPORTED_DIALECTS = [
  'better-sqlite3',
  'mssql',
  'mysql',
  'mysql2',
  'pg',
  'sqlite3',
] as const

export type SupportedDialect = (typeof SUPPORTED_DIALECTS)[number]

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

export const CONFIGS: PerDialect<
  Omit<KyselyKnexDialectConfig, 'knex'> & {
    knexConfig: Knex.Config
  }
> = {
  'better-sqlite3': {
    knexConfig: {
      client: 'better-sqlite3',
      connection: {
        filename: ':memory:',
      },
      pool: {min: 0, max: POOL_SIZE},
      useNullAsDefault: true,
    },
    kyselySubDialect: new BetterSQLite3ColdDialect(),
  },
  mssql: {
    knexConfig: {
      client: 'mssql',
      connection: {
        database: 'kysely_test',
        host: 'localhost',
        password: 'KyselyTest0',
        port: 21433,
        userName: 'sa',
        options: {
          trustServerCertificate: true,
          useUTC: true,
        },
      },
      pool: {min: 0, max: POOL_SIZE},
    },
    kyselySubDialect: new MSSQLColdDialect(),
  },
  mysql: {
    knexConfig: {
      client: 'mysql',
      connection: {
        bigNumberStrings: true,
        database: 'kysely_test',
        host: 'localhost',
        password: 'kysely',
        port: 3308,
        supportBigNumbers: true,
        user: 'kysely',
      },
      pool: {min: 0, max: POOL_SIZE},
    },
    kyselySubDialect: new MySQLColdDialect(),
  },
  mysql2: {
    knexConfig: {
      client: 'mysql2',
      connection: {
        bigNumberStrings: true,
        database: 'kysely_test',
        host: 'localhost',
        password: 'kysely',
        port: 3308,
        supportBigNumbers: true,
        user: 'kysely',
      },
      pool: {min: 0, max: POOL_SIZE},
    },
    kyselySubDialect: new MySQL2ColdDialect(),
  },
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
  sqlite3: {
    knexConfig: {
      client: 'sqlite3',
      connection: {
        filename: ':memory:',
      },
      pool: {min: 0, max: POOL_SIZE},
      useNullAsDefault: true,
    },
    kyselySubDialect: new SQLite3ColdDialect(),
  },
}

export async function initTest(
  ctx: Mocha.Context,
  dialect: SupportedDialect,
): Promise<TestContext> {
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

      await kneks.raw('select 1')

      await kneks.destroy()
      kneks.initialize()

      return kneks
    } catch (error) {
      console.error(error)

      if (kneks) {
        await kneks.destroy().catch((error) => error)
      }

      console.log(
        'Waiting for the database to become available. Did you remember to run `docker-compose up`?',
      )

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
    tb.integer('owner_id')
      .unsigned()
      .notNullable()
      .references('person.id')
      .onDelete('cascade')
      .index('pet_owner_id_index')
    tb.string('species', 50).notNullable()
  })

  await knex.schema.createTable('toy', (tb) => {
    tb.increments('id', {primaryKey: true})
    tb.string('name', 255).notNullable()
    tb.double('price').notNullable()
    tb.integer('pet_id').unsigned().notNullable().references('pet.id')
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
  const personInsertionQuery = ctx
    .knex('person')
    .insert(DEFAULT_DATA_SET.map((person) => omit(person, 'pets')))
  let personIds: number[]

  if (['better-sqlite3', 'pg', 'mssql', 'sqlite3'].includes(ctx.dialect)) {
    const personIdContainers = await personInsertionQuery.returning('id')

    personIds = personIdContainers.map((container) => container.id)
  } else {
    const [firstId] = await personInsertionQuery

    personIds = DEFAULT_DATA_SET.map((_, index) => firstId + index)
  }

  await ctx.knex('pet').insert(
    DEFAULT_DATA_SET.flatMap((person, index) =>
      person.pets.map((pet) => ({
        ...omit(pet, 'toys'),
        owner_id: personIds[index],
      })),
    ),
  )
}

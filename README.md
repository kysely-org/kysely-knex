# kysely-knex

Knex.js (pronounced /kəˈnɛks/) is a "batteries included" SQL query builder for PostgreSQL, CockroachDB, MSSQL, MySQL, MariaDB, SQLite3, Better-SQLite3, Oracle, and Amazon Redshift designed to be flexible, portable, and fun to use. It features both traditional node style callbacks as well as a promise interface for cleaner async flow control, a stream interface, full-featured query and schema builders, transaction support (with savepoints), connection pooling and standardized responses between different query clients and dialects.

As of Mar 29, 2024, Knex has 1,625,784 weekly downloads on npm (3rd most popular SQL library). It is a very popular query builder for Node.js and TypeScript.

Knex IS legendary, but since it was created before TypeScript blew up, it's type capabilities are nothing to write home about. This why Kysely was created.

Kysely (pronounced “Key-Seh-Lee”) is a type-safe and autocompletion-friendly TypeScript SQL query builder. Inspired by Knex. Mainly developed for Node.js but also runs on Deno and in the browser.

kysely-knex is a toolkit (dialect, type translators, etc.) that allows using your existing Knex setup with Kysely. This'll allow you to gradually migrate your codebase from Knex to Kysely.

## Installation

Main dependencies:

```sh
npm install kysely kysely-knex knex
```

PostgreSQL:

```sh
npm install pg pg-query-stream # pg-query-stream is optional, used in .stream() method
```

MySQL:

```sh
npm install mysql2 # or mysql
```

MS SQL Server (MSSQL):

```sh
npm install tedious
```

SQLite:

```sh
npm install better-sqlite3 # or sqlite3
```

## Usage

### Types

If you have already defined your Knex `Tables` interface, you can convert it using
the `KyselifyTables` type:

`src/types/database.ts`:

```ts
import type {Tables} from 'knex/types/tables'
import type {KyselifyTables} from 'kysely-knex'

export type Database = KyselifyTables<Tables>
```

Otherwise, refer to the [Kysely documentation](https://kysely.dev/docs/getting-started#types) for more information.

### Kysley instance

Create a Kysely instance. Pass it your existing Knex instance:

`src/kysely.ts`:

```ts
import {Kysely} from 'kysely'
import {KyselyKnexDialect, PGColdDialect} from 'kysely-knex'
import {knex} from './knex'
import type {Database} from './types/database'

export const kysely = new Kysely<Database>({
  dialect: new KyselyKnexDialect({
    knex,
    kyselySubDialect: new PGColdDialect(),
  }),
})
```

For other dialects, simply swap `PGColdDialect` with `MySQLColdDialect`, `MySQL2ColdDialect`, `MSSQLColdDialect`, `SQLite3ColdDialect` or `BetterSQLite3ColdDialect`.

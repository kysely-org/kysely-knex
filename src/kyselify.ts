import type {Knex} from 'knex'
import type {ColumnType} from 'kysely'

/**
 * Translates Knex's `Tables` interface to Kysely's `Database` interface.
 *
 * @example
 *
 * ```ts
 * import type { Tables } from 'knex/types/tables'
 * import type { KyselifyTables } from 'kysely-knex'
 *
 * export type Database = KyselifyTables<Tables>
 * ```
 */
export type KyselifyTables<T> = {
  [TB in keyof T]: T[TB] extends Knex.CompositeTableType<
    infer S,
    infer I,
    infer U
  >
    ? {
        [C in keyof S]-?: C extends keyof I & keyof U
          ? ColumnType<S[C], I[C], U[C]>
          : C extends keyof U
            ? ColumnType<S[C], never, U[C]>
            : C extends keyof I
              ? ColumnType<S[C], I[C], never>
              : ColumnType<S[C], never, never> // GeneratedAlways<S[C]>
      }
    : {
        [C in keyof T[TB]]-?: undefined extends T[TB][C]
          ? Exclude<T[TB][C], undefined> | null
          : T[TB][C]
      }
}

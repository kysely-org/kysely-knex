import type {Knex} from 'knex'

declare module 'knex/types/tables' {
  interface Person {
    id: number
    first_name: string | null
    middle_name: string | null
    last_name: string | null
    gender: 'male' | 'female' | 'other'
    marital_status: 'single' | 'married' | 'divorced' | 'widowed' | null
  }

  interface Pet {
    id: number
    name: string
    owner_id: number
    species: 'dog' | 'cat' | 'hamster'
  }

  interface Toy {
    id: number
    name: string
    price: number
    pet_id: number
  }

  interface Tables {
    person: Knex.CompositeTableType<
      Person,
      Pick<Person, 'gender'> & Partial<Omit<Person, 'gender'>>,
      Partial<Person>
    >
    pet: Knex.CompositeTableType<
      Pet,
      Omit<Pet, 'id'> & Partial<Pick<Pet, 'id'>>,
      Partial<Pet>
    >
    toy: Knex.CompositeTableType<
      Toy,
      Omit<Toy, 'id'> & Partial<Pick<Toy, 'id'>>,
      Partial<Toy>
    >
  }
}

export function isObject(thing: unknown): thing is object {
  return typeof thing === 'object' && thing !== null && !Array.isArray(thing)
}

export function isString(thing: unknown): thing is string {
  return typeof thing === 'string'
}

export function freeze<T>(obj: T): Readonly<T> {
  return Object.freeze(obj)
}

export function escapeQuestionMarks(str: string): string {
  return str.replace(/([^\\])(?=\?)/g, '$1\\')
}

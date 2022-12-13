const isArray = Array.isArray

const isPrimitive = (a: unknown): a is string | number =>
  typeof a === 'string' || typeof a === 'number'

const camelToDash = (str: string): string =>
  str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

export { isArray, isPrimitive, camelToDash }

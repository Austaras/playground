export const isText = (i: unknown): i is text => typeof i === 'string' || typeof i === 'number'
export const isObject = (i: unknown): i is object => i && typeof i === 'object'
export const isVoid = (i: unknown): i is undefined | null => i === null || i === undefined
export const isEmpty = (i: unknown): i is undefined | null | string =>
    i === null || i === undefined || i === ''

// eslint-disable-next-line @typescript-eslint/unbound-method
export const has = Object.prototype.hasOwnProperty

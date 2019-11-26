export const isText = (i: unknown): i is text => typeof i === 'string' || typeof i === 'number'

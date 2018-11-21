// Singleton pattern in JS, is redundant and stupid
// like many other design patterns.
// I wrote this just to dempnstrate it's possible and convenient

import { Singleton } from './singleton'

const singA = new Singleton()
console.log(singA)
singA.x = 2
const singB = new Singleton()
console.log(singB)

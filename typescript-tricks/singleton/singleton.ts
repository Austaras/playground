export interface Singleton {
    x: number
}
export class Singleton {
    private static instance: Singleton = {
        x: 1
    }
    constructor() {
        return Singleton.instance
    }
}

const my = new Singleton()
my.x = 2
const you = new Singleton()
console.log(you)

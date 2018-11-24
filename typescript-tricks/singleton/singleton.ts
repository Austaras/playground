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

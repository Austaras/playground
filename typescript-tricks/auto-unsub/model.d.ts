interface Services {
    [key: string]: {
        [key: string]: any
        sub: Function
        unsub: Function
        pub: Function
    }
}

interface Warpped {
    _watch?: {
        [key: string]: Function[]
    }
}
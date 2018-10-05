interface Services {
    [key: string]: {
        sub: Function
        unsub: Function
        pub: Function
    }
}

interface Warpped {
    _watch?: Record<string, Function[]>
}

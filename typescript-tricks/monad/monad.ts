import { compose } from './utils'

export abstract class Monad<T> {
    public static of<T>(value: T): Monad<T> {
        return new (this as any)(value)
    }
    public abstract map<U>(fn: (arg: T) => U): any
    public abstract flat(): any
    public flatMap<U>(fn: (arg: T) => U): U {
        return this.map(fn).flat()
    }
}

export class Identity<T> extends Monad<T> {
    private constructor(private value: T) {
        super()
    }
    public map<U>(fn: (arg: T) => U) {
        return Identity.of(fn(this.value))
    }
    public flat() {
        return this.value
    }
}

export class Maybe<T> extends Monad<T> {
    private constructor(private value: T) {
        super()
    }
    private is() {
        return this.value === undefined || this.value === null
    }
    public map<U>(fn: (arg: T) => U): Maybe<U> {
        return this.is() ? this : (Maybe.of(fn(this.value)) as any)
    }
    public flat() {
        return this.is() ? this : this.value
    }
}

class Left<T> extends Monad<T> {
    private constructor(private value: T) {
        super()
    }
    public map<U>(_: (arg: T) => U) {
        return this
    }
    public flat() {
        return this
    }
    public retrive() {
        return this.value
    }
}

const Right = Identity

export function makeEither<T, U>(flag: (arg: T) => boolean, left: U) {
    return {
        name: 'Either',
        of(value: T) {
            return (flag(value) ? Right.of(value) : Left.of(left)) as Monad<T>
        }
    }
}

type isFunc<T> = T extends (...args: any) => any ? T : never

export class IO<T extends () => any, R = ReturnType<T>> extends Monad<R> {
    public static of<R>(value: R) {
        return new this(() => value)
    }
    constructor(private value: T) {
        super()
    }
    public unsafePerformIO = this.value
    public map<U>(fn: (arg: R) => U): IO<() => U> {
        return new IO(compose(
            fn,
            this.value
        ) as () => U)
    }
    public flat(): R {
        return this.unsafePerformIO()
    }
    public apply<R1 extends isFunc<R>>(other: IO<() => Parameters<R1>[number]>): IO<() => ReturnType<R1>> {
        return this.flatMap((fn) => other.map(fn as R1))
    }
}

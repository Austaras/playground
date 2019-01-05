type TupleToUnion<T extends any[]> = T[number]
// this
// this is evil magic, pure evil
type UnionToIntersection<U> =
    (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never
// multiple candidates for the same type variable in contra-variant positions,
// e.g., function arguments, causes an intersection type to be inferred
// but bare type parameters before extends in a conditional type are distributed
// across any union constituents, so we need to pack it into a function

export type test = UnionToIntersection<1 | 2 | 3 | 4> // 1 & 2 & 3 & 4

function CakeFactory<
    T extends Record<string, any>,
    R extends Record<string, (this: T) => any>[]>(
        data: T, ...fns: R):
    T & UnionToIntersection<TupleToUnion<R>> {
    const res = Object.assign(data)
    fns.forEach(fn => Object.entries(fn).forEach(([key, func]) => res[key] = func))
    return res
}

const batman = CakeFactory({
    name: 'Batman',
    secertId: 'Bruce Wayne'
},
    {
        fly() {
            console.log('Bat Wings!')
        },
        isRich() {
            return true
        }
    },
    {
        why() {
            console.log(`Beacuse I'm ${this.name}`)
        }
    }
)

batman.why()
console.log(`is Batman rich? ${batman.isRich() ? 'sure' : 'no'}`)

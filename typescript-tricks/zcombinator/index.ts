// normal recursion
const f = (n: number): number => (n === 0 ? 1 : n * f(n - 1))
console.log(f(10))

type FA<T> = (f: FA<T>) => (n: T) => T
// get recurse body
const fa: FA<number> = f => n => (n === 0 ? 1 : n * f(f)(n - 1))
const F1 = fa(fa)
console.log(F1(10))

type G<T> = (n: T) => T
type FB<T> = (g: G<T>) => G<T>
// lift f(f) out
const fo: FA<number> = f => ((g => n => (n === 0 ? 1 : n * g(n - 1))) as FB<number>)(f(f))
try {
    fo(fo)
} catch {
    console.log('it will overflow, sadly')
}
// js is eager so use η-reduction
const fb: FA<number> = f => ((g => n => (n === 0 ? 1 : n * g(n - 1))) as FB<number>)(n => f(f)(n))
const F2 = fb(fb)
console.log(F2(10))

// lift concrete logic out
const ga: FB<number> = g => n => (n === 0 ? 1 : n * g(n - 1))
type FG = <T>(g: FB<T>) => (f: FA<T>) => G<T>
const fg: FG = g => f => g(n => f(f)(n))
const FG = fg(ga)(fg(ga))
console.log(FG(10))

// λf. (λx.λv. f(x x v))(λx.λv. f(x x v))
const Z = <T>(g: FB<T>) => ((f: FA<T>) => g(n => f(f)(n)))(f => g(n => f(f)(n)))
const ZF = Z(ga),
    FZF = ga(Z(ga))
console.log(ZF(10), FZF(10))

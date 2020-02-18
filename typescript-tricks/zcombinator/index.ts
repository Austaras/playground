// normal recursion
const f = (n: number): number => (n === 0 ? 1 : n * f(n - 1))
console.log(f(10))

type FA = (f: FA) => (n: number) => number
// get recurse body
const fa: FA = f => n => (n === 0 ? 1 : n * f(f)(n - 1))
const F1 = fa(fa)
console.log(F1(10))

type G = (n: number) => number
// lift f(f) out, js is eager so use η-reduction
type FB = (g: G) => G
const fb: FA = f => ((g => n => (n === 0 ? 1 : n * g(n - 1))) as FB)(n => f(f)(n))
const F2 = fb(fb)
console.log(F2(10))

// lift concrete logic out
const ga: FB = g => n => (n === 0 ? 1 : n * g(n - 1))
type FG = (g: FB) => (f: FA) => G
const fg: FG = g => f => g(n => f(f)(n))
const FG = fg(ga)(fg(ga))
console.log(FG(10))

// λf. (λx.λv. f(x x v))(λx.λv. f(x x v))
const Z = (g: FB) => ((f: FA) => g(n => f(f)(n)))(f => g(n => f(f)(n)))
const ZF = Z(ga),
    FZF = ga(Z(ga))
console.log(ZF(10), FZF(10))

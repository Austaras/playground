const f = (n: number): number => (n === 0 ? 1 : n * f(n - 1))
console.log(f(10))

type FA = (f: FA) => (n: number) => number
const fa = (f: FA) => (n: number) => (n === 0 ? 1 : n * f(f)(n - 1))
const F1 = fa(fa)
console.log(F1(10))

type G = (n: number) => number
const fb = (f: FA) => ((g: G) => (n: number) => (n === 0 ? 1 : n * g(n - 1)))(n => f(f)(n))
const F2 = fb(fb)
console.log(F2(10))

const ga = (g: G) => (n: number) => (n === 0 ? 1 : n * g(n - 1))
type GA = typeof ga
const fg = (g: GA) => (f: FA) => g(n => f(f)(n))
const FG = fg(ga)(fg(ga))
console.log(FG(10))

// λf. (λx. f(x x))(λx. f(x x))
const Z = (g: GA) => ((f: FA) => g(n => f(f)(n)))(f => g(n => f(f)(n)))
const FZ = Z(ga), FZ1 = ga(Z(ga)) // ZF = F(ZF)
console.log(FZ(10), FZ1(10))

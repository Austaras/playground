import './spec'
import { IO } from './monad'
import { compose, curry } from './utils'

const map = curry(<T, R>(fn: (arg: T) => R, m: IO<() => T>): IO<() => R> => m.map(fn))

const getInput = (id: string) => new IO(() => document.getElementById(id) as HTMLInputElement)
const getValue = compose(
    map((el: HTMLInputElement) => el.value),
    getInput
)
const getChecked = compose(
    map((el: HTMLInputElement) => el.checked),
    getInput
)

const login = curry((name: string, password: string, remember: boolean) => {
    console.log({ name, password, remember })
})

document.getElementById('submit')!.addEventListener('click', () =>
    IO.of(login)
        .apply(getValue('name'))
        .apply(getValue('password'))
        .apply(getChecked('remember'))
        .unsafePerformIO()
)

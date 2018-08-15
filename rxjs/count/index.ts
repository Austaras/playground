import { fromEvent } from 'rxjs'
import { mapTo, merge, scan } from 'rxjs/operators'

const add = document.querySelector('#add') as HTMLButtonElement
const minus = document.querySelector('#minus') as HTMLButtonElement
const text = document.querySelector('#text') as HTMLParagraphElement

render(0)

const add$ = fromEvent(add, 'click')
const minus$ = fromEvent(minus, 'click')

add$.pipe(
    mapTo(1),
    merge(minus$.pipe(mapTo(-1))),
    scan((acc, val) => acc += val, 0)
).subscribe(val => render(val))

function render(count: number) {
    text.innerText = `Count currently is ${count}`
}

import { fromEvent, merge } from 'rxjs'
import { mapTo, scan, startWith } from 'rxjs/operators'

const add = document.querySelector('#add') as HTMLButtonElement
const minus = document.querySelector('#minus') as HTMLButtonElement
const text = document.querySelector('#text') as HTMLParagraphElement

const add$ = fromEvent(add, 'click')
const minus$ = fromEvent(minus, 'click')

merge(add$.pipe(mapTo(1)), minus$.pipe(mapTo(-1)))
    .pipe(
        startWith(0),
        scan((acc, val) => acc += val)
    )
    .subscribe(val => render(val))

function render(count: number) {
    text.innerText = `Count currently is ${count}`
}

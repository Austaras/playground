import { fromEvent, Observable, timer } from 'rxjs'
import { map, mergeMap, reduce, share, take, takeUntil } from 'rxjs/operators'

const PATTERN = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
]
const TIME_LIMIT_MS = 5000

function arrayEqual(a: any[], b: any[]) {
    if (a.length !== b.length) return false
    for (const i in a) {
        if (a[i] !== b[i]) return false
    }
    return true
}

const timer$ = timer(TIME_LIMIT_MS)
const ele = document.querySelector('body')!
const keydown$ = fromEvent(ele, 'keydown') as Observable<KeyboardEvent>
const keycode$ = keydown$.pipe(
    // should use pluck, but pluck lacks type info
    map(e => e.key),
    share()
)

keycode$.pipe(
    mergeMap(code => keycode$.pipe(
        take(PATTERN.length - 1),
        // it is a cold observable, so will only begin time count when subscribe
        takeUntil(timer$),
        reduce((acc: string[], val: string) => {
            acc.push(val)
            return acc
        }, [code])
    ))
).subscribe(keys => {
    if (arrayEqual(keys, PATTERN)) {
        console.log('%cYay!', 'color: red; font-size: 16px; font-weight: bold')
    } else {
        console.log('not this time')
    }
})

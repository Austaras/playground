import { fromEvent, Observable, timer } from 'rxjs'
import {
    bufferCount, map, mergeMap, reduce, share, take, takeUntil, timestamp
} from 'rxjs/operators'

const PATTERN = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
]
const TIME_LIMIT_MS = 5000

function arrayEqual<T>(a: T[], b: T[]) {
    if (a.length !== b.length) return false
    for (const i in a) {
        if (a[i] !== b[i]) return false
    }
    return true
}

function bonus(keys: string[], no: number) {
    if (arrayEqual(keys, PATTERN)) {
        console.log(`%cLife +30! %cplayer${no}`,
            'color: red; font-size: 16px; font-weight: bold',
            'color: green; font-size: 16px; font-weight: bold')
    } else {
        console.log('not this time')
    }
}

const timer$ = timer(TIME_LIMIT_MS)

// the noob way
const player1 = document.getElementById('pl1')!
const key$ = fromEvent(player1, 'keydown') as Observable<KeyboardEvent>
key$.pipe(
    map(e => e.key),
    timestamp(),
    bufferCount(PATTERN.length, 1)
).subscribe(keys => {
    if (keys[keys.length - 1].timestamp - keys[0].timestamp > TIME_LIMIT_MS) {
        console.log('not this time')
        return
    }
    bonus(keys.map(i => i.value), 1)
})

// the clever way
const player2 = document.getElementById('pl2')!
const keydown$ = fromEvent(player2, 'keydown') as Observable<KeyboardEvent>
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
).subscribe(keys => bonus(keys, 2))

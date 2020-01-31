import { fromEvent, merge, zip } from 'rxjs'
import { distinctUntilChanged, map, mapTo, mergeMap, partition, scan, share, startWith } from 'rxjs/operators'

import { getData, User } from './api'

interface Status {
    data: User[]
    slots: number[]
}

const refresh = document.getElementById('refresh')!
const close = Array.from(document.getElementsByClassName('close')) as HTMLAnchorElement[]

const refresh$ = fromEvent(refresh, 'click').pipe(mapTo([0, 1, 2]))
const close$ = close.map((ele, ind) => fromEvent(ele, 'click').pipe(mapTo([ind])))

const userSuggest$ = merge(refresh$, ...close$).pipe(
    share(),
    // should use publish & refcount here beacuse there's no need to
    // create new subject when source completed and new observer subscribe it
    // but since source won't compelte for simpilicity I just use share
    startWith([0, 1, 2]),
    scan(
        (acc: Status, val: number[]) => {
            acc.slots = Object.assign(acc.slots, val)
            return acc
        },
        { data: [], slots: [] }
    )
)

const [needMoreData$, enoughData$] = partition(
    (suggest: Status) => suggest.data.length < suggest.slots.length
)(userSuggest$)

const moreData$ = needMoreData$.pipe(
    map(status => status.data),
    // in case new event happened when old request hasn't completed
    distinctUntilChanged(),
    scan((_acc, _val, index) => index, 0),
    mergeMap(getData)
    // for more generic use, switchMap is better because we don't care old data
    // but here mergeMap will be fine
)

const dataSupplied$ = zip(needMoreData$, moreData$).pipe(
    map(([status, users]) => {
        status.data = status.data.concat(users)
        return status
    })
)

merge(dataSupplied$, enoughData$)
    .pipe(
        map(status => {
            // map [1] to [empty, user, empty]
            const ret: User[] = []
            while (status.slots.length !== 0) {
                ret[status.slots.shift()!] = status.data.shift()!
            }
            return ret
        }),
        scan((acc, val) => Object.assign(acc, val))
    )
    .subscribe(render)

const links: HTMLAnchorElement[] = Array.from(document.querySelectorAll('.username'))
const avatars: HTMLImageElement[] = Array.from(document.querySelectorAll('.avatar'))
function render(users: User[]) {
    users.map((user, ind) => {
        links[ind].href = user.html_url
        links[ind].innerText = user.login
        avatars[ind].src = user.avatar_url
    })
}

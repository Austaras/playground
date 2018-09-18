import { fromEvent, merge, Observable, zip } from 'rxjs'
import { filter, map, mapTo, mergeMap, partition, scan, startWith, tap } from 'rxjs/operators'

import { getData, User } from './api'

interface Status {
    data: User[],
    slots: number[],
    pending: boolean
}

const refresh = document.getElementById('refresh') as HTMLAnchorElement
const close = Array.from(document.getElementsByClassName('close')) as HTMLAnchorElement[]

const refresh$ = fromEvent(refresh, 'click').pipe(mapTo([0, 1, 2]))
const close$ = close.map((ele, ind) => fromEvent(ele, 'click').pipe(mapTo([ind])))

const userSuggest$ = merge(refresh$, ...close$).pipe(
    startWith([0, 1, 2]),
    scan((acc: Status, val: number[]) => {
        acc.slots = Object.assign(acc.slots, val)
        return acc
    }, { data: [], slots: [], pending: false } as Status)
)

const [needMoreData$, enoughData$] =
    partition((suggest: Status) =>
        suggest.data.length < suggest.slots.length)
        (userSuggest$)

// here I have to mannually label type of moreData$
// beacuse https://github.com/Microsoft/TypeScript/issues/20305
const moreData$: Observable<User[]> = needMoreData$.pipe(
    filter(suggest => !suggest.pending),
    tap(suggest => suggest.pending = true),
    // in case new click happened when old request hasn't completed
    scan((_acc, _val, index) => index, 0),
    mergeMap(ind => getData(ind))
    // for more generic use, switchMap is better because we don't care old data
    // but here mergeMap will be fine
)

const dataSupplied$ = zip(needMoreData$, moreData$, (status, users) => {
    status.data = status.data.concat(users)
    status.pending = false
    return status
})

merge(dataSupplied$, enoughData$).pipe(
    map(status => {
        const ret: User[] = []
        while (status.slots.length !== 0) {
            ret[status.slots.shift()!] = status.data.shift()!
        }
        return ret
    }), // map [1] to [empty, user, empty]
    scan((acc, val) => Object.assign(acc, val))
).subscribe(data => render(data))

const links: HTMLAnchorElement[] =
    Array.from(document.querySelectorAll('.username'))
const avatars: HTMLImageElement[] =
    Array.from(document.querySelectorAll('.avatar'))
function render(users: User[]) {
    users.map((user, ind) => {
        links[ind].href = user.html_url
        links[ind].innerText = user.login
        avatars[ind].src = user.avatar_url
    })
}

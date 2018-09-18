import { fromEvent, merge, Observable, zip } from 'rxjs'
import { map, mapTo, mergeMap, partition, scan, startWith } from 'rxjs/operators'

import { getData, User } from './api'

interface Status {
    data: User[],
    slots: number[]
}

const refresh = document.getElementById('refresh') as HTMLAnchorElement
const close = Array.from(document.getElementsByClassName('close')) as HTMLAnchorElement[]

const refresh$ = fromEvent(refresh, 'click').pipe(mapTo([0, 1, 2]))
const close$ = close.map((ele, ind) => fromEvent(ele, 'click').pipe(mapTo([ind])))

const userSuggest$ = merge(refresh$, ...close$).pipe(
    startWith([0, 1, 2]),
    scan((acc: Status, val: number[]) => {
        acc.slots = val
        return acc
    }, { data: [], slots: [] } as Status)
)

const [needMoreData$, enoughData$] =
    partition((suggest: Status) => suggest.data.length < suggest.slots.length)
        (userSuggest$)

const moreData$: Observable<User[]> = needMoreData$.pipe(
    scan((_acc, _val, index) => index, 0),
    mergeMap(ind => getData(ind))
)

const dataSupplied$ = zip(needMoreData$, moreData$, (status, users) => {
    status.data = status.data.concat(users)
    return status
})

merge(dataSupplied$, enoughData$).pipe(
    map(status =>
        status.slots.reduce((acc, val) => {
            acc[val] = status.data.shift()!
            return acc
        }, [] as User[])
    ),
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

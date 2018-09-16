import { fromEvent, merge } from 'rxjs'
import { mapTo, mergeMap, scan, startWith } from 'rxjs/operators'

import { getData, User } from './api'

const refresh = document.getElementById('refresh') as HTMLAnchorElement
const close = Array.from(document.getElementsByClassName('close')) as HTMLAnchorElement[]

const refresh$ = fromEvent(refresh, 'click').pipe(mapTo([0, 1, 2]))
const close$ = close.map((ele, ind) => fromEvent(ele, 'click').pipe(mapTo([ind])))

merge(refresh$, ...close$).pipe(
    startWith([0, 1, 2]),
    mergeMap(ind => getData(ind)),
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

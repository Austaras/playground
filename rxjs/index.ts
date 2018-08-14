import { AsyncSubject } from 'rxjs'

const subject = new AsyncSubject()

let i = 0
const handle = setInterval(function() {
    subject.next(i)
    if (++i > 3) {
        subject.complete()
        clearInterval(handle)
    }
}, 500)

subject.subscribe(
    x => {
        console.log('Next: ' + x.toString(), performance.now())
    })

setTimeout(() => {
    console.log(performance.now())
    subject.subscribe(
        x => {
            console.log('Next: ' + x.toString(), performance.now())
        })
}, 3000)

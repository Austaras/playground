import { AsyncSubject } from "rxjs"

const subject = new AsyncSubject()

let i = 0;
const handle = setInterval(function() {
    subject.next(i)
    if (++i > 3) {
        subject.complete()
        clearInterval(handle)
    }
}, 500)

const subscription = subject.subscribe(
    x => {
        console.log("Next: " + x.toString());
    },
    err => {
        console.log("Error: " + err)
    },
    () => {
        console.log("Completed")
    })

setTimeout(() => {
    const subscription1 = subject.subscribe(
        x => {
            console.log("Next: " + x.toString());
        },
        err => {
            console.log("Error: " + err)
        },
        () => {
            console.log("Completed")
        })
}, 3000)

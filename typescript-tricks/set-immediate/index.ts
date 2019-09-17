interface Callback {
    handler: Function
    args?: any[]
}

let id = 0
const flag = '__SET_IMMEDIATE_MESSAGE__'
const callbacks: Record<number, Callback> = {}

function setImmediate<Args extends any[]>(handler: (...args: Args) => void, ...args: Args): number {
    callbacks[id] = { handler }
    if (args) {
        callbacks[id].args = args
    }
    window.postMessage(flag + id, location.origin)
    return id++
}

function clearImmediate(num: number) {
    delete callbacks[num]
}

window.setImmediate = window.setImmediate
    ? window.setImmediate
    : (() => {
          window.addEventListener('message', event => {
              if (typeof event.data !== 'string' || event.source !== window) {
                  return
              }
              const f = event.data.slice(0, flag.length)
              const i = +event.data.slice(flag.length)
              if (f === flag && callbacks[i]) {
                  if (callbacks[i].args) {
                      callbacks[i].handler(...callbacks[i].args!)
                  } else {
                      callbacks[i].handler()
                  }
                  delete callbacks[i]
              }
          })
          return setImmediate
      })()

window.clearImmediate = window.clearImmediate ? window.clearImmediate : clearImmediate

setTimeout(() =>
    console.log(
        `The main reason of not using setTimeout is
it's more unpredictable and has a 1ms minimum delay in Chrome.
setImmediate will put callback immediately to task queue so it will always be excuted
earlier than setTimeout`
    )
)

setImmediate(() => console.log(0))
setImmediate(() => console.log(1))
setImmediate(i => console.log(i), 2) // you can doesn't mean you should
const cancel = setImmediate(() => 'do something bad!')
clearImmediate(cancel)
setImmediate(() => console.log("no you don't"))

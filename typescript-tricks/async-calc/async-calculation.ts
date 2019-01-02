interface Task {
    data: Record<string, any>
    resolve: Function
    reject: Function
}

type CopyableSimple = number | string | boolean | undefined | null | void
    | Date | Blob | RegExp
interface CopyableObject {
    [key: string]: CopyableSimple | CopyableComplex
}
interface CopyableArray extends Array<Copyable> { }
interface CopyableMap extends Map<Copyable, Copyable> { }
interface CopyableSet extends Set<Copyable> { }
type CopyableComplex =
    CopyableObject | CopyableArray | CopyableMap | CopyableSet
type Copyable = CopyableSimple | CopyableComplex

class AsyncWorker {
    private worker = new Worker('./worker.ts')
    private task?: Task
    public idle = true
    constructor(
        private queue: Task[],
    ) {
        this.worker.onmessage = event => {
            if (this.task) {
                this.task.resolve(event.data)
                this.final()
            }
        }
        this.worker.onerror = event => {
            if (this.task) {
                this.task.reject(event)
                this.final()
            }
        }
    }
    private final() {
        this.idle = true
        this.task = undefined
        // check if has pending tasks
        this.work()
    }
    public work() {
        if (this.queue.length !== 0) {
            this.idle = false
            const work = this.queue.shift()!
            this.task = work
            this.worker.postMessage(work.data)
        }
    }
}
export class AsyncCalculation {
    private workers: AsyncWorker[]
    // because tasks are finished in uncertain order
    private queue: Task[] = []
    constructor(
        private concurrency: number // because I can
    ) {
        if (concurrency < 1) {
            throw new Error('worker number cannot be less than one')
        }
        this.workers = [new AsyncWorker(this.queue)]
    }
    private dispatch(data: Record<string, any>) {
        const promise = new Promise((resolve, reject) => {
            this.queue.push({
                data, reject, resolve
            })
        })
        let worker = this.workers.find(worker => worker.idle)
        if (worker !== undefined) {
            worker.work()
            return promise
        }
        if (this.workers.length < this.concurrency) {
            // then check if worker number has reached limit
            // if no, create new worker and use it
            worker = new AsyncWorker(this.queue)
            this.workers.push(worker)
            worker.work()
            return promise
        }
        // wait untill some worker picked this work
        return promise
    }
    public async calc<T extends Copyable[], R extends Copyable>(
        func: (this: undefined, ...args: T) => R, ...args: T
    ): Promise<R> {
        return this.dispatch({
            funcStr: func.toString(),
            name: func.name,
            args
        }) as Promise<R>
    }
}

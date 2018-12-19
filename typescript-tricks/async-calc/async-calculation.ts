interface Task {
    data: Record<string, any>
    resolve: Function
    reject: Function
}

class AsyncWorker {
    private worker = new Worker('./worker.ts')
    private task: Task
    public idle = true
    constructor(
        private queue: Set<Task>,
    ) {
        this.worker.onmessage = event => {
            this.task.resolve(event.data)
            this.final()
        }
        this.worker.onerror = event => {
            this.task.reject(event)
            this.final()
        }
    }
    private final() {
        this.idle = true
        // check if has pending tasks
        this.work()
    }
    public work() {
        if (this.queue.size !== 0) {
            this.idle = false
            const work = this.queue.values().next().value
            this.task = work
            this.queue.delete(work)
            this.worker.postMessage(work.data)
        }
    }
}
export class AsyncCalculation {
    private workers: AsyncWorker[]
    // because tasks are finished in uncertain order
    private queue = new Set<Task>()
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
            this.queue.add({
                data, reject, resolve
            })
        })
        for (const worker of this.workers) {
            // if a worker is idle, use it first
            if (worker.idle) {
                worker.work()
                return promise
            }
        }
        if (this.workers.length < this.concurrency) {
            // then check if worker number has reached limit
            // if no, create new worker and use it
            this.workers.push(new AsyncWorker(this.queue))
            const worker = this.workers[this.workers.length - 1]
            worker.work()
            return promise
        }
        // wait untill some worker picked this work
        return promise
    }
    public async calc<T extends Array<any>, R>(
        func: (...args: T) => R, ...args: T
    ): Promise<R> {
        return this.dispatch({
            funcStr: func.toString(),
            name: func.name,
            args
        }) as Promise<R>
    }
}

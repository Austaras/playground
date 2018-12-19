export class PromisifyWorker {
    private worker = new Worker('./worker.ts')
    private resolveQueue: Function[] = []
    private rejectQueue: Function[] = []
    constructor() {
        this.worker.onmessage = event => this.onMessage(event.data)
        this.worker.onerror = event => this.onErroe(event)
    }
    private onMessage(data: any) {
        if (this.resolveQueue.length !== 0 ) {
            const resolve = this.resolveQueue.shift()!
            resolve(data)
        }
    }
    private onErroe(event: ErrorEvent) {
        if (this.rejectQueue.length !== 0 ) {
            const reject = this.resolveQueue.shift()!
            reject(event)
        }
    }
    public async calc<T extends Array<any>, R>(
        func: (...args: T) => R, ...args: T
    ): Promise<R> {
        this.worker.postMessage({
            funcStr: func.toString(),
            name: func.name,
            args
        })
        return new Promise<R>((resolve, reject) => {
            this.resolveQueue.push(resolve)
            this.rejectQueue.push(reject)
        })
    }
}

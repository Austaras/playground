export class BasicService {
    private watch: Function[] = []
    sub(f: Function) {
        this.watch.push(f)
    }
    unsub(f: Function) {
        this.watch = this.watch.filter((i) => i !== f)
    }
    pub() {
        console.log("published by", this.constructor.name)
        this.watch.forEach((f) => f())
    }
}
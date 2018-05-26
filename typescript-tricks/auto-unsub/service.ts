export class BasicService {
    private watch: Function[] = []
    public sub(f: Function) {
        this.watch.push(f)
    }
    public unsub(f: Function) {
        this.watch = this.watch.filter((i) => i !== f)
    }
    public pub() {
        console.log("published by", this.constructor.name)
        this.watch.forEach((f) => f())
    }
}

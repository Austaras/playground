export class BasicService {
    private watch: Function[] = []
    public sub(f: Function) {
        this.watch.push(f)
    }
    public unsub(f: Function) {
        this.watch = this.watch.filter(i => i !== f)
    }
    public pub() {
        console.log(`%cpublished by ${this.constructor.name}`, 'color: green')
        this.watch.forEach(f => f())
    }
}

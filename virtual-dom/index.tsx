import { h } from './h'
import { render } from './render'

const root = document.getElementById('root')!
const long = new Array(1000).fill(0)
const getColor = (num: number) => {
    if (num === 500) return 'blue'
    if (num < 500) return 'red'
    return 'green'
}
const App = (arr: number[]) => (
    <div>
        <h1 title='test' style={{ color: getColor(arr.length), fontWeight: 'normal' }}>
            <i>Hello VDOM</i>
            Hello VDOM
            <b>Hello VDOM</b>
        </h1>
        <h2 className='test'>asdasd</h2>
        <div className='number'>
            <span>This is a long number, 1</span>
            {arr.map((_, i) => (i % 2 === 0 ? <span>{i % 10}</span> : null))}
        </div>
    </div>
)
render(App(long), root)

setTimeout(() => render(App(long.slice(0, 100)), root), 1000)

setTimeout(() => render(App(long.concat(long)), root), 3000)

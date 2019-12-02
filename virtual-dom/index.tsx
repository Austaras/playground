import { h, render, useState } from './lib'

const root = document.getElementById('root')!
const long = new Array(500).fill(0)
const getColor = (num: number) => {
    if (num === 500) return 'blue'
    if (num < 500) return 'red'
    return 'green'
}

const Counter = () => {
    const [count, setCount] = useState(0)
    return (
        <div>
            <div>{count}</div>
            <button onClick={() => setCount(count + 1)}>+</button>
            <button onClick={() => setCount(c => c - 1)}>-</button>
        </div>
    )
}

interface Props {
    arr: number[]
}
const App = ({ arr }: Props) => (
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

render([<App arr={long} />, <Counter />], root)

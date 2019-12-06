import { Component, h, render, useEffect, useState } from './lib'

const getColor = (num: number) => {
  if (num === 500) return 'blue'
  if (num < 500) return 'red'
  return 'green'
}

interface CounterProps {
  init?: number
  multi?: number
}
const Counter = ({ init = 0, multi = 1 }: CounterProps) => {
  const [count, setCount] = useState(init)
  const [readonly, setRead] = useState(false)
  return (
    <div>
      {count}
      <input type='checkbox' value={readonly} onChange={() => setRead(!readonly)} title='readonly' />
      <button onClick={() => !readonly && setCount(count + multi)}>+</button>
      <button onClick={() => !readonly && setCount(c => c - multi)}>-</button>
    </div>
  )
}

class Hello extends Component {
  public state = {
    name: 'React'
  }
  public render() {
    return (
      <div>
        <label>Hello, {this.state.name}</label>
        <br />
        <input
          value={this.state.name}
          onInput={e =>
            this.setState({
              name: e.target.value
            })
          }
        />
      </div>
    )
  }
}

function App({ long }: { long: number[] }) {
  const [arr, setArr] = useState(long)
  useEffect(() => setTimeout(() => setArr(long.slice(0, 100)), 1500), [setArr])
  useEffect(() => setTimeout(() => setArr(long.concat(long)), 3000), [setArr])
  return (
    <div className={arr.length.toString()}>
      <h1 title='test' style={{ color: getColor(arr.length), fontWeight: 'normal' }}>
        <i>Hello VDOM</i>
        Hello VDOM
        <b>Hello VDOM</b>
      </h1>
      <h2 className='test'>asdasd</h2>
      <div className='number'>
        <span>This is a long number, 1{arr.map((_, i) => (i % 2 === 0 ? i % 10 : null))}</span>
      </div>
      <Counter />
      <Counter init={100} multi={10} />
      <Hello />
    </div>
  )
}

render(<App long={new Array(500).fill(0)} />, document.getElementById('root')!)

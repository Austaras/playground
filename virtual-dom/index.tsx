import { h } from './h'
import { render } from './render'

const root = document.getElementById('root')!
const App = (
    <div>
        <h1 title='test' style={{ color: 'red', fontWeight: 'normal' }}>
            <i>Hello VDOM</i>
            Hello VDOM
            <b>Hello VDOM</b>
        </h1>
        <h2></h2>
    </div>
)
render(App, root)

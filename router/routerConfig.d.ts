import { Component } from "./component"

interface Route {
    path: string
    content: Component
    keepAlive?: boolean
}
interface RouterConfig {
    legacy?: boolean
    routes: Array<Route>
}
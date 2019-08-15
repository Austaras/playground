import { Component } from './component'

interface RouterConfig {
    legacy?: boolean
    routes: Array<Route>
}

interface BaseRoute {
    path: string
    match?: 'full' | 'prefix'
}

interface RedirectRoute extends BaseRoute {
    redirect: string
}

interface CompRoute extends BaseRoute {
    content: new (...args: any[]) => Component
    keepAlive?: boolean
    children?: Array<Route>
}

type Route = RedirectRoute | CompRoute

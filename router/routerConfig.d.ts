import { Component } from "./component"

interface RouterConfig {
    legacy?: boolean
    routes: Array<Route>
}

interface Route {
    path: string

    redirect?: string,
    match?: "full" | "prefix"

    content?: { new(...args: any[]): Component }
    keepAlive?: boolean
    children?: Array<Route>
}
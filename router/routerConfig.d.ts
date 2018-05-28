interface RouterConfig {
    legacy?: boolean
    routes: Array<Route>
}

interface Route {
    path: string

    redirect?: string,
    match?: "full" | "prefix"

    content?: { new(): IComponent }
    keepAlive?: boolean
    children?: Array<Route>
}

interface IComponent {
    element: Element
}
interface RouterConfig {
    legacy?: boolean
    routes: Array<Route>
}

interface Route {
    path: string

    redirect: string,
    match: "full" | "prefix"

    content: { new(): Object }
    keepAlive?: boolean
    children?: Array<Route>
}
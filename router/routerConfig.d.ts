interface route {
    path: string
    content: any
    keepAlive?: boolean
}
interface RouterConfig {
    legacy?: boolean
    routes: Array<route>
}
interface IntRoute extends Route {
    cache?: Element
}

export class Router {
    private routes: IntRoute[] = []
    private view: Element
    private base: string // TODO: handle base href
    private current: IntRoute = { path: "" }

    constructor(init: RouterConfig) {
        this.routes = init.routes
        this.procHtml()
        window.addEventListener("popstate", e => {
            e.preventDefault()
            this.match(this.parsePath(location.pathname))
        })
        this.match(this.parsePath(location.pathname))
    }

    private match(paths: string[]) {
        let needRedirect = false

        let res
        for (const key in paths) {
            do {
                for (const route of this.routes) {
                    if (paths[key] === route.path) {
                        res = route
                        break
                    }
                    if (route.path === "**") res = route
                }
                if (res && res.redirect) {
                    paths[key] = res.redirect
                    needRedirect = true
                }
            } while (!res || res.redirect)
        }
        if (res && res.content) {
            const ele = res.cache || new res.content().element
            res.cache = ele
            this.setView(ele)
            if (!this.current.keepAlive) {
                this.current.cache = undefined
            }
            this.current = res
        } else {
            console.error("You are doomed!")
        }
        if (needRedirect) {
            history.replaceState(null, undefined, this.genPath(paths))
        }
    }

    private parsePath(pathStr: string) {
        const paths = pathStr.split("/")
        if (pathStr[0] === "/") {
            paths.shift()
            return paths
        }
        paths.pop()
        const to = pathStr.split("/")
        to.forEach(path => {
            path === ".." ? paths.pop() : paths.push(path)
        })
        if (paths.length === 0) paths.push("")
        return paths
    }

    private genPath(paths: string[]) {
        return "/" + paths.join("/")
    }

    private procHtml() {
        this.base = document.getElementsByTagName("base")[0].href
        const links = Array.from(document.querySelectorAll("a"))
        links.forEach(item => {
            const to = item.getAttribute("route-to")
            if (!to) return // is a normal <a> tag
            // make my <a> tags look like normal a tags
            item.removeAttribute("route-to")
            item.href = to
            item.onclick = e => {
                e.preventDefault()
                this.match(this.parsePath(to))
                history.pushState(null, undefined, to)
            }
        })
        const view = document.querySelector("router-view")
        if (view) {
            this.view = view
            this.setView(document.createElement("div")) // make template a legal html
        }
    }

    private setView(ele: Element) {
        const parent = this.view.parentElement as HTMLElement
        parent.replaceChild(ele, this.view)
        this.view = ele
    }

    public to(pathStr: string) {
        const paths = this.parsePath(pathStr)
        this.match(paths)
        history.replaceState(null, undefined, "/" + paths.join(""))
    }

    public setData(data: { [key: string]: number | string | boolean }) {
        const dataStr = "?" + Object.entries(data).map(
            ([key, value]) => key + "=" + value)
            .join("&")
        history.replaceState(null, undefined, location.pathname + dataStr)
    }

    public back(distance?: number) {
        history.back(distance)
    }

    public forward(distance?: number) {
        history.forward(distance)
    }
}

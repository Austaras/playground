interface IntRoute extends Route {
    cache?: Element
}

export class Router {
    private routes: IntRoute[] = []
    private view: Element
    private base: string // TODO: handle base href

    constructor(init: RouterConfig) {
        this.routes = init.routes
        this.procHtml()
        window.addEventListener("popstate", e => {
            e.preventDefault()
            this.match(location.pathname)
        })
        this.match(location.pathname)
    }

    private match(pathStr: string) {
        console.log(pathStr)
        let needRedirect = false
        if (pathStr[0] === "/") {
            // is absolute route
        } else {
            pathStr = location.pathname + pathStr
        }
        pathStr = pathStr.slice(1)
        const paths = pathStr.split("/")

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
        if (res) {
            if (res.content) {
                const ele = res.cache || new res.content().element
                this.setView(ele)
            }
        }
        if (needRedirect) {
            history.replaceState(null, undefined, "/" + paths.join("/"))
        }
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
                this.match(to)
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

    // public to() {
    // }

    // public setData() {

    // }

    public back(distance?: number) {
        history.back(distance)
    }

    public forward(distance?: number) {
        history.forward(distance)
    }
}

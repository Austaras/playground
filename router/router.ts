import { Component } from "./component"

type intRoute = Route & {
    cache?: Component
}

export class Router {
    private routes: { [path: string]: intRoute } = {}
    private view: Element
    private current: string

    constructor(init: RouterConfig) {
        init.routes.forEach(route => this.routes[route.path] = route)
        this.procHtml()
        this.handelPopState()
        const current = "/" + this.match(location.pathname).path
        this.setView(this.match(location.pathname))

    }

    private stripSlash(str: string) {
        if (str[0] === "/") return str.slice(1)
        return str
    }

    private match(pathStr: string) {
        console.log(pathStr)
        const path = pathStr.split("/")
        let res = this.routes[0]
        for (const name of path) {
            if (name === "") continue
            res = this.routes[name]
        }
        return res
    }

    private procHtml() {
        const links = Array.from(document.querySelectorAll("a"))
        links.forEach(item => {
            const to = item.getAttribute("route-to")
            if (!to) return // is a normal <a> tag
            // make my <a> tags look like normal a tags
            item.removeAttribute("route-to")
            item.href = to
            item.onclick = e => {
                e.preventDefault()
                this.setView(this.match(to))
                history.pushState(null, undefined, to)
            }
        })
        const view = document.querySelector("router-view")
        if (view) {
            this.view = view
            // this.setView(document.createElement("div")) // make template a legal html
        }
    }

    private handelPopState() {
        window.addEventListener("popstate", e => {
            this.setView(this.match(location.pathname))
        })
    }

    private setView(route: intRoute) {
        const parent = this.view.parentElement as HTMLElement
        if (!route.cache) {
            route.cache = new route.content() as Component
        }
        parent.replaceChild(route.cache.element, this.view)
        this.view = route.cache.element
    }

    public to() {
    }

    public setData() {

    }

    public back(distance?: number) {
        history.back(distance)
    }

    public forward(distance?: number) {
        history.forward(distance)
    }
}

import { CompRoute, RedirectRoute, RouterConfig } from './routerConfig'

interface IntCompRoute extends CompRoute {
    parent?: IntCompRoute
    cache?: Element
}

type IntRoute = RedirectRoute | IntCompRoute

function randomStr() {
    return Math.random()
        .toString(36)
        .substring(2, 15)
}

export class Router {
    private routes: IntRoute[] = []
    // inited in function call in constructor, ts couldn't recognize by now
    private view!: Element
    private base!: string[]
    private current: IntRoute = { path: '' } as any

    constructor(init: RouterConfig) {
        this.routes = init.routes
        this.parseHtml()
        window.addEventListener('popstate', e => {
            e.preventDefault()
            this.match(this.parsePath(location.pathname))
        })
        this.match(this.parsePath(location.pathname).slice(this.base.length))
        // remove base
    }

    private match(paths: string[]): void {
        let needRedirect = false
        const segs = paths.length === 0 ? [''] : paths.slice(0)
        const redirect: string[] = []
        segs.reverse()

        let res: IntRoute | undefined
        let { routes } = this
        while (segs.length > 0) {
            const path = segs.pop()!
            redirect.push(path)
            res = undefined
            for (const route of routes) {
                if (path === route.path) {
                    res = route
                    break
                }
                if (route.path === '**') res = route
            }
            if (res) {
                if ('redirect' in res) {
                    segs.push(res.redirect)
                    redirect.pop()
                    needRedirect = true
                } else {
                    routes = res.children ?? []
                }
            } else {
                segs.push(randomStr())
                segs.reverse()
                return this.match(segs)
            }
        }
        if (res && 'content' in res) {
            const ele = res.cache ?? new res.content().element
            res.cache = ele
            this.setView(ele)
            if ('keepAlive' in this.current && !this.current.keepAlive) {
                this.current.cache = undefined
            }
            this.current = res
        } else {
            console.error('You are doomed!')
        }
        if (needRedirect) {
            history.replaceState(null, '', this.genPath(redirect))
        }
    }

    private parsePath(pathStr: string) {
        const paths = pathStr.split('/')
        // absolute path
        if (pathStr.startsWith('/')) {
            return paths.slice(1)
        }
        // relative path
        const to = location.pathname.split('/').slice(this.base.length + 1, -1)
        paths.forEach(path => (path === '..' ? to.pop() : to.push(path)))
        if (to.length === 0) to.push('')
        return to
    }

    private genPath(paths: string[]) {
        return this.base.join('/') + '/' + paths.join('/')
    }

    private parseHtml() {
        const base = document.getElementsByTagName('base')[0]
        if (base) {
            const baseHref = (base.getAttribute('href') ?? '/').split('/')
            baseHref.shift()
            this.base = baseHref
        } else {
            this.base = []
        }
        const links = Array.from(document.querySelectorAll('a'))
        links.forEach(item => {
            const to = item.getAttribute('route-to')
            if (!to) return // is a normal <a> tag
            // make my <a> tags look like normal a tags
            item.removeAttribute('route-to')
            const paths = this.parsePath(to)
            item.href = [...this.base, ...paths].join('/')
            item.onclick = e => {
                e.preventDefault()
                this.match(paths)
                this.to(to)
            }
        })
        const view = document.querySelector('router-view')
        if (view) {
            this.view = view
            this.setView(document.createElement('div')) // make template a legal html
        }
    }

    private setView(ele: Element) {
        const parent = this.view.parentElement
        if (parent) {
            parent.replaceChild(ele, this.view)
            this.view = ele
        }
    }

    public to(pathStr: string) {
        const paths = this.parsePath(pathStr)
        this.match(paths)
        history.pushState(null, '', this.genPath(paths))
    }

    public extractData() {
        const { search } = location
        if (search === '') return {}
        const pair = search.slice(1).split('&')
        return pair.reduce((obj: Record<string, string>, curr) => {
            const [key, value] = curr.split('=')
            obj[key] = decodeURIComponent(value)
            return obj
        }, {})
    }

    public setData(data: { [key: string]: number | string | boolean }) {
        const dataStr =
            '?' +
            Object.entries(data)
                .map(([key, value]) => key + '=' + encodeURIComponent(value))
                .join('&')
        history.replaceState(null, '', location.pathname + dataStr)
    }

    public back(distance?: number) {
        history.go(distance ? -distance : undefined)
    }

    public forward(distance?: number) {
        history.go(distance)
    }
}

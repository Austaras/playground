export interface User {
    login: string
    avatar_url: string
    html_url: string
}

let cache: User[] = []
let since = -30

export async function getData(index: number[]) {
    function mapToData() {
        const ret: User[] = []
        for (const i of index) {
            ret[i] = cache.shift()!
        }
        return ret
    }
    if (index.length < cache.length) {
        return await mapToData()
    } else {
        since += 30
        return fetch(`https://api.github.com/users?since=${since}`)
        .then(res => res.json() as Promise<User[]>)
        .then(newData => {
            cache = cache.concat(newData)
            return mapToData()
        })
    }
}

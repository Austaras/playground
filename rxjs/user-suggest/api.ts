export interface User {
    login: string
    avatar_url: string
    html_url: string
}

const PAGE_SIZE = 30

export async function getData(since: number) {
    // github user id isn't consistent, but we suppose it to be
    return fetch(`https://api.github.com/users?since=${since * PAGE_SIZE}`)
        .then(res => res.json() as Promise<User[]>)
}

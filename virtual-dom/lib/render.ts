import { update } from './reconcile'

export function render(element: JSXElement | JSXElement[], container: HTMLElement) {
    update({
        dom: container,
        props: {
            children: element
        }
    })
}

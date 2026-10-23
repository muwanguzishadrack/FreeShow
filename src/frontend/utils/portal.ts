// Svelte action: render an element at the end of <body> so it isn't hidden behind other panels.
export function portal(node: HTMLElement) {
    document.body.appendChild(node)
    return {
        destroy() {
            node.remove()
        }
    }
}

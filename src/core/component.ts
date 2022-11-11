import { EventListener } from "./event.listener"
import { HTMLSetter, type TrackFunction, track } from "."

type Fragment = HTMLDivElement
/**
 * Get default `fragment` element. It's like react `fragment`.
 * @note  For practical fragment role, `display: "contents"` makes it acting like non-exisisting element.
 * @param template HTML setter function
 * @param id fragment unique ID
 */
const createFragment = (
    template: HTMLSetter,
    id: string
): { fragment: Fragment } => {
    const fragment: Fragment = document.createElement("div")
    fragment.id = id
    fragment.innerHTML = template()
    fragment.style.display = "contents"
    return {
        fragment,
    }
}

const DEFAULT_RENDER_TARGET_ID = "app"

class Component extends EventListener {
    #renderTargetID = DEFAULT_RENDER_TARGET_ID
    #fragment: Fragment
    #ref: Fragment

    id: string
    template: HTMLSetter

    constructor({
        template,
        renderTargetID,
    }: {
        template: HTMLSetter
        renderTargetID?: string | undefined
    }) {
        const id = window.crypto.randomUUID()
        const { fragment } = createFragment(template, id)

        super(fragment)

        this.#fragment = fragment
        this.#ref = this.#fragment

        this.id = id
        this.template = template

        if (renderTargetID) this.#updateRenderTargetID(renderTargetID)
    }

    #updateRenderTargetID(newID: string) {
        this.#renderTargetID = newID
    }

    /**
     * Update `ref` element
     */
    #updateRef() {
        this.#ref = this.#fragment
    }

    /**
     * Mount `fragment` `DOM` element at `this.#renderTargetID`
     */
    #mount(renderTargetID?: string) {
        if (renderTargetID) {
            this.#updateRenderTargetID(renderTargetID)
        }
        const target = document.getElementById(this.#renderTargetID)
        target?.appendChild(this.#fragment)

        this.mountEvent()
    }

    /**
     * Update `HTML` template in fragment
     * @note core functionality of updating `DOM`.
     */
    updateDOM() {
        this.#fragment.innerHTML = this.template()
        this.#updateRef()
    }
    /**
     * Use fragment element, when mounted to the `DOM` tree.
     * @note should be called after `render` or `staticRender`
     * @param mountedCallback get mounted fragment as first argument
     * @example
     * .onMounted((fragment) => {
     *  // use fragment DOM in callback
     * })
     */
    onMounted(
        mountedCallback: ({ target }: { target: Fragment }) => void,
        renderTargetID?: string
    ) {
        this.#mount(renderTargetID)
        mountedCallback({ target: this.#fragment })
        return this
    }

    /**
     * Render statefull component
     * @param renderTargetID if renderTargetID is provided, component will be mounted there
     */
    render(renderTargetID?: string) {
        this.#mount(renderTargetID)
        return this
    }

    /**
     * Track siginal variables.
     * @note Whenever signal value updated, effectFunction will be executed.
     */
    effect(effectFuntion: TrackFunction) {
        this.render()
        track(effectFuntion)
        return this
    }

    /**
     * Get `DOM` reference.
     * @note Same as current fragment, but it is not mounted in `DOM` tree.
     */
    ref() {
        return this.#ref
    }

    /**
     * Get static `HTML` component.
     * @note Use it to mount static components to the `DOM` tree.
     */
    staticRender(renderTargetID?: string) {
        this.#mount(renderTargetID)
    }
}

export { Component }

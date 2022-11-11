import { html } from "../../../core"
import { setAttributes } from "../../../core/utils"
import style from "./index.module.css"

type HTMLAttributeKey = keyof HTMLButtonElement | `data-${string}`
interface ButtonProps {
    text: string
    emoji?: string
    className?: string | undefined
    attributes?: {
        [key in HTMLAttributeKey]?: string | undefined
    }
}
const Button = ({ text, emoji, attributes, className }: ButtonProps) => {
    return html`
        <button
            type="button"
            class="${style.btn} ${className ? className : ""}"
            ${setAttributes(attributes)}
        >
            <span>${text}</span>
            ${emoji ? `<span>${emoji}</span>` : ""}
        </button>
    `
}

export { Button }

type Target = HTMLDivElement
type EventName = keyof HTMLElementEventMap
export type EventType = HTMLElementEventMap

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerEventType = any
type EventInfo = {
    type: EventName
    handler: (e: HandlerEventType) => void | unknown
    name?: string | undefined
    targetType?: "window" | "self" | undefined
    targetId?: string | undefined
}

export type EventHandler = ({ target }: { target: Target }) => EventInfo
export type EventHandlerFunction = (
    e: HandlerEventType,
    target?: Target
) => void | unknown

class EventListener {
    #target: Target
    #eventInfoList: EventInfo[] = []

    constructor(target: Target) {
        this.#target = target
    }

    updateTarget(target: Target) {
        this.#target = target
    }

    /**
     * Add eventlistner
     * @param eventHandler returns `evntInfo` that is stored in specific component
     */
    addEvent(eventHandler: EventHandler) {
        const eventInfo = eventHandler({ target: this.#target })
        const { handler, type, name } = eventInfo

        this.#eventInfoList.push({
            name,
            type,
            handler,
            targetType: eventInfo.targetType,
            targetId: eventInfo.targetId,
        })

        return this
    }

    /**
     * Mount event to the `DOM`
     * @note mounting is required due to sync with component rendering cycle.
     */
    mountEvent() {
        this.#eventInfoList.forEach((eventInfo, index) => {
            const { type } = eventInfo
            let eventHandler
            if (eventInfo.targetType === "window") {
                //!FIXME: eventHandler is not the same context, so removing process is not working properly.
                eventHandler = function (e: HandlerEventType) {
                    eventInfo.handler(e)
                }
                const updated: EventInfo = {
                    ...eventInfo,
                    handler: eventHandler,
                }
                window.addEventListener(type, eventHandler)
                this.#eventInfoList.splice(index, 1, updated)
                return this
            } else {
                eventHandler = function (e: HandlerEventType) {
                    if (eventInfo?.targetId) {
                        if (
                            (e.target as HTMLElement).id === eventInfo.targetId
                        ) {
                            eventInfo.handler(e)
                        }
                    } else {
                        eventInfo.handler(e)
                    }
                }
                const updated: EventInfo = {
                    ...eventInfo,
                    handler: eventHandler,
                }

                this.#target.addEventListener(type, updated.handler, {
                    capture: false,
                })
                this.#eventInfoList.splice(index, 1, updated)
                return this
            }
        })
    }

    /**
     * Remove specific event
     * @param targetName remove event target name
     */
    removeEvent(targetName: string) {
        const targetEvent = this.#eventInfoList.find(
            (ev) => ev.name === targetName
        )
        if (targetEvent === undefined) {
            throw Error(
                `Error: Event ${targetName} is not exsists\nPlease Check event name again`
            )
        }
        const { type } = targetEvent
        if (targetEvent.targetType === "window") {
            window.removeEventListener(type, targetEvent.handler)
        } else {
            this.#target.removeEventListener(type, targetEvent.handler, {
                capture: true,
            })
        }
        return this
    }
}

export { EventListener }

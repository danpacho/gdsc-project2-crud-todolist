import { Component } from "./component"

// ------------------------ track ------------------------
export type TrackFunction = () => void | unknown
type Dependencies = Set<number>

type ExecutionContext = {
    action: TrackFunction
    deps: Dependencies
}
const globalExecutionContext: ExecutionContext[] = []
const track = (trackFunction: TrackFunction) => {
    globalExecutionContext.push({
        action: trackFunction,
        deps: new Set(),
    })
    trackFunction()
}

// ------------------------ signal ------------------------
type SignalContainer = {
    [id: number]: unknown
}
const originalSignal: SignalContainer = {}
const previousSignal: SignalContainer = {}

const isDepsShouldUpdate = (setA: Dependencies, setB: Dependencies) =>
    setA.size !== setB.size ||
    [...setA].every((value) => setB.has(value)) === false

const updateConnectedChannels = ({
    signalId,
    connectedChannels,
    latestGlobalExecutionContext,
}: {
    signalId: number
    latestGlobalExecutionContext: ExecutionContext
    connectedChannels: ExecutionContext[]
}) => {
    latestGlobalExecutionContext.deps.add(signalId)

    if (connectedChannels.length >= 1) {
        if (
            isDepsShouldUpdate(
                latestGlobalExecutionContext.deps,
                connectedChannels.at(-1)?.deps as Dependencies
            )
        ) {
            connectedChannels.push(latestGlobalExecutionContext)
        }
    } else {
        connectedChannels.push(latestGlobalExecutionContext)
    }
}

export type Getter<T> = () => T
export type SetterFunction<T> = T | ((prev: T) => T)
export type Setter<T> = (setterFunction: SetterFunction<T>) => void
type Resetter = () => void
type SignalAction<T> = [Getter<T>, Setter<T>, Resetter, Getter<T>]

let globalId = 0
const signal = <T>(data: T): SignalAction<T> => {
    const connectedChannels: ExecutionContext[] = []

    const signalId = globalId++
    const state = {
        [signalId]: data,
    }
    originalSignal[signalId] = data

    const getState: Getter<T> = () => {
        const latestGlobalExecutionContext = globalExecutionContext.at(-1)
        if (latestGlobalExecutionContext) {
            updateConnectedChannels({
                signalId,
                latestGlobalExecutionContext,
                connectedChannels,
            })
        }
        return state[signalId] as T
    }

    const setState: Setter<T> = (setter) => {
        previousSignal[signalId] = state[signalId]

        if (setter instanceof Function) {
            state[signalId] = setter(state[signalId] as T)
        } else {
            state[signalId] = setter
        }

        connectedChannels.forEach((channel) => {
            channel.action()
        })
    }

    const resetState: Resetter = () => {
        setState(originalSignal[signalId] as T)
    }

    const getPreviousState: Getter<T> = () =>
        (previousSignal[signalId] as T) ?? (originalSignal[signalId] as T)

    return [getState, setState, resetState, getPreviousState]
}

// ------------------------ component ------------------------
export type HTMLSetter = () => string
/**
 * Support syntax highlighting, returns `string`.
 * @note Use it with `lit-html` vscode plugin for syntax highlighting.
 */
const html = (
    templateStrings: TemplateStringsArray,
    ...variables: Array<string | number | undefined>
): string => {
    const toStringVariables = variables.map((v) =>
        v ? (typeof v === "string" ? v : String(v)) : ""
    )
    return toStringVariables.reduce((finalString, variable, index) => {
        return `${finalString}${variable}${templateStrings[index + 1]}`
    }, templateStrings[0] ?? "")
}

/**
 * Component class wrapper function
 * @param htmlSetter `html` template function
 * @param option `renderTargetID` and `isStatic` option included
 */
const component = (
    htmlSetter: HTMLSetter,
    option?: { renderTargetID?: string; isStatic?: boolean }
) => {
    const $target = new Component({
        template: htmlSetter,
        renderTargetID: option?.renderTargetID,
    })

    if (option?.isStatic) return $target

    track(() => {
        $target.updateDOM()
    })
    return $target
}

export { signal, component, html, track }

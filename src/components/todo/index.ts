import { $component, type SetterFunction, html, signal } from "../../core"
import type { EventHandlerFunction } from "../../core/event.listener"
import { map } from "../../core/utils"
import { useStorage } from "../../utils/local.storage"
import { Button } from "../atoms"
import style from "./index.module.css"

const updateSpecificData = <T>(
    dataArray: T[],
    specificDataFinder: (curr: T) => boolean,
    updateData: (curr: T) => T
) =>
    dataArray.reduce<T[]>((acc, curr) => {
        if (specificDataFinder(curr)) {
            acc.push(updateData(curr))
            return acc
        }
        acc.push(curr)
        return acc
    }, [])

const todoAction = {
    add: (todoList: TodoList[], newTodo: TodoList) => [...todoList, newTodo],

    remove: (todoList: TodoList[], id: number) =>
        todoList.filter((l) => l.id !== id),

    updateCompleted: (todoList: TodoList[], id: number) =>
        updateSpecificData(
            todoList,
            (curr) => curr.id === id,
            (curr) => ({ ...curr, isCompleted: !curr.isCompleted })
        ),

    updateText: (todoList: TodoList[], id: number, updatedText: string) =>
        updateSpecificData(
            todoList,
            (curr) => curr.id === id,
            (curr) => ({ ...curr, text: updatedText })
        ),
}

type TodoList = {
    id: number
    text: string
    isCompleted: boolean
}
const [$todoList, $setTodoListBoth] = useStorage<TodoList[]>("todo")
const [todoList, setTodoList] = signal<TodoList[]>($todoList() ?? [])
const setTodoListBoth = (setter: SetterFunction<TodoList[]>) => {
    setTodoList(setter)
    $setTodoListBoth(todoList())
}

type Display = "all" | "completed" | "uncompleted"
const [display, setDisplay] = signal<Display>("all")

const defaultFocusedValue = "not-focused"
const [focusedID, setFocusedID, resetFocusedID] = signal<string | number>(
    defaultFocusedValue
)

const [input, setInput, resetInput] = signal("")

const TodoListHead = () => {
    const updateTodoList: EventHandlerFunction = (e, target) => {
        e.preventDefault()
        const text = target?.getElementsByTagName("input")[0]?.value
        if (text) {
            const isTodoAddMode = focusedID() === defaultFocusedValue
            if (isTodoAddMode) {
                setTodoListBoth((prevList) =>
                    todoAction.add(prevList, {
                        id: Date.now(),
                        isCompleted: false,
                        text,
                    })
                )
                resetInput()
            } else {
                setTodoListBoth((prevList) =>
                    todoAction.updateText(prevList, focusedID() as number, text)
                )
                resetInput()
                resetFocusedID()
            }
        }
        target?.getElementsByTagName("input")[0]?.focus()
    }

    const updateDisplay: EventHandlerFunction = (e) => {
        const currentDisplayType = e.target.dataset.display as Display
        setDisplay(currentDisplayType)
    }

    return $component(
        () => html`
            <form id="form" class="${style.form}">
                <input
                    placeholder="Add Todo"
                    value="${input()}"
                    class="${style.input}"
                    autofocus
                />
            </form>
            ${TodoListTotalState({
                todoList,
            })}
        `
    )
        .addEvent(({ target }) => ({
            targetId: "form",
            type: "submit",
            handler: (e) => updateTodoList(e, target),
        }))
        .addEvent(() => ({
            targetId: "display",
            type: "click",
            handler: updateDisplay,
        }))
}

interface TodoListProps extends TodoList {
    isFocused: boolean
}
const TodoList = ({ id, isCompleted, text, isFocused }: TodoListProps) => {
    return html`
        <div
            class="${style.todoContainer} ${isFocused
                ? style.todoActiveContainer
                : ""}"
        >
            <div
                id="update-todo-text"
                data-id="${String(id)}"
                class="${style.todoText} ${isFocused
                    ? style.todoTextFocused
                    : ""}"
            >
                ${text}
            </div>
            <div class="${style.todoActionContainer}">
                ${Button({
                    text: isCompleted ? "☑️" : "◽️",
                    className: isCompleted ? style.completed : "",
                    attributes: {
                        id: "update-completed-btn",
                        "data-id": String(id),
                    },
                })}
                ${Button({
                    text: isFocused ? "⚪️" : "🖋️",
                    className: isFocused ? style.focused : "",
                    attributes: {
                        id: "update-text-btn",
                        "data-id": String(id),
                    },
                })}
                ${Button({
                    text: "🗑️",
                    className: style.removed,
                    attributes: {
                        id: "remove-btn",
                        "data-id": String(id),
                    },
                })}
            </div>
        </div>
    `
}

const TodoListDisplay = ({
    id,
    display,
    text,
    emoji,
    isFocused,
}: {
    id: string
    display: string
    text: string
    emoji: string
    isFocused: boolean
}) =>
    Button({
        text,
        emoji,
        className: isFocused ? style.focused : "",
        attributes: {
            id,
            "data-display": display,
        },
    })

interface TodoListTotalStateProps {
    todoList: () => TodoList[]
}
const displayType: {
    display: Display
    text: string
    emoji: string
}[] = [
    { display: "all", text: "All", emoji: "🗂️" },
    { display: "uncompleted", text: "Do", emoji: "📚" },
    { display: "completed", text: "Done", emoji: "🎉" },
]
const TodoListTotalState = ({ todoList }: TodoListTotalStateProps) => {
    const todoNumber = todoList().length
    const todoDoneNumber = todoList().filter((t) => t.isCompleted).length

    return html`
        <div class="${style.todoTotalStateContainer}">
            <div class="${style.todoStateContainer}">
                <span>Total ${todoNumber}</span>
                <span>Done ${todoDoneNumber}</span>
            </div>
            <div class="${style.todoControllContainer}">
                ${map(displayType, (t) =>
                    TodoListDisplay({
                        ...t,
                        id: "display",
                        isFocused: display() === t.display,
                    })
                )}
            </div>
        </div>
    `
}

const TodoListRender = () => {
    const removeTodo: EventHandlerFunction = (e) => {
        const id = Number(e.target.dataset.id)
        setTodoListBoth((prevList) => todoAction.remove(prevList, id))
    }

    const updateTodoComplete: EventHandlerFunction = (e) => {
        const id = Number(e.target.dataset.id)
        setTodoListBoth((prevList) => todoAction.updateCompleted(prevList, id))
    }

    const updateTodoText: EventHandlerFunction = (e) => {
        const currentId = Number(e.target.dataset.id)
        const currentTarget = todoList().find((t) => t.id === currentId)
        const isActionQuit = currentTarget?.id === focusedID()
        if (isActionQuit) {
            resetFocusedID()
            resetInput()
        } else {
            setFocusedID(currentId)
            setInput(currentTarget?.text as string)
            const input = document.getElementsByTagName("input")[0]
            input?.focus()
            input?.select()
        }
    }

    const todoRender = () => {
        switch (display()) {
            case "all":
                return todoList()
            case "completed":
                return todoList().filter((t) => t.isCompleted)
            case "uncompleted":
                return todoList().filter((t) => !t.isCompleted)
        }
    }

    return $component(() => {
        return html`
            <div class="${style.listContainerCol}">
                <div id="todo-list" class="${style.listContainer}">
                    ${map(todoRender(), (list) =>
                        TodoList({
                            ...list,
                            isFocused: focusedID() === list.id,
                        })
                    )}
                </div>
            </div>
        `
    })
        .addEvent(() => ({
            handler: removeTodo,
            type: "click",
            targetId: "remove-btn",
        }))
        .addEvent(() => ({
            handler: updateTodoComplete,
            type: "click",
            targetId: "update-completed-btn",
        }))
        .addEvent(() => ({
            handler: updateTodoText,
            type: "click",
            targetId: "update-text-btn",
        }))
}

export { TodoListHead, TodoListRender }

import style from "./app.module.css"
import { TodoListHead, TodoListRender } from "./components/todo"
import { component, html } from "./core"

const App = () =>
    component(
        () => html`
            <div class="${style.container}">
                <div id="todo-list-head" class="${style.headContainer}"></div>
                <div id="todo-list-render" class="${style.listContainer}"></div>
            </div>
        `
    )
App().render()

TodoListHead().render("todo-list-head")
TodoListRender().render("todo-list-render")

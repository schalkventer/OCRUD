# 🛸 OCRUD

**Offline Create-Read-Update-Delete interface built on top of the native browser IndexedDB API.**

Can be used for a range of purposes, all the way from merely facilitating optimistic UI updates to creating a full offline-first app. Decoupled from both UI and data-fetching concerns, therefore plays nice with almost all frameworks and libraries.

[React Demo example](#)

React Demo code:

```jsx
import { v4 as createId } from 'uuid'
import { useState, useEffect, createRef } from 'react'
import { createCache } from 'ocrud'

const cache = createCache()

const App = () => {
    const dialog = createRef()
    const input = createRef()

    const [task, setTask] = useState(null)
    const [collection, setCollection] = useState({})

    const updateHandlers = () => {
        if (!input) return
        const { value } = input

    }

    useEffect(() => {
        if (!dialog) return
        if (open) dialog.showModal()
        if (!open) dialog.hide()
    }, [open, dialog])

    return (
        <div>
            <dialog ref={dialog}>
                <form>
                    <label>
                        <span>Task:</span>
                        <input>
                    </label>

                    <button onClick={() => setOpen(null)}>Cancel</button>
                    <button onClick={updateHandlers}>Add</button>
                </form>
            </dialog>

            <header>
                <h1>Todo App</h2>
            </header>

            <main>
                <button>Add Task</button>

                <ul>
                    {Object.entries(collection).map(([key, { title, completed }]) => (
                        <li>
                            <label>
                                <input type="checkbox">
                                <span>{title}</span>
                            </label>

                            <button>Edit</button>
                            <button>Delete</button>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    )
}



```

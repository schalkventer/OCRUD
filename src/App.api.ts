import * as types from "./App.types";
import { createCollection, createHelpers } from "./ocrud";

const delay = (value: any) => new Promise((resolve) => {
  setTimeout(() => resolve(value), 8000)
})

const { toItem } = createHelpers<types.TaskInner>()
export const toTask = toItem

export const API = {
  tasks: [
    {
      title: "Example Task #1 ",
      completed: false,
    },
    {
      title: "Example Task #2 ",
      completed: false,
    },
    {
      title: "Example Task #3 ",
      completed: false,
    },
  ].map(toItem),

  addTask(newTask: types.Task) {
    this.tasks = [newTask, ...this.tasks];
  },

  deleteTask(id: types.ID) {
    this.tasks = this.tasks.filter((item) => item.id !== id);
  },

  toggleTask(id: types.ID) {
    this.tasks = this.tasks.map((item) =>
      item.id !== id ? item : { ...item, completed: !item.completed }
    );
  },

  getTasks(page: number) {
    const start = (page - 1) * 10;
    return { items: this.tasks.slice(start, 10), count: this.tasks.length };
  },
};

export const collection = createCollection<types.Task, { page: number }>({
  name: "tasks",
  version: "asd",
  debug: true,

  resolvers: {
    create: async ([newTask]) => {
      const value: any = await delay(newTask)
      API.addTask(value);
      return true;
    },

    deletion: async ([id]) => {
      const value: any = await delay(id)
      API.deleteTask(value);
      return true;
    },

    update: async ([partialItem]) => {
      if (!partialItem.id || partialItem.completed === undefined)
        throw new Error("No item");

      const value: any = await delay(partialItem.id)
      API.toggleTask(value);
      return false;
    },

    read: async (action) => {
      if (Array.isArray(action)) throw new Error("Invalid request");

      const value: any = await delay(action.page)
      const { items, count } = API.getTasks(value);

      return {
        items,
        meta: { count },
      };
    },
  },
});

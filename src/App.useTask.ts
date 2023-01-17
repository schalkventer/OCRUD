import { useState } from "react";
import { useMount } from "react-use";
import * as types from "./App.types";
import { collection, toTask, API } from "./App.api";

export const useTasks = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<types.Task[]>([]);


  const get = async () => {
    setLoading(true);
    const [response, validation] = await collection.read({ page: 0 });
    const items = await response;
    setTasks(items);

    const anomaly = await validation;
    if (anomaly) setTasks(anomaly())
    setLoading(false);
  }

  const causeAnomaly = async () => {
    API.addTask(toTask({
      title: 'This will cause anomaly',
      completed: true
    }))

    get()
  }

  const add = async (title: string) => {
    setLoading(true);
    const [response, validation] = await collection.create(
      [
        {
          completed: false,
          title,
        },
      ].map(toTask),
      tasks
    );

    const items = await response;
    setTasks(items);

    await validation;
    setLoading(false);
  };

  const remove = async (id: types.ID) => {
    setLoading(true);
    const [response, validation] = await collection.deletion([id], tasks);
    const items = await response;
    setTasks(items);

    await validation;
    setLoading(false);
  };

  const toggle = async (id: types.ID) => {
    setLoading(true);
    const current = tasks.find((item) => item.id === id);

    const [response, validation] = await collection.update(
      [
        {
          id,
          completed: !current?.completed,
        },
      ],
      tasks
    );

    const items = await response;
    setTasks(items);

    const anomaly = await validation;
    
    if (anomaly) {
      await anomaly()
      get()
    }

    setLoading(false);
  };

  useMount(async () => {
    get()
  });

  return [
    { tasks, loading },
    {
      add,
      toggle,
      remove,
      causeAnomaly,
    },
  ] as const;
};

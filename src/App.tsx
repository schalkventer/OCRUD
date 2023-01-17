import { FormEvent } from "react";
import styled from '@emotion/styled';
import { useTasks } from './App.useTask'
import { LinearProgress } from '@mui/material'

import * as types from './App.types'

const Bottom = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
`

const Task = (
  props: types.TaskInner & { onDelete: () => void; onToggle: () => void }
) => {
  const { completed, title, onDelete, onToggle } = props;

  return (
    <li>
      <label>
        <input type="checkbox" checked={completed} onChange={onToggle} />
        <span>{title}</span>
      </label>

      <button onClick={onDelete}>Delete</button>
    </li>
  );
};

export const App = () => {
  const [{tasks, loading }, { add, remove, toggle, causeAnomaly }] = useTasks();


  console.log(loading)

  const tasksHtml = tasks.map(({ completed, id, title }) => {
    return (
      <Task
        {...{ completed, title }}
        key={id}
        onDelete={() => remove(id)}
        onToggle={() => toggle(id)}
      />
    );
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const target = event.target as HTMLFormElement;
    const data = new FormData(target);
    const response = Object.fromEntries(data) as { title: string };
    add(response.title);
    target.reset();
  };

  return (
    <>
      <h1>Tasks</h1>
      <hr />

      <form onSubmit={handleSubmit}>
        <label>
          <span>New Task:</span>
          <input required name="title" />
        </label>

        <button type="submit">Add Task</button>
      </form>
      <hr />

      <ul>{tasksHtml}</ul>

      <hr />

      <button onClick={causeAnomaly}>CAUSE ANOMALY</button>

      <Bottom>
        {loading && <LinearProgress  />}
      </Bottom>
    </>
  );
};

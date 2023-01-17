import { Item, ItemID } from './ocrud'

export type TaskInner = {
    title: string;
    completed: boolean;
  }
  
export type Task = Item<TaskInner>
export type ID = ItemID

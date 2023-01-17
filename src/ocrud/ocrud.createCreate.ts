import * as types from "./ocrud.types";

export const createCreate = <Item extends types.ItemBase, Payload extends object>(
  props: types.Operation<Item, Payload>
) => {
  const { debug, resolvers, internals } = props;

  const createRequest = async (
    action: types.CreateAction<Item>
  ): Promise<void> => {
    if (debug) console.log("create", action);
    await internals.set.items(action)
    return;
  };

  const create: types.CreateOperation<Item> = (action, transform = []) => {
    if (debug) console.log("create", { action });
    createRequest(action);

    const createDataPromise = async () => {
      const newItems = [...action, ...transform]
      if (debug) console.log("create:data", { items: newItems });
      return newItems
    }

    const dataPromise = createDataPromise()

    const createValidationPromise = async (): Promise<null | (() => void)> => {
      await dataPromise;
      const success = await resolvers.create(action)
      if (debug) console.log("deletion:validation", { success });
      return success ? null : internals.clear
    };

    return [dataPromise, createValidationPromise()];
  };

  return create;
};

import * as types from "./ocrud.types";

const toItemIDs = (id: string[]) => {
  return id as types.ItemID[]
};

export const createDeletion = <Item extends types.ItemBase, Payload extends object>(
  props: types.Operation<Item, Payload>
) => {
  const { debug, resolvers, internals } = props;

  const deletionRequest = async (
    action: types.DeletionAction
  ): Promise<void> => {
    if (debug) console.log("deletion", action);
    const actionAsIds = toItemIDs(action)
    await internals.remove(actionAsIds)
    return;
  };

  const deletion: types.DeletionOperation<Item> = (action, transform = []) => {
    if (debug) console.log("deletion", { action });
    deletionRequest(action);

    const createDataPromise = async () => {
      const newItems =  transform.filter(item => !action.includes(item.id))
      if (debug) console.log("deletion:data", { items: newItems });
      return newItems
    }

    const dataPromise = createDataPromise()

    const createValidationPromise = async (): Promise<null | (() => void)> => {
      const success = await resolvers.deletion(action)
      if (debug) console.log("deletion:validation", { success });
      return success ? null : internals.clear
    };

    return [dataPromise, createValidationPromise()];
  };

  return deletion;
};

import * as types from "./ocrud.types";

const toItemIDs = (id: string[]) => {
    return id as types.ItemID[]
  };
  

export const createUpdate = <Item extends types.ItemBase, Payload extends object>(
  props: types.Operation<Item, Payload>
) => {
  const { debug, resolvers, internals } = props;

  const updateRequest = async (
    action: types.UpdateAction<Item>
  ): Promise<void> => {
    if (debug) console.log("create", action);
    const keys = Object.keys(action)
    const keysAsItemIDs = toItemIDs(keys)
    const current = await internals.get.items(keysAsItemIDs)

    const newArray = current.map(inner =>{
        const changes = action.find((item) => item.id === inner.id)
        return { ...inner, ...changes }
    })

    await internals.set.items(newArray)
    return;
  };

  const update: types.UpdateOperation<Item> = (action, transform = []) => {
    if (debug) console.log("update", { action });
    updateRequest(action);

    const createDataPromise = async () => {
      let result = [...transform]
      
      action.forEach(newPartialValues => {
        const index = result.findIndex(item => item.id === newPartialValues.id)
        console.log(index, newPartialValues)
        result[index] = { ...result[index], ...newPartialValues }
      })

      if (debug) console.log("update:data", { items: result });
      return result
    }

    const dataPromise = createDataPromise()

    const createValidationPromise = async (): Promise<null | (() => void)> => {
      const success = await resolvers.update(action)
      if (debug) console.log("update:validation", { success });
      return success ? null : internals.clear
    };

    return [dataPromise, createValidationPromise()];
  };

  return update;
};

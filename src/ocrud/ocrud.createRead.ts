import * as types from "./ocrud.types";

const createHash = (action: object) => {
  return JSON.stringify(action) as types.Hash;
};

export const createRead = <Item extends types.ItemBase, Payload extends object>(
  props: types.Operation<Item, Payload>
) => {
  const { debug, resolvers, internals } = props;

  const handleOnlyItemsResolver = async (action: string[]): Promise<Item[]> => {
    const { items } = await resolvers.read(action);
    internals.set.items(items);
    return items;
  };

  const handleFullResolver = async (action: Payload) => {
    const hash = createHash(action);
    const { meta, items } = await resolvers.read(action);

    const getId = (item: Item) => item.id;
    const matches = items.map(getId);

    internals.set.items(items);
    internals.set.metas({ [hash]: meta });
    internals.set.matches({ [hash]: matches });
    return items;
  };

  const calcMatch = async <Payload extends object>(
    action: types.ReadAction<Payload>
  ): Promise<types.Match | null> => {
    
    // Action itself is matches and not payload

    if (Array.isArray(action)) {
      const actionAsMatches = action as types.Match;
      return actionAsMatches;
    }

    // Action is payload

    const actionAsPayload = action as Payload;
    const hash = createHash(actionAsPayload);

    // Attempts to fetch match from collection

    const [response] = await internals.get.matches([hash]);
    return response || null;
  };

  const readRequest = async (
    action: types.ReadAction<Payload>
  ): Promise<{ items: Item[]; synced: "none" | "full" | "partial" }> => {

    const match = await calcMatch(action);

    // If Match was found

    if (match) {
      const items = await internals.get.items(match);
      const noMissingItems = items.every(Boolean);

      // If Match found all items

      if (noMissingItems) return { items, synced: "none" };

      // If Match could not find all items

      const response = await handleOnlyItemsResolver(match);
      return { items: response, synced: "partial" };
    }

    // If could not find anything in collection

    const items = await handleFullResolver(action as Payload);
    return { items, synced: "full" };
  };

  const read: types.ReadOperation<Item, Payload> = (action) => {
    if (debug) console.log("read", action);
    const readResponse = readRequest(action)

    const createDataPromise = async (): Promise<Item[]> => {
      const response = await readResponse
      if (debug) console.log("read:data", { items: response });
      return response.items
    }

    const createValidationPromise = async (): Promise<null | (() => Item[])> => {
      const match = await calcMatch(action)
      const local = match && await internals.get.items(match)
      const response = await readResponse

      if (response.synced === 'full') return null
      if (!local) throw new Error('Local matches are required')

      const target = await resolvers.read(action)
      const localString = JSON.stringify(local)
      const targetString = JSON.stringify(target.items)
      const anomaly = localString !== targetString

      if (debug) console.log("read:validation", { anomaly, data: local, validation: target.items });
      if (!anomaly) return null

      const fn = () => target.items
      return fn
    }

    return [createDataPromise(), createValidationPromise()]
  }

  return read
};



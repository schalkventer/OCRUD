import { DBSchema, IDBPDatabase } from "idb";

export type OperationId = "create" | "read" | "update" | "delete";
export type ItemID = string & { __type: "ItemID" };
export type Hash = string & { __type: "queryId" };

/**
 * A single object in the list maintained by a {@link Collection}
 */
export type ItemBase = {
  id: ItemID
  [key: string]: any
};

export type Item<Base extends Record<string, any>> = { id: ItemID } & Base

/**
 * An array of objects that all have the same shape/keys. Effectively an array
 * of {@link Item}
 */
export type List<Item extends ItemBase> = Item[];

export type Match = ItemID[];
export type Meta = object;

export interface Schema<Item extends ItemBase> extends DBSchema {
  items: {
    key: ItemID;
    value: Item;
  };

  matches: {
    key: Hash;
    value: Match;
  };

  metas: {
    key: Hash;
    value: Meta;
  };
}

/* Internals */

export type setItems<Item extends ItemBase> = (values: Item[]) => Promise<void>;
export type setMatches = (values: Record<Hash, Match>) => Promise<void>;
export type setMetas = (values: Record<Hash, Meta>) => Promise<void>;
export type getMatches = (ids: Hash[]) => Promise<Match[]>;
export type getMetas = (ids: Hash[]) => Promise<Meta>;
export type removeItem = (ids: ItemID[]) => Promise<void>

export type getItems<Item extends ItemBase> = (
  ids: ItemID[]
) => Promise<Item[]>;

export type Internals<Item extends ItemBase> = {
  get: {
    items: getItems<Item>;
    matches: getMatches;
    metas: getMetas;
  };
  set: {
    items: setItems<Item>;
    matches: setMatches;
    metas: setMetas;
  };
  remove: removeItem
  clear: () => Promise<void>
};

/* Other */

export type Init<Item extends ItemBase> = Promise<IDBPDatabase<Schema<Item>>>;

export type Response<Item extends ItemBase> = {
  items: Item[];
  meta: object;
};

export type CreateAction<Item extends ItemBase> = Item[];
export type ReadAction<Payload extends object> = string[] | Payload;
export type DeletionAction = ItemID[];

export type UpdateAction<Item extends ItemBase> = Partial<
  { id: ItemID } & Omit<Item, "id">
>[];

export type Resolvers<Item extends ItemBase, Payload extends object> = {
  create: (action: CreateAction<Item>) => Promise<boolean>;
  read: (action: ReadAction<Payload>) => Promise<{ meta: Meta; items: Item[] }>;
  update: (action: UpdateAction<Item>) => Promise<boolean>;
  deletion: (action: DeletionAction) => Promise<boolean>;
};

export type Configuration<Item extends ItemBase, Payload extends object> = {
  name: string;
  version: string;
  resolvers: Resolvers<Item, Payload>;
  debug?: boolean;
};

export type Operation<Item extends ItemBase, Payload extends object> = {
  debug: boolean;
  init: Promise<IDBPDatabase<Schema<Item>>>;
  resolvers: Resolvers<Item, Payload>;
  internals: Internals<Item>;
};

export type CreateOperation<Item extends ItemBase> = 
  (newItems: Item[], transform?: Item[]) => [Promise<Item[]>, Promise<null | (() => void)>];

export type ReadOperation<Item extends ItemBase, Payload extends object> = 
  (query: ItemID[] | Payload) => [Promise<Item[]>, Promise<null | (() => Item[])>];

export type UpdateOperation<Item extends ItemBase> = 
  (updates: Partial<Item>[], transform?: Item[]) => [Promise<Item[]>, Promise<null | (() => void)>];

export type DeletionOperation<Item extends ItemBase> = 
  (ids: ItemID[], transform?: Item[]) => [Promise<Item[]>, Promise<null | (() => void)>];


/**
 * An object that exposes _operations_ that interface with IndexedDB on a user's
 * machine in order to store and update cached information about list sourced
 * from a target API. A ${@link Collection} stores all known {@link Item}, {@link Item} and
 * {@link Meta} information internally.
 */
export type Collection<Item extends ItemBase, Payload extends object> = {
  create: CreateOperation<Item>
  read:  ReadOperation<Item, Payload>
  update: UpdateOperation<Item>
  deletion: DeletionOperation<Item>

  internals: {
    set: setItems<Item>
    get: getItems<Item>
  }
};

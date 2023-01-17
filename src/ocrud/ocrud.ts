import { openDB } from 'idb'
import { v4 } from 'uuid'
import { createDeletion } from './ocrud.createDeletion'
import { createUpdate } from './ocrud.createUpdate'
import { createCreate } from './ocrud.createCreate'
import { createRead } from './ocrud.createRead'

import * as types from './ocrud.types'
export type ItemID = types.ItemID
export type Item<Values extends Record<string, any>> = types.Item<Values>

export const createHelpers = <Base extends Record<string, any>>() => ({
    toItem: (values: Base & { id?: string }): types.Item<Base> => ({
        id: (values.id || v4()) as types.ItemID,
        ...values,
    }),
    toID: (value: string) => value as types.ItemID
})

export const createCollection = <RawItem extends types.ItemBase, Payload extends object>(config: types.Configuration<types.Item<RawItem>, Payload>): types.Collection<RawItem, Payload> => {
    const { version, name, resolvers, debug = false } = config

    const init = openDB<types.Schema<types.Item<RawItem>>>(`${name}-v${version}`, 1, {
        upgrade(db) {
          db.createObjectStore('items', { keyPath: 'id' })
          db.createObjectStore('metas')
          db.createObjectStore('matches')
        },
      })

    const cleanup = async () => {
        await init
        const list = await indexedDB.databases()

        list.forEach((db) => {
            const dbName = db && db.name
            const isCurrentName = dbName?.startsWith(name)
            const notCurrentVersion = !dbName?.endsWith(`v${version}`)
            if (dbName && isCurrentName && notCurrentVersion) window.indexedDB.deleteDatabase(dbName)
        })
    }

    cleanup()

    const getItems: types.getItems<types.Item<RawItem>> = async (ids) => {
        const db = await init
        const response = ids.map((singleId) => db.get('items', singleId))
        const result = await Promise.all(response)
        return result.filter(Boolean) as types.Item<RawItem>[]
    }

    const getMatches: types.getMatches = async (hashes) => {
        const db = await init
        const response = hashes.map((singleHash) => db.get('matches', singleHash))
        const result = await Promise.all(response)
        return result.filter(Boolean) as types.Match[]
    }

    const getMetas: types.getMetas = async (hashes) => {
        const db = await init
        const response = hashes.map((singleHash) => db.get('metas', singleHash))
        const result = await Promise.all(response)
        return result.filter(Boolean) as types.Meta[]
    }

    const setItems: types.setItems<types.Item<RawItem>> = async (items) => {
        const db = await init
        const promises = items.map((singleItem) => db.put('items', singleItem))
        await Promise.all(promises)
        return
    }

    const setMatches: types.setMatches = async (obj) => {
        const db = await init
        const promises = Object.entries(obj).map(([key, value]) => db.put('matches', value, key as types.Hash))
        await Promise.all(promises)
        return
    }

    const setMetas: types.setMetas = async (obj) => {
        const db = await init
        const promises = Object.entries(obj).map(([key, value]) => db.put('metas', value, key as types.Hash))
        await Promise.all(promises)
        return
    }

    const remove: types.removeItem = async (ids) => {
        const db = await init
        const response = ids.map((singleId) => db.delete('items', singleId))
        await Promise.all(response)
        return 
    }

    const clearAll = async (): Promise<void> => {
        const db = await init
        
        const promise = [
            db.clear('matches'),
            db.clear('metas'),
            db.clear('items')
        ]

        await Promise.all(promise)
    }

    const internals: types.Internals<types.Item<RawItem>> = {
        get: {
            items: getItems,
            matches: getMatches,
            metas: getMetas,
        },
        set: {
            items: setItems,
            matches: setMatches,
            metas: setMetas,
        },
        remove: remove,
        clear: clearAll,
    }
    
    return {
        create: createCreate({ debug, init, internals, resolvers }),
        read: createRead({ debug, init, internals, resolvers }),
        update: createUpdate({ debug, init, internals, resolvers }),
        deletion: createDeletion({ debug, init, internals, resolvers }),

        internals: {
            get: internals.get.items,
            set: internals.set.items,
        }
    }
}
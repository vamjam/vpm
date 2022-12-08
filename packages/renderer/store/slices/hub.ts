import { StoreApi } from 'zustand'
import { HubPackage } from '@shared/types'
import State from '../State'

const STORAGE_KEY = 'hub:packages'
const cacheLength = 1000 * 60 * 15 // 15 minutes

export type HubPackages = {
  [id: string]: HubPackage
}

type HubPackagesStore = {
  date: Date
  packages: {
    [id: string]: HubPackage
  }
}

export type HubSlice = {
  hubPackages?: HubPackages
  getHubPackages: (take?: number, skip?: number) => Promise<void>
}

const getStoredPackages = () => {
  const store = localStorage.getItem(STORAGE_KEY)

  if (store != null) {
    const hub = JSON.parse(store) as HubPackagesStore

    if (Date.now() - new Date(hub.date).getTime() < cacheLength) {
      return hub.packages
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return undefined
}

const mergePackages = (storeA: HubPackages, storeB?: HubPackages) => {
  return Object.values(storeB ?? {}).reduce((acc, curr) => {
    acc[curr.id]

    return acc
  }, storeA)
}

const storePackages = (packages: HubPackage[]) => {
  const store = {
    date: new Date(),
    packages: packages.reduce((acc, curr) => {
      acc[curr.id] = curr

      return acc
    }, {} as HubPackages),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))

  return store.packages
}

export default function createSlice(
  set: StoreApi<State>['setState']
): HubSlice {
  return {
    hubPackages: getStoredPackages(),
    getHubPackages: async (take = 25, skip = 0) => {
      const stored = getStoredPackages()

      if (stored == null) {
        const packages = await window.api?.hub.get(take, skip)

        if (packages != null) {
          set((prev) => ({
            hubPackages: mergePackages(
              storePackages(packages),
              prev.hubPackages
            ),
          }))
        }
      }
    },
  }
}

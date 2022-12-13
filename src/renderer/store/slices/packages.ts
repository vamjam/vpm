import { GetState, SetState } from 'zustand'
import { Package } from '@shared/types'
import State from '../State'

export type Packages = {
  [id: string]: Package & {
    versions?: Package[]
  }
}

export type PackagesSlice = {
  packages: Packages
  isScanning: boolean
  scanProgress?: number

  scan: () => void
  abortScan: () => void

  getPackages: (take?: number, skip?: number) => void
}

const toMap = (packages: Package[]): Packages => {
  return packages.reduce((acc, curr) => {
    const match = Object.values(acc).find((p) => p.name === curr.name)

    if (match) {
      if (!match.versions) {
        match.versions = []
      }

      match.versions = [...match.versions, curr]
    } else {
      acc[curr.id] = curr
    }

    return acc
  }, {} as Packages)
}

export default function createSlice(
  set: SetState<State>,
  get: GetState<State>
): PackagesSlice {
  const setIsScanning = (isScanning: boolean) => {
    set({
      isScanning,
    })
  }

  const setPackages = (packages: Package[]) => {
    const currentPackages = Object.values(get().library)
    const newPackages = toMap([...currentPackages, ...packages])

    set({
      library: newPackages,
    })
  }

  const setScanProgress = (progress: number) => {
    set({
      scanProgress: progress,
    })
  }

  window.api?.on('scan:start', () => {
    setIsScanning(true)
  })

  window.api?.on('scan:stop', async (_: unknown) => {
    setIsScanning(false)

    const packages = await window.api?.getPackages()

    if (packages != null) {
      setPackages(packages)
    }
  })

  window.api?.on('scan:progress', (_: unknown, pct: number) => {
    setScanProgress(pct)
  })

  return {
    packages: {},
    isScanning: false,
    getPackages: async () => {
      const packages = await window.api?.getPackages()

      if (packages != null) {
        setPackages(packages)
      }
    },
    scan: () => {
      window.api?.scan()
    },
    abortScan: () => {
      window.api?.abortScan()
    },
  }
}

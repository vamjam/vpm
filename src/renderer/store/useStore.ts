import create from 'zustand'
import State from './State'
import createConfigSlice from './slices/config'
import createHubSlice from './slices/hub'
import createPackagesSlice from './slices/packages'

const useStore = create<State>((set, get) => {
  return {
    ...createHubSlice(set),
    // ...createPackagesSlice(set, get),
    ...createConfigSlice(set),
  }
})

export default useStore

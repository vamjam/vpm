import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import createToolbarSlice, { type ToolbarSlice } from './slices/toolbar.ts'
import createWindowSlice, { type WindowSlice } from './slices/window.ts'

export type Store = ToolbarSlice & WindowSlice

const useStore = create<Store>()(
  persist(
    (set) => ({
      ...createToolbarSlice(set),
      ...createWindowSlice(set),
    }),
    {
      name: 'filejam',
    },
  ),
)

export default useStore

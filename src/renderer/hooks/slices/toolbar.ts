export type ToolbarView = 'grid' | 'list' | 'column' | 'gallery'

export interface ToolbarSlice {
  'thumbnail.width': number
  'thumbnail.setWidth': (width: number) => void
  'toolbar.view': ToolbarView
  'toolbar.setView': (view: ToolbarView) => void
}

type SetState = (fn: (state: ToolbarSlice) => Partial<ToolbarSlice>) => void

export default function create(set: SetState): ToolbarSlice {
  return {
    'thumbnail.width': 100,
    'thumbnail.setWidth': (width) => {
      set(() => ({
        'thumbnail.width': width,
      }))
    },
    'toolbar.view': 'grid',
    'toolbar.setView': (view) => {
      set(() => ({
        'toolbar.view': view,
      }))
    },
  }
}

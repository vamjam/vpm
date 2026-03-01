export type ToolbarView = 'grid' | 'list' | 'column' | 'gallery'

export type SortBy =
  | 'date-desc'
  | 'date-asc'
  | 'name-asc'
  | 'name-desc'
  | 'size-asc'
  | 'size-desc'

export interface ToolbarSlice {
  'thumbnail.width': number
  'thumbnail.setWidth': (width: number) => void
  'toolbar.view': ToolbarView
  'toolbar.setView': (view: ToolbarView) => void
  'toolbar.sortBy': SortBy
  'toolbar.setSortBy': (sortBy: SortBy) => void
  'toolbar.search': string
  'toolbar.setSearch': (search: string) => void
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
    'toolbar.sortBy': 'date-desc',
    'toolbar.setSortBy': (sortBy) => {
      set(() => ({
        'toolbar.sortBy': sortBy,
      }))
    },
    'toolbar.search': '',
    'toolbar.setSearch': (search) => {
      set(() => ({
        'toolbar.search': search,
      }))
    },
  }
}

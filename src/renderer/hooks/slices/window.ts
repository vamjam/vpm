export interface WindowSlice {
  'location.last': string
  'location.setLast': (location: string) => void
  'sidebar.width': number
  'sidebar.setWidth': (width: number) => void
}

type SetState = (fn: (state: WindowSlice) => Partial<WindowSlice>) => void

export default function create(set: SetState): WindowSlice {
  return {
    'location.last': '/',
    'location.setLast': (location) => {
      set(() => ({
        'location.last': location,
      }))
    },
    'sidebar.width': 250,
    'sidebar.setWidth': (width) => {
      set(() => ({
        'sidebar.width': width,
      }))
    },
  }
}

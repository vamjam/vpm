export interface WindowSlice {
  'location.last': string
  'location.setLast': (location: string) => void
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
  }
}

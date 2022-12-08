import { ConfigSlice } from './slices/config'
import { HubSlice } from './slices/hub'
import { PackagesSlice } from './slices/packages'

type State = HubSlice & PackagesSlice & ConfigSlice

export default State

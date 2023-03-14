import { JSONObject, StringifiedBool } from './JSON'

export type vam = {
  itemType: string
  uid: string
  displayName: string
  creatorName: string
  tags: string
}

export type vap = {
  setUnlistedParamsToDefault: StringifiedBool
  storables: JSONObject[]
}

type StringifiedBool = 'true' | 'false'
type StringifiedNumber = `${number}`

type GeometryItemStorable = {
  id: string
  internalId: string
  enabled: StringifiedBool
}

type MorphStorable = {
  uid: string
  name: string
  value: StringifiedNumber
}

type GenericStorable<
  T extends string | StringifiedBool | StringifiedNumber = string
> = {
  [key: string]: T
}

type GeometryStorable = {
  id: 'geometry'
  useAdvancedColliders: StringifiedBool
  useAuxBreastColliders: StringifiedBool
  disableAnatomy: StringifiedBool
  useMaleMorphsOnFemale: StringifiedBool
  useFemaleMorphsOnMale: StringifiedBool
  character: string
  clothing: GeometryItemStorable[]
  hair: GeometryItemStorable[]
  morphs: MorphStorable[]
}

type Appearance = {
  setUnlistedParamsToDefault: StringifiedBool
  storables: [GeometryStorable, GenericStorable]
}

export default Appearance

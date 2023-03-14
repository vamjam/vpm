export type StringifiedBool = 'true' | 'false'
export type StringifiedNumber = `${number}`

export type JSONValue = string | StringifiedBool | StringifiedNumber
export type JSONObject = Record<
  string,
  JSONValue | JSONValue[] | { [key: string]: JSONObject | JSONValue }
>

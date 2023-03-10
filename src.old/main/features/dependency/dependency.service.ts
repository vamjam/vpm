const urlRegex = /[^"]+:\/+.+\.(\w+)/g

export const findAllDependencies = (json: string) => {
  try {
    const matches = [...json.matchAll(urlRegex)]

    return matches.map((match) => match[0])
  } catch (err) {
    return []
  }
}

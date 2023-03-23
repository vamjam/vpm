export {}
// import path from 'node:path'
// import { getProperty, hasProperty, setProperty } from 'dot-prop'
// import { existsSync } from 'fs'
// import url from 'url'
// import { Dependency } from '@shared/types'
// import config from '~/config'
// import { SaveableDependency } from '~/db/Repository'
// import fromRoot from '~/utils/fromRoot'
// import { JSONObject } from '~/vam/JSON'

// const depURLRegex = /[^"]+:\/+.+\.(\w+)/g

// const findDependencies = (json: string) => {
//   try {
//     const matches = [...json.matchAll(depURLRegex)]

//     return matches.map((match) => match[0])
//   } catch (err) {
//     return []
//   }
// }

// /**
//  *
//  * @param dependencies
//  * @returns An object of dependencies grouped by creator name.
//  */
// const groupDependencies = (dependencies: string[]) => {
//   const root = new URL(config.get('vam.url') as string)
//   const unique = Array.from(new Set(dependencies))

//   return unique.reduce((acc, dep) => {
//     if (dep.includes(':')) {
//       const [protocol, href] = dep.split(':')
//       const value = hasProperty(acc, protocol) ? getProperty(acc, protocol) : []

//       setProperty(acc, protocol, value.concat(href))
//     } else {
//       const absURL = fromRoot(root, dep)
//       const asPath = url.fileURLToPath(absURL)
//       const dirname = path.dirname(asPath)
//       const fileName = path.basename(asPath)
//       const propName = dirname.replaceAll(path.sep, '.')
//       const value = hasProperty(acc, propName) ? getProperty(acc, propName) : []

//       if (!value.includes(fileName)) {
//         setProperty(acc, propName, value.concat(fileName))
//       }
//     }

//     return acc
//   }, {} as Record<string, string[]>)
// }

// const DependencyParser = {
//   /**
//    * Because a package can have hundreds of dependencies,
//    * group them first by creator, then parse.
//    * @param data
//    */
//   async parseDependencies(data: JSONObject) {
//     const sources = findDependencies(JSON.stringify(data))
//     const grouped = groupDependencies(sources)
//   },
// }

// export default DependencyParser

import fs from 'node:fs'

export default function pathExists(dir: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      fs.access(dir, (err) => {
        if (err == null) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    } catch (err) {
      resolve(false)
    }
  })
}

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import psList from 'ps-list'
import { ConfigService } from '~/features/config'

class VAMService {
  async isAppRunning() {
    const processes = await psList()

    return processes.some((proc) => proc.name.includes('VaM'))
  }

  async launchApp() {
    const vamPath = ConfigService.get<string>('path.vam')
    const vamExe = `${vamPath}\\VaM.exe`
    const exists = fs.existsSync(vamExe)

    if (!exists) {
      throw new Error(
        `Cannot find the VaM executable. Make sure it's configured in Settings. Searched "${vamPath}"`
      )
    }

    return new Promise((resolve, reject) => {
      execFile(vamExe, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}

export default new VAMService()

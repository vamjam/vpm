import chalk from 'chalk'
import { build } from 'vite'
import * as config from './config.js'

for (const [key, projectConfig] of Object.entries(config)) {
  console.log(chalk.dim(`\n\nStarting ${key} build`))

  await build(projectConfig)

  console.log(chalk.dim(`Finished ${key} build`))
}

process.exit(0)

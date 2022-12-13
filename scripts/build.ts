import chalk from 'chalk'
import { build } from 'vite'
import config from './config.json'

for (const project of Object.keys(config)) {
  console.log(chalk.dim(`\n\nStarting ${project} build`))

  await build(config[project as keyof typeof config])

  console.log(chalk.dim(`Finished ${project} build`))
}

process.exit(0)

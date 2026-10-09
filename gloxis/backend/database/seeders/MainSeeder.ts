import { BaseSeeder } from '@adonisjs/lucid/seeders'
import app from '@adonisjs/core/services/app'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

import logger from '@adonisjs/core/services/logger'

export default class MainSeeder extends BaseSeeder {
  public async run() {
    const modulesDir = app.makePath('app/Modules')

    if (!existsSync(modulesDir)) return

    const modules = await readdir(modulesDir, { withFileTypes: true })

    for (const mod of modules) {
      if (!mod.isDirectory()) continue

      const seedersDir = join(modulesDir, mod.name, 'Database', 'Seeders')
      if (existsSync(seedersDir)) {
        const files = await readdir(seedersDir)
        const seederFiles = files.filter((f) => f.endsWith('.ts') || f.endsWith('.js'))

        for (const file of seederFiles) {
          // Removes extension to import properly via subpath imports
          const fileNameWithoutExt = file.replace(/\.[^/.]+$/, '')
          const modulePath = `#modules/${mod.name}/Database/Seeders/${fileNameWithoutExt}`

          try {
            const { default: SeederClass } = await import(modulePath)
            if (SeederClass) {
              logger.info(`Running seeder: ${modulePath}`)
              const seeder = new SeederClass(this.client)
              await seeder.run()
            }
          } catch (error) {
            logger.error(
              `Failed to run seeder ${modulePath}: ${error instanceof Error ? error.message : String(error)}`
            )
          }
        }
      }
    }
  }
}

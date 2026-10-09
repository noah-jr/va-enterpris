import type { ApplicationService } from '@adonisjs/core/types'
import { readdir } from 'node:fs/promises'
import logger from '@adonisjs/core/services/logger'

export default class ModuleProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  public register() {}

  /**
   * The boot method is called before the application starts.
   * Here we dynamically discover and load Module Events and other configs.
   */
  public async boot() {
    const modulesDir = this.app.makePath('app/Modules')

    try {
      const modules = await readdir(modulesDir, { withFileTypes: true })

      for (const mod of modules) {
        if (!mod.isDirectory()) continue

        try {
          // In dev it might be .ts, in prod .js. We can use subpath import resolution.
          await import(`#modules/${mod.name}/Events/index.js`)
        } catch (error) {
          // Ignore if the module doesn't have an Events/index file
          const err = error as NodeJS.ErrnoException
          if (err.code !== 'ERR_MODULE_NOT_FOUND') {
            logger.error(`Failed to load events for module ${mod.name}: ${err.message}`)
          }
        }
      }
    } catch (error) {
      // Modules folder might not exist yet
      const err = error as NodeJS.ErrnoException
      if (err.code !== 'ENOENT') {
        logger.error(`ModuleProvider discovery failed: ${err.message}`)
      }
    }
  }

  /**
   * The ready method is called after the app is ready
   */
  public async ready() {}

  /**
   * The shutdown method is called before the app shuts down
   */
  public async shutdown() {}
}

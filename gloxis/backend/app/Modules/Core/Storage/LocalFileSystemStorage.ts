import { type IStorageDriver } from './IStorageDriver.js'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'
import { join } from 'node:path'

export class LocalFileSystemStorage implements IStorageDriver {
  private get uploadPath() {
    return app.tmpPath('uploads')
  }

  async upload(filePath: string, destinationName: string, _contentType: string): Promise<string> {
    await fs.mkdir(this.uploadPath, { recursive: true })
    const finalPath = join(this.uploadPath, destinationName)

    // Copy instead of rename because the uploaded file might be locked by formidable or similar
    await fs.copyFile(filePath, finalPath)

    // Return relative URL or path
    return `/uploads/${destinationName}`
  }

  async delete(path: string): Promise<void> {
    try {
      const fileName = path.split('/').pop()
      if (!fileName) return
      const finalPath = join(this.uploadPath, fileName)
      await fs.unlink(finalPath)
    } catch (error) {
      // Ignore if file not found
    }
  }
}

import { type IStorageDriver } from './IStorageDriver.js'
import { LocalFileSystemStorage } from './LocalFileSystemStorage.js'

export class StorageFactory {
  static getStorage(): IStorageDriver {
    return new LocalFileSystemStorage()
  }
}

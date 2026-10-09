export interface IStorageDriver {
  /**
   * Uploads a file to the storage provider.
   * @param filePath Local path of the file to upload
   * @param destinationName The name of the file in the bucket/storage
   * @param contentType MIME type of the file
   * @returns The public URL or path of the uploaded file
   */
  upload(filePath: string, destinationName: string, contentType: string): Promise<string>

  /**
   * Deletes a file from the storage provider.
   * @param path The path or URL of the file to delete
   */
  delete(path: string): Promise<void>
}

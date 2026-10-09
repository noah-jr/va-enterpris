// ============================================================
// IFileStorage — Storage contract (MinIO / S3-compatible)
// ============================================================

export interface UploadFileParams {
  bucketName: string;
  objectName: string;
  buffer: Buffer;
  mimeType: string;
  size: number;
  metadata?: Record<string, string>;
}

export interface UploadFileResult {
  storagePath: string;
  etag: string;
}

export interface GetSignedUrlParams {
  bucketName: string;
  objectName: string;
  /** URL expiry in seconds */
  expiresIn: number;
}

export interface IFileStorage {
  upload(params: UploadFileParams): Promise<UploadFileResult>;
  getSignedUrl(params: GetSignedUrlParams): Promise<string>;
  delete(bucketName: string, objectName: string): Promise<void>;
  exists(bucketName: string, objectName: string): Promise<boolean>;
  ensureBucketExists(bucketName: string): Promise<void>;
  getObject(bucketName: string, objectName: string): Promise<Buffer>;
}

import { Client as MinioClient } from 'minio';
import type {
  IFileStorage,
  UploadFileParams,
  UploadFileResult,
  GetSignedUrlParams,
} from '../../application/contracts/index.js';

interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
}

export class MinioFileStorage implements IFileStorage {
  private readonly client: MinioClient;

  constructor(config: MinioConfig) {
    this.client = new MinioClient({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
  }

  async upload(params: UploadFileParams): Promise<UploadFileResult> {
    const result = await this.client.putObject(
      params.bucketName,
      params.objectName,
      params.buffer,
      params.size,
      {
        'Content-Type': params.mimeType,
        ...params.metadata,
      },
    );

    return {
      storagePath: `${params.bucketName}/${params.objectName}`,
      etag: result.etag,
    };
  }

  async getSignedUrl(params: GetSignedUrlParams): Promise<string> {
    return this.client.presignedGetObject(
      params.bucketName,
      params.objectName,
      params.expiresIn,
    );
  }

  async delete(bucketName: string, objectName: string): Promise<void> {
    await this.client.removeObject(bucketName, objectName);
  }

  async exists(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(bucketName, objectName);
      return true;
    } catch {
      return false;
    }
  }

  async ensureBucketExists(bucketName: string): Promise<void> {
    const exists = await this.client.bucketExists(bucketName);
    if (!exists) {
      await this.client.makeBucket(bucketName, 'eu-west-1');
    }
  }

  async getObject(bucketName: string, objectName: string): Promise<Buffer> {
    const stream = await this.client.getObject(bucketName, objectName);
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err: Error) => reject(err));
    });
  }
}

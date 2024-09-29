import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { injectable } from "inversify";
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/index';

@injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId!,
        secretAccessKey: config.aws.secretAccessKey!,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: config.aws.s3BucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return `https://${config.aws.s3BucketName}.s3.${config.aws.region}.amazonaws.com/${fileName}`;
  }
}
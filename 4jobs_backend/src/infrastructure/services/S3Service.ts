import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { injectable } from "inversify";
import { v4 as uuidv4 } from "uuid";


@injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    
    console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID, "AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set');

    this.bucketName = process.env.S3_BUCKET_NAME!;
    if (!this.bucketName) {
      console.warn("S3_BUCKET_NAME is not set in the process.envuration. Using default value '4jobs'.");
      this.bucketName = '4jobs';
    }
  }

  async uploadFile(file: Express.Multer.File | Buffer, mimeType?: string): Promise<string> {
    const key = `uploads/${uuidv4()}-${file instanceof Buffer ? 'resume.pdf' : file.originalname}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: file instanceof Buffer ? file : file.buffer,
      ContentType: file instanceof Buffer ? (mimeType || 'application/pdf') : file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw new Error("Failed to upload file to S3");
    }
  }

  async getFile(key: string): Promise<Buffer> {
    // Extract the actual key if a full URL is provided
    const actualKey = key.includes('https://') ? key.split('/').slice(3).join('/') : key;

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: actualKey,
    });

    try {
      const response = await this.s3Client.send(command);
      return Buffer.from(await response.Body!.transformToByteArray());
    } catch (error) {
      console.error("Error getting file from S3:", error);
      throw new Error("Failed to get file from S3");
    }
  }
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { injectable } from "inversify";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadFile(file: Express.Multer.File | Buffer, mimeType?: string): Promise<string> {
    const bucketName = process.env.AWS_BUCKET_NAME!;
    const key = `uploads/${uuidv4()}-${file instanceof Buffer ? 'resume.pdf' : file.originalname}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: file instanceof Buffer ? file : file.buffer,
      ContentType: file instanceof Buffer ? (mimeType || 'application/pdf') : file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      return `https://${bucketName}.s3.amazonaws.com/${key}`;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw new Error("Failed to upload file to S3");
    }
  }
}

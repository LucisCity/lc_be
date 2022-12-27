import * as AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { HeadObjectOutput } from 'aws-sdk/clients/s3';
import { AWSError } from 'aws-sdk/global';

/*
Usage:
const filebase = new FilebaseService(bucket_name)
 */

// https://docs.filebase.com/configurations/code-development/aws-sdk-javascript
// https://github.com/aws/aws-sdk-js-v3
export class S3Service {
  public s3: AWS.S3;
  public bucket: string;

  constructor(bucket: string, accessKey: string, accessSecret: string, region: string) {
    this.bucket = bucket; // process.env.IPFS_BUCKET
    const REGION = region;
    AWS.config.update({
      accessKeyId: accessKey,
      secretAccessKey: accessSecret,
    });
    this.s3 = new AWS.S3({
      params: { Bucket: bucket },
      region: REGION,
    });
  }

  /**
   *
   * @param filePath absolute path of the file in bucket, eg: /path/to/file/filename.png
   * @param fileContent
   * @param contentType eg: image/png
   * @param _bucket
   */
  async upload(filePath: string, fileContent: any, contentType: string, _bucket?: string): Promise<string> {
    const s3 = this.s3;
    let bucket = this.bucket;
    if (_bucket) {
      bucket = _bucket;
    }

    const params = {
      Bucket: bucket,
      Key: filePath,
      ContentType: contentType,
      Body: fileContent,
      // ACL: 'public-read',
    };

    const request = s3.putObject(params);
    return new Promise((resolve, reject) => {
      request.send((err, data) => {
        if (err) {
          console.log('S3 Error: ', err);
          reject(err);
        }
        const s3url = s3.getSignedUrl('getObject', { Key: params.Key });
        console.log('s3url: ', s3url);
        const uploadFileUrlS3 = s3url.split('?')[0];
        // console.log('upload_file_url, err, data: ', uploadFileUrlS3, err, data);

        resolve(uploadFileUrlS3);
      });
    });
  }

  async getObjectMeta(filePath: string): Promise<PromiseResult<HeadObjectOutput, AWSError>> {
    const bucket = this.bucket;

    const params = {
      Bucket: bucket,
      Key: filePath,
    };

    return this.s3.headObject(params).promise();
  }

  async getObjectCID(filePath: string): Promise<string> {
    const res = await this.getObjectMeta(filePath);
    return this.getObjectCIDFromMetadata(res);
  }

  getObjectCIDFromMetadata(metadata: PromiseResult<HeadObjectOutput, AWSError>): string {
    return metadata.Metadata.cid;
  }
}

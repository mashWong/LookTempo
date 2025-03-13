import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class B2Service {
    private authToken: string | null = null;
    private apiUrl: string | null = null;
    private bucketId: string | null = null;
    private accountId: string | null = null;

    constructor() {
        this.initialize().catch((err) => {
            console.error('初始化B2服务失败:', err);
        });
    }

    /**
     * 初始化服务：授权账户并获取存储桶信息
     */
    async initialize() {
        await this.authorizeAccount();
        await this.getBucketInfo();
    }

    /**
     * 授权账户以获取授权令牌和API URL
     */
    private async authorizeAccount() {
        const applicationKeyId = '004fc1d3a8d66eb0000000002';
        const applicationKey = 'K004LIhoUsuu2k151TRO0RWYMclEXk4';
        const credentials = Buffer.from(`${applicationKeyId}:${applicationKey}`).toString('base64');

        const response = await axios.get('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        })

        this.accountId = response.data.accountId;
        this.authToken = response.data.authorizationToken;
        this.apiUrl = response.data.apiInfo.storageApi.apiUrl;
        console.log('B2账户授权成功');
    }

    /**
     * 获取存储桶信息以获取bucketId
     */
    private async getBucketInfo() {
        if (!this.authToken || !this.apiUrl) {
            throw new Error('未完成账户授权');
        }

        const bucketName = 'LookTempo';
        const response = await axios.post(`${this.apiUrl}/b2api/v3/b2_list_buckets`, {
            accountId: this.accountId,
            bucketName,
        }, {
            headers: {
                Authorization: this.authToken,
            },
        })

        const bucket = response.data.buckets.find((b: any) => b.bucketName === bucketName);
        if (!bucket) {
            throw new Error(`未找到存储桶: ${bucketName}`);
        }

        this.bucketId = bucket.bucketId;
        console.log(`成功获取存储桶信息: ${bucketName} (ID: ${this.bucketId})`);
    }

    /**
     * 生成预签名URL
     * @param filePath 文件路径（如 "videos/sample.mp4"）
     * @param validDuration 有效期（秒）
     * @returns 预签名URL
     */
    async getPresignedUrl(filePath: string, validDuration: number = 3600): Promise<string> {
        if (!this.authToken || !this.apiUrl || !this.bucketId) {
            throw new Error('服务未正确初始化');
        }

        try {
            // 调用b2_get_download_authorization生成下载授权
            const response = await axios.post(`${this.apiUrl}/b2api/v3/b2_get_download_authorization`, {
                bucketId: this.bucketId,
                fileNamePrefix: filePath,
                validDurationInSeconds: validDuration,
            }, {
                headers: {
                    Authorization: this.authToken,
                },
            })

            const downloadAuthToken = response.data.authorizationToken;
            const downloadUrl = `${this.apiUrl}/file/LookTempo/${filePath}?Authorization=${downloadAuthToken}`;

            console.log(downloadUrl);
            return downloadUrl;
        } catch (error) {
            console.error(`生成预签名URL失败: ${error.message}`);
            throw new Error(`生成预签名URL失败: ${error.message}`);
        }
    }
}
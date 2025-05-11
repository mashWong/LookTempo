import axios from 'axios';
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class B2Service {
    private authToken: string | null = null;
    private apiUrl: string | null = null;
    private bucketId: string | null = null;
    private accountId: string | null = null;
    private cacheTTLBuffer = 60; // 缓存提前过期时间（秒）

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
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
    async getPresignedUrl(filePath: string, validDuration: number = 86400): Promise<string> {
        if (!this.authToken || !this.apiUrl || !this.bucketId) {
            throw new Error('服务未正确初始化');
        }

        // 生成唯一缓存键
        const cacheKey = `presigned:${filePath}:${validDuration}`;

        try {
            // 尝试从缓存获取
            const cachedUrl: string | undefined = await this.cacheManager.get(cacheKey);
            if (cachedUrl) {
                console.log(`[缓存命中] ${filePath}`);
                return cachedUrl;
            }
        } catch (error) {
            console.error('缓存读取失败，继续生成URL', error);
        }

        // 缓存未命中时生成新URL
        try {
            const response = await axios.post(
                `${this.apiUrl}/b2api/v3/b2_get_download_authorization`,
                {
                    bucketId: this.bucketId,
                    fileNamePrefix: filePath,
                    validDurationInSeconds: validDuration,
                },
                { headers: { Authorization: this.authToken } }
            );

            const downloadUrl = `${this.apiUrl}/file/LookTempo/${filePath}?Authorization=${response.data.authorizationToken}`;
            const ttl = Math.max(validDuration - this.cacheTTLBuffer, 60); // 确保最小缓存时间

            await this.cacheManager.set(cacheKey, downloadUrl, ttl * 1000);
            console.log(`[缓存存储] ${filePath} (有效至: ${new Date(Date.now() + ttl * 1000)})`);
            return downloadUrl;

        } catch (error) {
            console.error(`生成预签名URL失败: ${error.message}`);
            throw new Error(`生成预签名URL失败: ${error.message}`);
        }
    }

    // 按照文件名批量获取预签名URL
    async getBatchPresignedUrlsByNames(
        folderPath: string,
        fileNames: string[]
    ): Promise<Array<{ fileName: string; url: string }>> {
        // 规范化文件夹路径
        const normalizedFolder = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;

        // 添加缓存检查
        const cacheKey = `folder:${normalizedFolder}`;
        const cached: any[] | undefined = await this.cacheManager.get(cacheKey);

        // 显式声明data类型
        let data: { files: any[] };

        if (cached) {
            data = { files: cached };
        } else {
            const response = await axios.post(
                `${this.apiUrl}/b2api/v3/b2_list_file_names`,
                {
                    bucketId: this.bucketId,
                    prefix: normalizedFolder,
                    delimiter: '/',
                    maxFileCount: 1000
                },
                { headers: { Authorization: this.authToken } }
            );
            data = response.data;
            await this.cacheManager.set(cacheKey, data.files, 300_000); // 缓存5分钟
        }

        // 优化后的文件映射创建逻辑
        const fileMap = new Map<string, any>(
            data.files.map(file => {
                const cleanName = file.fileName
                    .replace(normalizedFolder, '')
                    .replace(/^\/+/, '') // 优化正则性能
                    .toLowerCase();
                return [cleanName, file];
            })
        );

        // 并行处理优化（修改循环部分）
        const result = await Promise.all(
            fileNames.map(async (originalName) => {
                const searchKey = originalName.replace(/^\//, '').toLowerCase();
                const file = fileMap.get(searchKey);

                return file
                    ? { fileName: originalName, url: await this.getPresignedUrl(file.fileName) }
                    : { fileName: originalName, url: '' };
            })
        );

        return result.filter(Boolean);
    }
}
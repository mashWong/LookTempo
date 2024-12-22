module.exports = {
    apps: [
        {
            name: 'looktempo', // 应用名称
            script: './dist/main.js', // 启动脚本路径
            instances: 'max', // 实例数量，'max' 表示根据 CPU 核心数自动分配
            autorestart: true, // 自动重启
            watch: false, // 是否启用文件监控并自动重启
            max_memory_restart: '1G', // 内存限制，超过此值会自动重启
            env: {
                NODE_ENV: 'development', // 开发环境
                PORT: 9000, // 端口号
            },
            env_production: {
                NODE_ENV: 'production', // 生产环境
                PORT: 9000, // 端口号
            },
        },
    ],
};
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
    turbotrace: {
      enabled: true,
    },
    optimizeCss: true,
    forceSwcTransforms: true,
  },
  distDir: '.next',
  output: 'standalone',
  poweredByHeader: false,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config, { dev, isServer }) => {
    // 添加调试日志
    console.log('Webpack config:', {
      cacheEnabled: !!config.cache,
      mode: config.mode,
      dev,
      isServer,
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        version: `${process.env.NODE_ENV}-${process.env.npm_package_version}`,
        cacheDirectory: path.resolve('.next/cache/webpack'),
        store: 'pack',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    return config;
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS,HEAD' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 
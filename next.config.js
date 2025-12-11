/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          pdf: {
            test: /[\\/]node_modules[\\/](pdf-lib|pdfjs-dist|jspdf)[\\/]/,
            name: 'pdf-libs',
            chunks: 'all',
          },
        },
      },
    };

    return config;
  },
  images: {
    unoptimized: true,
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'Local PDF Toolbox',
    NEXT_PUBLIC_VERSION: '1.0.0',
    NEXT_PUBLIC_MAX_FILE_SIZE: '104857600', // 100MB
  },
};

module.exports = nextConfig; 
